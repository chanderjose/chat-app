# Backend

This is the backend server for the chat app. It provides authentication, user state, and Socket.IO messaging for the frontend.

## 🚀 How to Run the Backend

1. Open a terminal in the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The backend will run on `http://localhost:3000` by default.

## 🧩 What It Does

- Provides login, refresh, and logout endpoints.
- Manages JWT access tokens and refresh tokens.
- Tracks active users and broadcasts connection events.
- Uses Socket.IO for real-time chat messaging.

## ⚙️ Config

The backend reads configuration from environment variables:

- `PORT` — server port (default: `3000`)
- `ACCESS_TOKEN_SECRET` — JWT access token secret
- `REFRESH_TOKEN_SECRET` — JWT refresh token secret

A simple `.env` file can be added in the `backend` folder if you want to override defaults.

## 📡 API Endpoints

- `GET /` — health check (`{ status: 'Running' }`)
- `POST /api/auth/login` — login with `{ username }`
- `POST /api/auth/refresh` — refresh access token using HTTP-only cookie
- `POST /api/auth/logout` — log out (requires `Authorization: Bearer <token>`)
- `GET /api/users` — list active users (requires `Authorization: Bearer <token>`)

## 💬 Socket.IO

The frontend connects to Socket.IO using the access token in the handshake auth.

Events:

- `user_connected`
- `user_disconnected`
- `message`

## 🔧 Notes

The backend is configured to allow CORS requests from `http://localhost:5173`, which is where the frontend runs in development.
