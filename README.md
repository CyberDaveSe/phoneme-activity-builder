# Phoneme Activity Builder

The Phoneme Activity Builder is a full-stack educational web application developed for CSE3CWA Cloud Web Applications. It is designed to support Speech Pathology students and teachers in creating phoneme-based Wordle and Word Search classroom activities.

The project extends the original frontend with a backend API, PostgreSQL database, Prisma ORM, persistent activity configurations, standalone activity generation, Docker deployment, operational monitoring, automated end-to-end testing, load testing, and accessibility evaluation.

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
- Healthcheck endpoint for API availability and PostgreSQL database connectivity.
- Docker-based frontend, API, and PostgreSQL deployment.
- Usage dashboard showing application activity and operational statistics.
- Usage event tracking for activity creation and generation outcomes.
- Successful and failed activity-generation monitoring.
- Automated end-to-end testing with Playwright.
- Load and performance testing with Apache JMeter.
- Accessibility evaluation with Lighthouse.

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

The healthcheck endpoint reports both API availability and database connectivity.

A healthy application returns HTTP `200 OK` with:

```json
{
  "status": "ok",
  "database": "connected"
}
```

This allows the application dashboard and external monitoring to verify that the API is responding and that the PostgreSQL database connection is operational.

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

## Dashboard and Observability

The application includes a dashboard for monitoring application usage and operational behaviour.

Usage events are recorded for significant application actions, allowing the dashboard to summarise activity including activity creation and HTML generation outcomes.

Dashboard information includes:

- total activities created
- Wordle and Word Search usage
- most-used activity type
- successful activity generations
- failed activity generations
- page usage and timing information
- application/API health information

Generation outcomes are recorded separately as successful or failed events. This allows generation problems to be visible through the dashboard rather than failing silently.

The monitoring implementation was verified using both successful activity generation and a deliberately induced generation failure. The controlled failure was recorded by the application and appeared in the dashboard's failed-generation statistics.

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

## Testing and Quality Assurance

### Playwright End-to-End Testing

Playwright is used to automate end-to-end browser testing of the application.

The test suite verifies core application behaviour including application loading and activity workflows. The Wordle activity-output test exercises the complete workflow by creating and saving an activity through the frontend, generating its standalone HTML output, loading the generated activity, playing the correct phoneme sequence, and confirming a successful result.

The complete Playwright test suite passes successfully.

### Apache JMeter Load Testing

Apache JMeter is used to evaluate API behaviour under increasing simulated load.

Load tests were performed using:

| Virtual Users | Requests | Errors |
|---:|---:|---:|
| 1 | 6 | 0 |
| 10 | 60 | 0 |
| 100 | 600 | 0 |
| 1,000 | 6,000 | 0 |
| 10,000 | 60,000 | 0 |

The 10,000-user test completed approximately 60,000 requests in two minutes at approximately 500 requests per second, with an average response time of approximately 5 ms and no request errors.

### Lighthouse Accessibility Testing

Lighthouse accessibility audits were performed on the main application interfaces.

Initial testing identified colour-contrast issues. The affected interface styles were corrected and the pages were retested.

Final accessibility scores:

| Page | Accessibility |
|---|---:|
| Dashboard | 100 |
| Words | 100 |
| Wordle | 100 |
| Word Search | 100 |

This testing was used not only as evidence of application quality but also to identify and correct accessibility problems in the final interface.

## Technologies

- Next.js
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Docker Compose
- Playwright
- Apache JMeter
- Lighthouse
- HTML
- CSS

## Assessment Development

This project was developed progressively through the CSE3CWA Cloud Web Applications assessments.

### Assessment 1

Assessment 1 established the frontend interface and initial Wordle and Word Search activity-builder experience.

### Assessment 2

Assessment 2 extended the application with:

- backend REST APIs
- PostgreSQL persistence
- Prisma database modelling
- CRUD operations
- database-driven activity generation
- standalone HTML output
- validation and error handling
- Docker deployment

### Assessment 3

Assessment 3 extends the production-ready application with:

- application usage monitoring and dashboard reporting
- operational health information
- activity-generation success and failure tracking
- automated Playwright end-to-end testing
- JMeter load testing
- Lighthouse accessibility testing
- accessibility improvements identified through testing
- expanded Wordle activity creation, persistence and download workflow
- verification of standalone generated activity behaviour

The project is maintained using Git and GitHub with development preserved through dedicated assessment branches and meaningful commits documenting the evolution of the application.