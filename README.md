# DocScanner

DocScanner is a web application that allows users to upload documents, scan them for similar documents, and manage their credits. The application consists of a frontend built with React and a backend built with Express and SQLite.

## Features
+ User authentication and authorization
+ Document upload and scanning
+ Similar document retrieval
+ Credit management
+ Dark and light theme toggle

## Project Structure
    ```bash
    .vscode/
        tasks.json
    backend/
        .env
        DB/
            nodemon.json
            package.json
            src/
                db/
                    db.js
                    migrations.js
                index.js
                routes/
                    auth.js
                    credits.js
                    scan.js
                    uploads/
                    user.js
                utils/
                    jwt.js
    frontend/
        .env
        .gitignore
        eslint.config.js
        index.html
        package.json
        public/
        README.md
        src/
            App.tsx
            assets/
            context/
                AuthPro.tsx
            main.tsx
            pages/
                components/
                    Header.tsx
                    Login.tsx
                Home.tsx
                NotFound.tsx
            vite-env.d.ts
        tsconfig.app.json
        tsconfig.json
        tsconfig.node.json
        vite.config.ts
    ```

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/aluriDevAnanth/DocScanner.git
    cd DocScanner
    ```
2. Install dependencies for both frontend and backend:
    ```bash
    cd backend
    npm install
    cd ../frontend
    npm install
    ```
3. Set up environment variables:
    - Create a .env file in the backend directory with the following content:
    ```bash
    TOKEN_SECRET_KEY="your_secret_key"
    ```
    - Create a .env file in the frontend directory with the following content:
    ```bash
    BASE_URL='http://localhost:3000'
    ```

## Running the Application
1. Start the backend server:
    ```bash
    cd backend
    npm run dev
    ```
2. Start the frontend development server:
    ```bash
    cd frontend
    npm run dev
    ```
3. Open your browser and navigate to http://localhost:5173.
