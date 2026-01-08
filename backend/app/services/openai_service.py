import uuid
from openai import OpenAI
from sqlmodel import Session, select

from app.models import Settings
from app import crud


client = OpenAI()
model = "gpt-5-nano"


def fetch_prompt_template(*, session: Session) -> str:
    statement = select(Settings).where(
        Settings.key == "openai_question_template"
    )
    openai_question_template = session.exec(statement).first()

    if not openai_question_template:
        raise KeyError("OpenAI question template not found in settings.")

    return openai_question_template.value


async def generate_chapter_question(*, session: Session, chapter_id: uuid.UUID) -> str:
    # Fetch chapter and book details
    chapter = crud.get_book_chapter_by_id(
        session=session, chapter_id=chapter_id)

    if not chapter:
        raise ValueError("Chapter not found.")

    book_title = chapter.book.title
    book_author = chapter.book.author
    chapter_title = chapter.title

    # Construct prompt
    prompt_template = fetch_prompt_template(session=session)
    book_details = f"Book Title: {book_title}\nAuthor: {book_author}\nChapter: {chapter_title}\n"
    input_text = prompt_template + book_details

    response = await generate_response(session=session, input_text=input_text)
    return response

"""
response looks like:

{
    "response": "- What is K.'s goal when he arrives in the village, and what obstacles to pursuing that goal are immediately introduced in the Arrival chapter?\n- How is the Castle’s bureaucracy depicted in the Arrival chapter, and what details create a sense of distance, ambiguity, and absurdity?\n- Which characters does K. meet in the village upon arrival, and what do their reactions reveal about who holds authority and how access to the Castle is controlled?"
}
"""


async def generate_response(*, session: Session, input_text: str) -> str:

    response = client.responses.create(
        model=model,
        input=input_text
    )
    return response.output_text
