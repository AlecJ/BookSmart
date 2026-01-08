import uuid
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.models import (Book, BookChapter, BookChapterCreate,
                        ChapterQuestionCreate, ChapterQuestion)


'''
CRUD operations for Book
'''
# region BookCRUD


def create_book(*, session: Session, book_in: Book) -> Book:
    db_book = Book.model_validate(book_in)
    session.add(db_book)
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise e
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


def update_book():
    pass


def delete_book():
    pass

# endregion BookCRUD


'''
CRUD operations for BookChapter
'''
# region BookChapterCRUD


def create_book_chapter(*, session: Session, chapter_in: BookChapterCreate, book_id: uuid.UUID) -> BookChapter:
    db_book_chapter = BookChapter.model_validate(
        chapter_in, update={"book_id": book_id})
    session.add(db_book_chapter)
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise e
    session.refresh(db_book_chapter)
    return db_book_chapter


def get_book_chapters(*, session: Session) -> list[Book]:
    statement = select(Book)
    books = session.exec(statement).all()
    return books


def get_book_chapter_by_id(*, session: Session, chapter_id: int) -> BookChapter | None:
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


def create_chapter_question(*, session: Session, question_in: ChapterQuestionCreate, chapter_id: uuid.UUID) -> ChapterQuestion:
    db_question = ChapterQuestion.model_validate(
        question_in, update={"chapter_id": chapter_id})
    session.add(db_question)
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise e
    session.refresh(db_question)
    return db_question

# endregion ChapterQuestionCRUD
