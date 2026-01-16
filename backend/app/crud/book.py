import uuid
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.models import (User, UserBookLink, Book, BookChapter, BookChapterCreate,
                        ChapterQuestionCreate, ChapterQuestion, UserResponse)


'''
CRUD operations for Book
'''
# region BookCRUD


def create_book(*, session: Session, book_in: Book) -> Book:
    db_book = Book.model_validate(book_in)
    session.add(db_book)
    session.commit()
    session.refresh(db_book)
    return db_book


def get_books(*, session: Session) -> list[Book]:
    statement = select(Book)
    books = session.exec(statement).limit(10).all()
    return books


def get_book_by_id(*, session: Session, book_id: int) -> Book | None:
    statement = select(Book).where(Book.id == book_id)
    book = session.exec(statement).first()
    return book


def get_book_by_google_book_id(*, session: Session, google_book_id: str) -> Book | None:
    statement = select(Book).where(Book.google_book_id == google_book_id)
    book = session.exec(statement).first()
    return book


def get_book_by_title_and_author(*, session: Session, title: str, author: str) -> Book | None:
    statement = select(Book).where(Book.author == author, Book.title == title)
    book = session.exec(statement).first()
    return book


def update_book():
    pass


def delete_book():
    pass

# endregion BookCRUD


'''
CRUD operations for BookLinks
'''
# region BookLinkCRUD


def create_book_link(*, session: Session, user_id: uuid.UUID, book_id: uuid.UUID) -> UserBookLink:
    user_book_link = UserBookLink(user_id=user_id, book_id=book_id)
    session.add(user_book_link)
    session.commit()
    session.refresh(user_book_link)
    return user_book_link


# endregion BookLinkCRUD


'''
CRUD operations for BookChapter
'''
# region BookChapterCRUD


def create_book_chapter(*, session: Session, chapter_in: BookChapterCreate, book_id: uuid.UUID) -> BookChapter:
    db_book_chapter = BookChapter.model_validate(
        chapter_in, update={"book_id": book_id})
    session.add(db_book_chapter)
    session.commit()
    session.refresh(db_book_chapter)
    return db_book_chapter


def get_book_chapters(*, session: Session) -> list[Book]:
    statement = select(Book)
    books = session.exec(statement).all()
    return books


def get_book_chapter_by_id(*, session: Session, chapter_id: uuid.UUID) -> BookChapter | None:
    statement = select(BookChapter).where(BookChapter.id == chapter_id)
    book = session.exec(statement).first()
    return book


# def update_book():
#     pass


# def delete_book():
#     pass

# endregion BookChapterCRUD


'''
CRUD operations for ChapterQuestion'''
# region ChapterQuestionCRUD


def get_chapter_question_by_id(*, session: Session, question_id: uuid.UUID) -> ChapterQuestion | None:
    statement = select(ChapterQuestion).where(
        ChapterQuestion.id == question_id)
    question = session.exec(statement).first()
    return question


def create_chapter_question(*, session: Session, question_in: ChapterQuestionCreate, chapter_id: uuid.UUID) -> ChapterQuestion:
    db_question = ChapterQuestion.model_validate(
        question_in, update={"chapter_id": chapter_id})
    session.add(db_question)
    session.commit()
    session.refresh(db_question)
    return db_question

# endregion ChapterQuestionCRUD


'''
CRUD operations for QuestionResponse'''
# region QuestionResponseCRUD


def get_user_response_for_question(*, session: Session, user_id: uuid.UUID, question_id: uuid.UUID) -> UserResponse | None:
    statement = select(UserResponse).where(UserResponse.user_id == user_id,
                                           UserResponse.question_id == question_id)
    user_response = session.exec(statement).first()
    return user_response


def create_user_response(*, session: Session, question_id: uuid.UUID, user_id: uuid.UUID, response_text: str) -> UserResponse:
    user_response = UserResponse(
        question_id=question_id,
        user_id=user_id,
        response_text=response_text
    )
    session.add(user_response)
    session.commit()
    session.refresh(user_response)
    return user_response
