# 🔗 Short.ly - Modern URL Shortener & Analytics Platform

Short.ly is a premium, full-stack URL shortener application featuring a sleek glassmorphic dark-mode user interface, real-time analytics tracking, high-performance Redis-backed redirection caching, and a comprehensive administration control panel.

---

## 🚀 Key Features

### 👤 User Features
- **Instant URL Shortening**: Paste long URLs and instantly generate highly readable short codes.
- **Custom Aliases**: Define custom slugs for branded short URLs (e.g. `short.ly/my-docs`) with reserved-word validation.
- **Auto-Expiration**: Links automatically expire and purge after 7 days (managed via MongoDB TTL indexes).
- **User Dashboard**: Track campaign performances, total counts, click aggregates, and individual link statistics.
- **Interactive Editing**: Update destination URLs or delete links on-the-fly.

### 🛡️ Admin Console
- **Platform Analytics**: High-level statistics overview including user counts, active/inactive links, and click averages.
- **User Management**: Active user directory showing user registration info, total links created, and total clicks generated. Allows admins to activate, deactivate, or delete user accounts.
- **Global Link Registry**: Direct access to view all active, expired, or soft-deleted URLs across the entire platform. Admins can toggle redirection states or delete suspicious/spam links immediately.

### ⚙️ Under The Hood (Architecture)
- **Redis Cache-Aside Pattern**: Reduces database load and speeds up redirection times. Redirection looks up cached mappings in Redis with dynamic TTLs.
- **Asynchronous Click Logging**: Background logging logs visitor details (browser, operating system, device, client IP, referrer) without holding up the redirect process.
- **Token Authorization**: Secure authentication via JSON Web Tokens (JWT) stored in LocalStorage.

---

## 🛠️ Technology Stack

- **Frontend**: React (v19), Vite, Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis
- **Containerization**: Docker, Docker Compose

---

## 📂 Project Structure

```text
URL-Shortner/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & Redis configuration
│   │   ├── controllers/  # API business logic
│   │   ├── middleware/   # Authentication, role checking, parsing
│   │   ├── models/       # MongoDB schemas (User, Url, Click, ExpiredCode)
│   │   ├── routes/       # Express route handlers
│   │   └── utils/        # UA parsing & short ID generators
│   ├── Dockerfile
│   ├── seedAdmin.js      # Script to seed default administrator account
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── assets/       # Media and image resources
│   │   ├── context/      # Auth state providers
│   │   ├── layouts/      # Main & Auth layout layouts
│   │   ├── pages/        # Dashboard, Home, Login, Register views
│   │   ├── routes/       # Navigation routes
│   │   └── services/     # Axios API configuration
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml    # Main orchestration configuration
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) (Recommended)
- OR **Node.js (v18+)**, **MongoDB**, and **Redis** installed locally on your system.

### Option 1: Running with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saurashp/URL-Shortner.git
   cd URL-Shortner
   ```

2. **Start the containers:**
   From the root folder, run:
   ```bash
   docker-compose up --build
   ```
   This will build and start:
   - **Backend server** at `http://localhost:5001`
   - **Redis cache server** at port `6379`
   - Connected to MongoDB Atlas instance defined in environment variables.

3. **Run the Frontend Server:**
   Navigate into the `frontend` directory and launch the Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

### Option 2: Running Locally (Manual Setup)

#### 1. Backend Configuration
1. Go into the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/url-shortener
   JWT_SECRET=your_jwt_secret_key_here
   REDIS_URL=redis://127.0.0.1:6379
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Configuration
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Ensure the base URL inside `frontend/src/services/api.js` targets `http://localhost:5001/api`.
3. Launch the web interface:
   ```bash
   npm run dev
   ```

---

## 🔑 Seeding the Admin Account

To access the **Admin Console** tab on the dashboard, you need to seed the default administrator account in your database:

```bash
cd backend
npm run seed
```
*(Or manually run `node seedAdmin.js` inside the `backend` folder).*

### Default Admin Credentials:
- **Email**: `admin@short.ly`
- **Password**: `admin`

---

## 🤝 Contributing
Feel free to open issues or submit pull requests to enhance features, optimize Redis caching TTL configurations, or introduce custom metrics charts!
