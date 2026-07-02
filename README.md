## Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env`.

4. Update the values with your own MongoDB Atlas, PostgreSQL, Redis, and JWT credentials.

5. Run the migrations:

```bash
npx knex migrate:latest
```

6. Run the seed file:

```bash
npx knex seed:run
```

7. Start the application:

```bash
npm start
```
