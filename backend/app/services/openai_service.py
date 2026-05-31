import uuid
import sentry_sdk
from openai import OpenAI
from sqlmodel import Session, select

from app.models import Settings, UserResponse, UserResponseFeedback
from app import crud
from app.core.config import settings
from app.utils import logger


client = OpenAI()
model = "gpt-5-nano"


def fetch_prompt_template(*, session: Session, key: str) -> str:
    statement = select(Settings).where(
        Settings.key == key
    )
    openai_question_template = session.exec(statement).first()

    if not openai_question_template:
        raise KeyError("OpenAI question template not found in settings.")

    return openai_question_template.value


async def generate_response(*, session: Session, input_text: str) -> str:
    with sentry_sdk.start_span(op="ai.request", name="OpenAI Call") as span:
        span.set_data("ai.request.model", model)
        span.set_data("ai.request.input_text", input_text)

        try:
            response = client.responses.create(
                model=model,
                input=input_text
            )

            response_text = response.output_text

            if settings.ENVIRONMENT == "development":
                span.set_data("ai.request.response_text", response_text)
            else:
                span.set_data("ai.request.response_text", response_text[:100])

            return response_text

        except Exception as e:
            logger.error(
                f"OpenAI API call failed: {str(e)}",
                extra={
                    "ai.request.model": model,
                    "ai.request.input_text": input_text,
                    "ai.request.error": str(e)
                },
                exc_info=True
            )
            raise


# TODO prompt is hard coded to generate 3 questions for now
async def generate_chapter_question(*, session: Session, chapter_id: uuid.UUID) -> str:
    # Get book details
    chapter = crud.get_book_chapter_by_id(
        session=session, chapter_id=chapter_id)

    if not chapter:
        logger.error(f"Chapter not found", extra={
                     "chapter_id": str(chapter_id)})
        raise ValueError("Chapter not found.")

    book_title = chapter.book.title
    book_author = chapter.book.author
    chapter_title = chapter.title

    # Fetch prompt and construct final input text
    prompt_template = fetch_prompt_template(
        session=session, key="openai_question_template")
    book_details = f"\nBook Title: {book_title}\nAuthor: {book_author}\nChapter: {chapter_title}\n"
    input_text = prompt_template + book_details

    logger.info(
        "Generating chapter questions",
        extra={
            "book_title": book_title,
            "book_author": book_author,
            "chapter_title": chapter_title
        }
    )

    response = await generate_response(session=session, input_text=input_text)

    if settings.ENVIRONMENT == "development":
        logger.info(
            "OpenAI response",
            extra={"response": response}
        )

    return response


async def evaluate_user_response(*, session: Session, user_response: UserResponse) -> UserResponseFeedback:
    # Get book details
    question = crud.get_chapter_question_by_id(
        session=session, question_id=user_response.question_id)
    if not question:
        raise ValueError("Chapter question not found.")

    chapter = question.chapter
    book_title = chapter.book.title
    book_author = chapter.book.author
    chapter_title = chapter.title

    # Fetch prompt and construct final input text
    prompt_template = fetch_prompt_template(
        session=session, key="openai_feedback_template")
    book_details = f"Book Title: {book_title}\nAuthor: {book_author}\nChapter: {chapter_title}\n"
    user_response_details = f"QUESTION: {question.question_text}\nSTUDENT RESPONSE: {user_response.response_text}\n"

    input_text = "PROMPT_INSTRUCTIONS: " + prompt_template + \
        '\n\n' + book_details + user_response_details

    response = await generate_response(session=session, input_text=input_text)

    # Process response into a dict
    parts = response.split("Grade:")
    feedback_text = parts[0].replace("Feedback:", "").strip()
    feedback_grade = int(parts[1].strip())

    return {feedback_text: feedback_text, feedback_grade: feedback_grade}
