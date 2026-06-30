import json
from sqlmodel import Session, select
from app.core.db import engine
from app.models import Settings, Book, BookChapter, ChapterQuestion


# read seed file
def get_seed_data(seed_file_name: str) -> dict:
    # Get the path to the seeds directory
    seeds_dir = '/app/seeds/'

    with open(seeds_dir + seed_file_name, 'r') as f:
        return json.load(f)


def seed_settings_db():
    with Session(engine) as session:
        settings_data = get_seed_data(seed_file_name='settings.json')

        result_count = 0

        for setting in settings_data:
            existing_setting = session.get(Settings, setting["key"])
            if not existing_setting:
                new_setting = Settings(
                    key=setting["key"], value=setting["value"], data_type=setting["data_type"])
                session.add(new_setting)
                result_count += 1

        print(f"Seeded {result_count} settings.")
        session.commit()


def seed_books_db():
    with Session(engine) as session:
        books_data = get_seed_data(seed_file_name='books.json')

        result_count = 0
        
        for book in books_data:
            existing_book = session.exec(select(Book).where(Book.google_book_id == book["google_book_id"])).first()
            if not existing_book:
                new_book = Book(
                    title=book["title"],
                    author=book["author"],
                    description=book["description"],
                    image_url=book["image_url"],
                    google_book_id=book["google_book_id"]
                )
                session.add(new_book)
                # session.commit()  # Commit to get the book ID
                result_count += 1

        print(f"Seeded {result_count} books.")
        session.commit()
