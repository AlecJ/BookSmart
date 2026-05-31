import os
import json
from sqlmodel import Session
from app.core.db import engine


# read seed file
def get_settings(seed_file_name: str) -> dict:
    # Get the path to the seeds directory
    seeds_dir = '/app/seeds/'

    with open(seeds_dir + seed_file_name, 'r') as f:
        return json.load(f)


def seed_settings_db(session: Session):
    from app.models import Settings

    settings_data = get_settings(seed_file_name='settings.json')

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


def seed_books_db(session: Session):
    pass


def main():
    with Session(engine) as session:
        seed_settings_db(session)
        # seed_books_db(session)


if __name__ == "__main__":
    main()
