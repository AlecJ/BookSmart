from app.api.deps import SessionDep, CurrentUser
from app import crud
from app.models import (BookWithChapters, BookChapter,
                        BookChapterPublic, ChapterQuestionPublic)


def add_status_to_book() -> BookWithChapters:
    pass


def add_computed_status_to_chapter_questions(*, session: SessionDep, current_user: CurrentUser, chapter: BookChapter) -> BookChapterPublic:
    # Skip chapters that have not generated questions
    if not chapter.questions:
        return BookChapterPublic(**chapter.model_dump(), status=None, questions=[])

    questions_with_status = []
    chapter_status = None
    for q in chapter.questions:
        # Get user response to determine status (feedback_grade)
        user_response = crud.get_user_response_for_question(
            session=session, user_id=current_user.id, question_id=q.id)
        status = user_response.feedback_grade if user_response else None

        # Feedback grade is either, None, 0, 1, or 2
        if status is not None and chapter_status is None:
            chapter_status = status
        elif status is not None:
            chapter_status = min(chapter_status, status)
        # if chapter_status is not none and status is none (not answered), mark as partial complete
        elif status is None and chapter_status is not None:
            chapter_status = min(chapter_status, 1)

        questions_with_status.append(ChapterQuestionPublic(
            **q.model_dump(), status=status))

    return BookChapterPublic(**chapter.model_dump(), status=chapter_status, questions=questions_with_status)
