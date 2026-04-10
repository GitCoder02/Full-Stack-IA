# MIT Internship Portal

A full-stack web application for managing and discovering internship opportunities. Students can browse internships, match skills, apply, and track applications. Admins can post and manage internship listings.

## Features

- **Student Dashboard**: Browse, filter, and apply for internships
- **Skill Matching**: Automatic skill-based matching score for opportunities
- **Application Tracker**: Track application status and progress
- **Admin Dashboard**: Post and manage internship listings
- **User Authentication**: Login and signup with student/admin role-based access
- **Profile Management**: Manage student profiles and skills

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + MongoDB
- **Styling**: Bootstrap 5
- **Auth**: JWT-based role authentication
- **Linting**: ESLint

## Repository Structure

```text
.
├── backend/              # Express API server
│   ├── config/           # Database and environment configuration
│   ├── middleware/       # Auth and admin middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── seed/             # Seed data scripts
│   └── server.js         # Backend entry point
├── public/               # Static frontend assets
├── src/                  # React frontend source code
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── data/             # Static data files
│   ├── pages/            # Page views
│   └── utils/            # Helper utilities
├── package.json          # Frontend dependencies and scripts
└── README.md             # Project documentation
```

## Prerequisites

- Node.js v16 or higher
- npm (included with Node.js)
- MongoDB instance or local MongoDB server

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/GitCoder02/Full-Stack-IA.git
cd Full-Stack-IA
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` folder with values similar to:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/internship_portal
JWT_SECRET=your_jwt_secret_here
```

> Do not commit `.env` to version control.

## Running the application

### Start the backend

```bash
cd backend
npm start
```

This starts the Express API server on `http://localhost:3001`.

### Start the frontend

In the project root:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## Available Scripts

### Frontend scripts (root)

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

### Backend scripts (`backend/package.json`)

- `npm start` - Start backend server using Node
- `npm run dev` - Start backend server using nodemon

## Usage

1. Run the backend and frontend concurrently.
2. Open the frontend in your browser at `http://localhost:5173`.
3. Sign up or log in as a student or admin.
4. Browse internships, apply to opportunities, and track status.
5. Admins can create and manage internship postings.

## Notes

- The frontend expects API requests to be handled by the backend at `http://localhost:3001`.
- Update your API base URL if you change the backend port.
- Keep `node_modules/` and `.env` excluded from source control.

## GitHub

Clone the repository:

```bash
git clone https://github.com/GitCoder02/Full-Stack-IA.git
```

Commit and push changes:

```bash
git add .
git commit -m "Update README and project setup"
git push origin main
```

## License

This project is part of MIT Internship Portal.

## Support

For questions or issues, refer to the repository issues page or contact the development team.
