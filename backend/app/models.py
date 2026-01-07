import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

'''
This book reading and comprehension application consists of the following models:

Users who will add and manage books on their accounts.

Books that contain multiple chapters.

Chapters within books that can have multiple questions.

Chapter questions that will have text.

User responses to chapter questions, including feedback and grading.
'''


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    email: EmailStr = Field(index=True, unique=True, max_length=255)
    hashed_password: str
    books: list["Book"] = Relationship()


class Book(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    chapters: list["BookChapter"] = Relationship(
        back_populates="book", cascade_delete=True)


class BookChapter(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    book_id: uuid.UUID = Field(foreign_key="book.id")
    book: Book = Relationship(back_populates="chapters")
    questions: list["ChapterQuestion"] = Relationship(
        back_populates="chapter", cascade_delete=True)


class ChapterQuestion(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    question_text: str = Field()
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
