import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

'''
This book reading and comprehension application consists of the following models:

Users who will add and manage books on their accounts.

Books that contain multiple chapters.

Chapters within books that can have multiple questions.

Chapter questions that will have text.

User responses to chapter questions, including feedback and grading.
'''


class UserBase(SQLModel):
    email: EmailStr = Field(index=True, unique=True, max_length=255)


class UserRegister(SQLModel):
    email: EmailStr = Field(index=True, unique=True, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    books: list["UserBookLink"] = Relationship(
        back_populates="user", cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID


class Book(SQLModel, table=True):
    __table_args__ = (UniqueConstraint(
        "title", "author", name="uq_book_title_author"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    google_book_id: str = Field(unique=True, nullable=True)
    title: str = Field(index=True)
    author: str = Field(index=True)
    description: str = Field()
    image_url: str = Field(default="")
    chapters: list["BookChapter"] = Relationship(
        back_populates="book", cascade_delete=True)


class UserBookLink(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    book_id: uuid.UUID = Field(foreign_key="book.id", primary_key=True)

    user: User = Relationship(back_populates="books")
    book: Book = Relationship()


class BookChapterBase(SQLModel):
    title: str = Field(index=True)


class BookChapterCreate(BookChapterBase):
    pass


class BookChapter(BookChapterBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    book_id: uuid.UUID = Field(foreign_key="book.id")
    book: Book = Relationship(back_populates="chapters")
    questions: list["ChapterQuestion"] = Relationship(
        back_populates="chapter", cascade_delete=True)


class ChapterQuestionBase(SQLModel):
    question_text: str = Field(unique=True, index=True)


class ChapterQuestionCreate(ChapterQuestionBase):
    pass


class ChapterQuestion(ChapterQuestionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    chapter_id: uuid.UUID = Field(foreign_key="bookchapter.id")
    chapter: BookChapter = Relationship(back_populates="questions")
    responses: list["UserResponse"] = Relationship(
        back_populates="question", cascade_delete=True)


class UserResponse(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship()
    question_id: uuid.UUID = Field(foreign_key="chapterquestion.id")
    question: ChapterQuestion = Relationship(back_populates="responses")
    response_text: str = Field()
    feedback_text: str = Field()
    feedback_grade: int = Field()  # 0 = incorrect, 1 = partially correct, 2 = correct


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class Settings(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str = Field()
    data_type: str = Field()  # e.g., 'string', 'integer', 'boolean'
