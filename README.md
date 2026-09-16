# Phoneme Activity Builder

The Phoneme Activity Builder is a full-stack educational web application developed for CSE3CWA Cloud Web Applications. It is designed to support Speech Pathology students and teachers in creating phoneme-based Wordle and Word Search classroom activities.

The project extends the frontend developed in Assessment 1 by introducing a backend API, PostgreSQL database, Prisma ORM, persistent activity configurations, and Docker deployment.

## Repository

GitHub repository:

https://github.com/CyberDaveSe/phoneme-activity-builder

## Features

- Create, read, update, and delete phoneme-based words.
- Store ordered phoneme sequences for each word.
- Support multi-character phoneme symbols.
- Store optional hints and automatically assign difficulty according to phoneme count.
- Create and manage multiple Wordle and Word Search activity configurations.
- Generate activities using words stored in the database.
- Persist Word Search board configurations.
- Interactive Wordle and Word Search previews.
- Generate standalone downloadable HTML activities.
- Validation and error handling for word and activity data.
- Healthcheck endpoint for backend availability.
- Docker-based frontend, API, and PostgreSQL deployment.

## Architecture

The application uses a three-tier architecture:

```text
Frontend
Next.js / React
Port 3000
    |
    | HTTP API requests
    v
Backend API
Next.js server routes
Port 3001
    |
    | Prisma ORM
    v
PostgreSQL Database
Port 5432
```

The frontend communicates with the backend through API routes. The backend uses Prisma ORM to access PostgreSQL. This separates the user interface, application logic, and persistent data layers.

## Project Structure

```text
phoneme-activity-builder/
|
|-- frontend/              Next.js frontend application
|   |-- src/
|   |   |-- app/           Application pages
|   |   |-- components/    Reusable UI and activity components
|   |   |-- data/          Phoneme definitions
|   |   `-- utils/         HTML activity generators
|   `-- Dockerfile
|
|-- api/                   Next.js backend application
|   |-- app/
|   |   |-- api/           API routes
|   |   `-- generated/     Generated Prisma client
|   |-- prisma/
|   |   |-- migrations/    Database migrations
|   |   `-- schema.prisma  Database schema
|   `-- Dockerfile
|
|-- docker-compose.yml
`-- README.md
```

## Database Model

The database is implemented using PostgreSQL and Prisma.

The main data models are:

### Word

Stores the English word, optional hint, difficulty level, timestamps, phoneme relationships, and activity relationships.

### WordPhoneme

Stores each phoneme belonging to a word.

Phonemes are stored as strings rather than individual characters, allowing multi-character phoneme symbols to be represented correctly. A position value preserves the order of phonemes within each word.

### Activity

Stores saved activity configurations including:

- activity name
- activity type (`WORDLE` or `WORD_SEARCH`)
- difficulty
- hint setting
- generated board configuration
- timestamps

### ActivityWord

Provides the relationship between saved activities and database words, allowing multiple words and multiple activity configurations to be managed.

## Word Difficulty

Word difficulty is determined by the number of phonemes:

| Phoneme Count | Difficulty |
|---|---|
| 3 | Easy |
| 4 | Medium |
| 5 | Hard |

Words used by the activity builders are retrieved from the database rather than being limited to fixed frontend examples.

## API

The backend provides REST-style API routes for words and activities.

### Words

```text
GET     /api/words
POST    /api/words
GET     /api/words/:id
PATCH   /api/words/:id
DELETE  /api/words/:id
```

These routes support creation, retrieval, editing, and deletion of words and their ordered phoneme data.

### Activities

```text
GET     /api/activities
POST    /api/activities
GET     /api/activities/:id
PATCH   /api/activities/:id
DELETE  /api/activities/:id
```

These routes support multiple stored Wordle and Word Search configurations.

### Healthcheck

```text
GET /health
```

A successful request returns HTTP `200 OK` with:

```json
{
  "status": "ok"
}
```

## Docker

The complete application can be run using Docker Compose.

Three services are used:

- `frontend` - Next.js user interface
- `api` - Next.js backend API and Prisma
- `db` - PostgreSQL database

A named Docker volume provides persistent PostgreSQL storage.

### Start the Application

From the project root:

```bash
docker compose up --build -d
```

The application will then be available at:

```text
Frontend:   http://localhost:3000
API:        http://localhost:3001
Health:     http://localhost:3001/health
PostgreSQL: localhost:5432
```

Check container status with:

```bash
docker compose ps
```

Stop the application with:

```bash
docker compose down
```

Database data is retained in the named PostgreSQL volume when the containers are stopped.

## Prisma Migrations

Prisma migrations are stored in:

```text
api/prisma/migrations/
```

When the API Docker container starts, it runs:

```bash
npx prisma migrate deploy
```

before starting the Next.js API server.

This applies any pending database migrations and allows the database schema to be created consistently when the application is deployed with a new PostgreSQL database.

The migration status can be checked while Docker is running with:

```bash
docker compose exec api npx prisma migrate status
```

## Local Development

The frontend and API can also be run separately during development.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

### Backend

A PostgreSQL database and valid `DATABASE_URL` must be available before starting the API.

```bash
cd api
npm install
npx prisma generate
npm run dev -- -p 3001
```

The API runs on:

```text
http://localhost:3001
```

## Environment Configuration

The API requires a PostgreSQL connection string using the `DATABASE_URL` environment variable.

Docker Compose supplies the database connection information to the API container.

The frontend uses `API_BASE_URL` to identify the backend API. When running through Docker Compose, the frontend communicates with the API through the Docker network.

Environment-specific values should not be committed to the repository in `.env` files.

## Activity Generation

Both activity types use stored database content.

### Wordle

A teacher can select a stored target word or create a new database word from the Wordle builder. The ordered phoneme sequence drives the Wordle board and gameplay.

Saved Wordle activities can be exported as standalone HTML files for classroom use.

### Word Search

Teachers can select multiple stored words, configure an activity, generate a phoneme-based board, and save the resulting configuration.

The generated board is persisted with the activity so that reopening a saved activity retrieves the same configuration.

Saved Word Search activities can also be exported as standalone HTML files.

## Validation and Error Handling

The application validates word and activity data before it is stored.

Examples include:

- required word values
- valid phoneme sequences
- supported phoneme counts
- valid difficulty levels
- valid activity types
- required activity data
- missing database records

The frontend displays appropriate error messages when invalid data is submitted or API operations fail.

## Technologies

- Next.js
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Docker Compose
- HTML
- CSS

## Assessment Development

This project was developed as part of CSE3CWA Cloud Web Applications.

Assessment 1 established the frontend interface and activity-builder experience.

Assessment 2 extends the application with:

- backend APIs
- PostgreSQL persistence
- Prisma database modelling
- CRUD operations
- database-driven activity generation
- standalone HTML output
- validation and error handling
- Docker deployment

The project is maintained using Git and GitHub with Assessment 1 preserved on the main branch and Assessment 2 development maintained through a dedicated assessment branch.