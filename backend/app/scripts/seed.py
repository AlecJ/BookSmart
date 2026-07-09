import json
from pathlib import Path
from sqlmodel import Session
from app.core.db import engine
from app.models import Settings, Book
from app import crud

SEEDS_DIR = Path(__file__).parent.parent.parent / "seeds"


# read seed file
def get_seed_data(seed_file_name: str) -> dict:
    with open(SEEDS_DIR / seed_file_name, 'r') as f:
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
            existing_book = crud.get_book_by_google_book_id(session=session, google_book_id=book["google_book_id"])
            
            if not existing_book:
                crud.create_book(session=session, book_in=Book(
                    title=book["title"],
                    author=book["author"],
                    description=book["description"],
                    image_url=book["image_url"],
                    google_book_id=book["google_book_id"]
                ))
                result_count += 1

        print(f"Seeded {result_count} books.")
