# GameVault (Frontend)

Frontend application for **GameVault**, built with **React**, **Vite** and **Tailwind CSS**.

The app allows authenticated users to manage their personal video game collection.

---

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Fetch API

---

## Development

Install dependencies:

npm install

Start the development server:

npm run dev

---

## Build

Create a production build:

npm run build

---

## Deployment (GitHub Pages)

The production build (`dist/`) is deployed to the `gh-pages` branch using **gh-pages**.

---

## Features

- User authentication (login / signup)
- JWT-based session handling
- Protected routes
- CRUD games (REST API)
- User-specific data (each user only sees their own games)
- Filters, search and pagination
- Modal creation and inline editing
- Responsive UI with Tailwind CSS

---

## Notes

- Backend repository: `gamevault-backend` (Node.js, Express, Prisma, PostgreSQL)
- The frontend requires the backend API to be running
- Authentication token is stored client-side and attached to API requests

---

## Demo

![Demo](https://github.com/Martensq/game-vault/blob/main/docs/demo.gif?raw=true)