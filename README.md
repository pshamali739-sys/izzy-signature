# Izzy Signature Order System

A full-stack product ordering system with a customer-facing form, REST API, and an admin dashboard.

## Tech Stack
- **Frontend:** React + Vite (Plain CSS, Glassmorphic UI)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **Auth:** JWT

## Setup & Running Locally

This project is a monorepo containing two sub-projects: `server/` and `client/`. You need two terminal tabs to run them.

### 1. Start the Server (Backend)

Open Terminal Tab 1:
```bash
cd server
npm install

# Setup environment variables
cp .env.example .env

# Seed the database with the default admin user
npm run seed

# Start the dev server
npm run dev
```
The server will run on `http://localhost:3001`.

### 2. Start the Client (Frontend)

Open Terminal Tab 2:
```bash
cd client
npm install

# Start the Vite dev server
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Default Admin Credentials
If you ran `npm run seed` with the default `.env.example`, use:
- **Email:** `admin@izzy.com`
- **Password:** `izzy2024!`

Go to `http://localhost:5173/admin/login` to access the dashboard.
