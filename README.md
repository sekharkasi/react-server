This project is a full-stack application built with:

- **React** (Client)
- **Node.js / Express** (Server)
- **TypeORM + PostgreSQL** (Database)

Steps to run this project:

## 🚀 Getting Started

### 1. Clone the Repository

````bash
git clone https://github.com/your-username/your-project.git
cd your-project


## database setup

1. Ensure postgre sql is installed and running
2. Create the database (if not created already)

   ```bash
   createdb reactdemo
````

3. Run schema and seed scripts:
   psql -U postgres -d reactdemo -f db/schema.sql
   psql -U postgres -d reactdemo -f db/seed.sql

4. Run `npm i` command
5. Setup database settings inside `data-source.ts` file
6. Run `npm start` command
