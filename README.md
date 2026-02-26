# MIT Internship Portal

A full-stack web application for managing and discovering internship opportunities. Students can browse internships, match skills, apply, and track applications. Admins can post and manage internship listings.

## Features

- **Student Dashboard**: Browse and apply for internships
- **Skill Matching**: Automatic skill-based matching score for opportunities
- **Application Tracker**: Track application status and progress
- **Admin Dashboard**: Post and manage internship listings
- **User Authentication**: Login and signup with role-based access
- **Profile Management**: Manage student profiles and skills

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Bootstrap 5
- **Build Tool**: Vite
- **Testing**: ESLint

## Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/GitCoder02/Full-Stack-IA.git
cd Full-Stack-IA
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- React and React DOM
- Vite
- Bootstrap and Popper.js
- ESLint

### Step 3: Create Environment File

Create a `.env` file in the project root (do **not** commit this file):

```
VITE_API_URL=http://localhost:3001
# Add other environment variables as needed
```

**Note**: `.env` is listed in `.gitignore` to prevent accidental commits.

### Step 4: Start Development Server

```bash
npm run dev
```

The development server will start at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable React components
├── context/          # React Context API for state management
├── data/             # Static data (internships, skills)
├── pages/            # Page components
├── utils/            # Utility functions
├── App.jsx           # Main App component
├── index.css         # Global styles
└── main.jsx          # Entry point
```

## GitHub Repository

This project is hosted on GitHub at: [https://github.com/GitCoder02/Full-Stack-IA](https://github.com/GitCoder02/Full-Stack-IA)

### Clone from GitHub

```bash
git clone https://github.com/GitCoder02/Full-Stack-IA.git
```

### Push Changes to GitHub

After making changes locally, commit and push:

```bash
# Stage changes
git add .

# Commit with a descriptive message
git commit -m "Your commit message here"

# Push to main branch
git push origin main
```

**Important**: The repository is configured to exclude `node_modules/` and `.env` files via `.gitignore` to keep the repository clean and secure.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Notes

- `.gitignore` automatically excludes `node_modules/`, `.env`, and other common artifacts
- Never commit sensitive information like API keys or credentials
- Always pull latest changes before starting work: `git pull origin main`

## License

This project is part of MIT Internship Portal.

## Support

For issues or questions, please check the GitHub repository issues page or contact the development team.
