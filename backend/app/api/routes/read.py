import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.api.deps import SessionDep, CurrentUser
from app import crud
from app.services.openai_service import generate_chapter_question, evaluate_user_response
from app.models import (User, Book, UserBookLink, BookWithChapters, BookChapter,
                        ChapterQuestion, BookChapterPublic, ChapterQuestionCreate, ChapterQuestionPublic, UserResponseCreate)

router = APIRouter(prefix="/read", tags=["read"])


"""
These endpoints are for fetching a user's books and related data.
"""


@router.get(
    "/"
)
def get_books_for_user(*, session: SessionDep, current_user: CurrentUser) -> list[Book]:
    """
    Get all books in the user's library.
    """
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_links = user.books
    user_links.sort(key=lambda link: link.last_updated, reverse=True)
    user_books = [link.book for link in user.books]

    return user_books


@router.get(
    "/book/{book_id}"
)
def get_book_details_for_user(*, session: SessionDep, current_user: CurrentUser, book_id: uuid.UUID) -> BookWithChapters:
    """
    Return book details and user related data for a specific book in the user's library.
    """
    # First verify the user has this book in their library
    user_link = session.exec(
        select(UserBookLink).where(
            UserBookLink.user_id == current_user.id,
            UserBookLink.book_id == book_id
        )
    ).first()

    if not user_link:
        raise HTTPException(
            status_code=404, detail="Book not found in user's library")

    # Now fetch the book with chapters eager loaded
    user_book = session.exec(
        select(Book)
        .where(Book.id == book_id)
        .options(
            selectinload(Book.chapters)
            .selectinload(BookChapter.questions)
        )
    ).first()

    if not user_book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Build response with status set to 'complete' for all chapters
    return BookWithChapters(
        id=user_book.id,
        google_book_id=user_book.google_book_id,
        title=user_book.title,
        author=user_book.author,
        description=user_book.description,
        image_url=user_book.image_url,
        chapters=[
            {
                "id": chapter.id,
                "book_id": chapter.book_id,
                "title": chapter.title,
                "status": "incomplete",
                "questions": chapter.questions,
            }
            for chapter in user_book.chapters
        ]
    )


@router.post(
    "/addBook"
)
def add_book_to_user_library(*, session: SessionDep, current_user: CurrentUser, book_id: uuid.UUID) -> Book:
    """
    Add a book to the user's library.
    """
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Check if the link already exists
    existing_link = session.exec(
        select(UserBookLink).where(
            UserBookLink.user_id == user.id,
            UserBookLink.book_id == book.id
        )
    ).first()
    if existing_link:
        raise HTTPException(
            status_code=400, detail="Book already in user's library")

    # Create link
    user_book_link = crud.create_book_link(
        session=session, user_id=current_user.id, book_id=book_id)

    return user_book_link.book


@router.get('/chapter/{chapter_id}/questions')
async def get_or_generate_chapter_questions(*, session: SessionDep, current_user: CurrentUser, chapter_id: uuid.UUID) -> BookChapterPublic:
    """
    Get or generated questions for a given chapter.
    """
    chapter = crud.get_book_chapter_by_id(
        session=session, chapter_id=chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # If questions already exist, return them
    if chapter.questions:
        return chapter

    # Otherwise, generate questions using OpenAI service
    questions = await generate_chapter_question(session=session, chapter_id=chapter_id)
    # split questions and create ChapterQuestion entries for each
    print(questions)
    for question in questions.split('\n'):
        question_in = ChapterQuestionCreate(
            question_text=question.strip('- ').strip()
        )
        crud.create_chapter_question(
            session=session, question_in=question_in, chapter_id=chapter_id)

    session.refresh(chapter)
    questions_with_status = [ChapterQuestionPublic(
        from_orm=q, status="incomplete") for q in chapter.questions]

    return BookChapterPublic(from_orm=chapter, status="complete", questions=questions_with_status)


@router.get('/question/{question_id}')
def get_user_response(*, session: SessionDep, current_user: CurrentUser, question_id: uuid.UUID):
    """
    Get a user's response to a chapter question.
    """
    user_response = crud.get_user_response_for_question(
        session=session, user_id=current_user.id, question_id=question_id)

    if not user_response:
        raise HTTPException(status_code=404, detail="User response not found")

    return user_response


@router.post('/question/{question_id}')
async def submit_user_response(*, session: SessionDep, current_user: CurrentUser, question_id: uuid.UUID, response_in: UserResponseCreate):
    """
    Submit a user's response to a chapter question.
    """
    question = crud.get_chapter_question_by_id(
        session=session, question_id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # if user response already exists for this question and user, replace it
    existing_response = crud.get_user_response_for_question(
        session=session, user_id=current_user.id, question_id=question_id)
    if existing_response:
        session.delete(existing_response)
        session.commit()

    user_response = crud.create_user_response(
        session=session,
        question_id=question_id,
        user_id=current_user.id,
        response_text=response_in.response_text
    )

    # send to OpenAI for analysis or feedback
    feedback_text, feedback_grade = await evaluate_user_response(session=session, user_response=user_response)

    # update user response with feedback
    user_response.feedback_text = feedback_text
    user_response.feedback_grade = feedback_grade
    session.add(user_response)
    session.commit()
    session.refresh(user_response)

    return user_response
