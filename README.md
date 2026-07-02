# 🌍 WanderLog

WanderLog is a full-stack travel journaling and trip-planning application. Users can log travel memories with photos and locations, plan multi-stop trips on an interactive map, get AI-powered travel recommendations, and let the app automatically optimize the order of their stops.

## ✨ Features

- **Travel Journal** — Create, edit, and browse journal entries with images, ratings, and location tagging. Search entries by country, rating, or keyword.
- **Trip Planning** — Build multi-stop trips on an interactive map (Leaflet) and save planned routes.
- **Route Optimization** — A custom nearest-neighbor algorithm reorders trip stops to minimize total travel distance.
- **AI Travel Advice** — Integrates with the Google Gemini API to generate personalized travel recommendations.
- **Authentication & Authorization** — JWT-based stateless authentication with role-based access control (`USER` / `ADMIN`).
- **Admin Panel** — Manage users and moderate journal entries.
- **Image Uploads** — Attach photos directly to journal entries via multipart form uploads.

## 🛠️ Tech Stack

**Backend**
- Java 21, Spring Boot 3.4
- Spring Security + JWT (`jjwt`)
- Spring Data JPA, H2 Database
- springdoc-openapi (Swagger UI)
- Maven

**Frontend**
- React 19 + TypeScript
- Vite
- Redux Toolkit
- MUI (Material UI)
- React Router
- Leaflet / React-Leaflet (maps)
- React Hook Form

## 📁 Project Structure

```
WanderLog-Project/
├── backend/WanderLog/        # Spring Boot API
│   └── src/main/java/com/example/wanderlog/
│       ├── Controller/        # REST endpoints
│       ├── Services/          # Business logic (AI, route optimization, etc.)
│       ├── Entities/          # JPA entities
│       ├── Repositories/      # Spring Data repositories
│       ├── dto/                # Data transfer objects + mappers
│       └── security/           # JWT filter, security config
└── frontend/wanderlog/        # React + TypeScript client
    └── src/
        ├── app/api/            # RTK Query API slices
        ├── components/         # Reusable UI components
        ├── pages/               # Route-level pages
        └── features/            # Redux slices
```

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven
- Node.js 18+

### Backend
```bash
cd backend/WanderLog
./mvnw spring-boot:run
```
The API starts on `http://localhost:8080`. API docs are available via Swagger UI once running.

### Frontend
```bash
cd frontend/wanderlog
npm install
npm run dev
```
The app starts on `http://localhost:5173`.

### Configuration
The backend expects the following properties (e.g. in `application.properties` or as environment variables):
```
gemini.api.key=<your-gemini-api-key>
gemini.api.url=<gemini-endpoint-url>
```

## 🔑 API Overview

| Resource | Base Path | Description |
|---|---|---|
| Auth | `/users/register`, `/users/login` | Register and log in users |
| Journals | `/journals` | CRUD for journal entries, image upload, search |
| Trips | `/api/trips` | Save and manage planned trips, route optimization, AI advice |
| Locations | `/locations` | Manage saved locations |
| Admin | `/api/admin` | User and content management (admin only) |

## 📌 Notes

This project was built as a personal full-stack project to practice end-to-end development: secure authentication, relational data modeling, third-party AI integration, and a custom optimization algorithm — alongside a modern, typed React frontend.
