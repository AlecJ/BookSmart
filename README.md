# BookSmart

BookSmart is a companion app for readers that enhances comprehension with chapter-end quizzes and feedback via ChatGPT.

Front End: Expo, React Native, TypeScript
Back End: FastAPI, PostgreSQL

## Run Locally

See individual README in frontend/ and backend/ for info on running each.

## Swagger Docs

## ToDo

- EX (Dune) - chapters are in spanish? B1hSG45JCX4C

- find way to poll or prompt user to reload question generation
- questions can take too long to load (usually associated with a bad question)

- submitting for feedback times out

- how is a question with no text getting into the db
- how do I handle the error gracefully
- the call takes a number of questions and if fewer than two questions exist, get up to 3 questions
- retry immediately?

- error when question text is blank (handle gracefully)
- login error text if backend is down
- telemetry for requests

- timeout on question submit
- hide feedback until new feedback is in
- update grade on chapter view

- redo login/register page

- polish frontends
- test very big resolution

- seed script
- deploy
- tests
- add tests to deploy process

- do not allow adding a book already in library
- remove books from library?
- mark section as complete

- report questions
- user balance for generating questions?

- publish on app store
