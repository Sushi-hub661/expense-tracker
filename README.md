# Expense Tracker

A full-stack Expense Tracker web application built with React, Laravel, and MySQL. It helps users manage their income, expenses, budgets, and financial reports.

## Features

- User registration, login, and logout
- Secure authentication and protected pages
- Dashboard with financial summaries
- Income and expense management (CRUD)
- Category management (CRUD)
- Monthly budget management (CRUD)
- Budget spending progress tracking
- Financial reports and charts
- Search, filter, and sort transactions
- Currency settings
- User-specific data protection

## Tech Stack

**Frontend**
- React
- Vite
- Bootstrap 5
- Axios
- Recharts

**Backend**
- PHP
- Laravel
- Laravel Sanctum

**Database**
- MySQL

## Project Structure

```text
Expense-Tracker/
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── ...
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Expense-Tracker
```

### 2. Backend setup

```bash
cd backend
composer install
```

Copy `.env.example` to `.env`, then configure your MySQL database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=expense_tracker
DB_USERNAME=root
DB_PASSWORD=
```

Generate the application key and run migrations:

```bash
php artisan key:generate
php artisan migrate
php artisan serve --host=localhost --port=8000
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

http://localhost:5173

## Security

- Authentication using Laravel Sanctum
- Protected API routes
- Users can only access their own private transactions and budgets
- Backend assigns ownership using the authenticated user
- Unauthorized access to another user's transaction returns HTTP 404

## Future Improvements

- Export reports to PDF or Excel
- Add recurring transactions
- Add financial notifications

## Author

Full-stack development portfolio project.
