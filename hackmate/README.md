# 🚀 HackMate — Hackathon Team Finder for College Students

**HackMate** is a full-stack platform designed specifically for collegiate hackers, developers, and designers. It streamlines the hackathon experience: discovering top upcoming competitions, building verified student builder profiles, forming synergistic squads based on complementary skills, and managing team invitations.

---

## 🌟 Key Features

1. **Modern Collegiate UI & UX**:
   - Styled with Tailwind CSS in an aesthetic tailored for student tech: clean typography, generous spacing, light background, deep navy text, and violet/indigo accents.
   - Fully responsive on mobile, tablet, and desktop.
   - Polished empty, loading, error, and success states.

2. **Authentication & Student Profiles**:
   - Secure student registration and login with bcryptjs password hashing and JWT authentication.
   - Show/hide password controls and form validation.
   - Student profiles with college name, bio, specialty role, interactive skills tags, interests tags, and links to GitHub, LinkedIn, and personal portfolio.
   - Profile photo and resume (PDF) upload powered by Multer with file type and 5MB size validation.
   - Strict authorization: students can edit only their own profiles.

3. **Explore Hackathons**:
   - Search and filter by theme, mode (*Online*, *In-Person*, *Hybrid*), and required tech stack.
   - Rich hackathon detail view with prize pools, dates, team capacity, and organizer details.
   - Authorized users can create, edit, and delete their own hackathon listings.
   - Lists all squads formed and looking for teammates for each hackathon.

4. **Find Teammates**:
   - Search student builders by skills, interests, college, and role (*Frontend, Backend, AI/ML, UI/UX, Mobile, DevOps, Product Manager*).
   - Detailed profile views with student resumes and social links.
   - Direct "Invite to Team" modal to invite any student to your squad.

5. **Teams & Invitations Workflow**:
   - Create a team for any active hackathon.
   - Automatic constraint enforcement: a student can only belong to **one** team per hackathon.
   - Only team leaders can send invitations; prevents duplicate invites and full-team invites.
   - Only the invitation recipient can accept or decline an invite.
   - Accepting an invite adds the student to the team roster and automatically resolves competing invitations for that hackathon.
   - Live invitation status tracking (*Pending*, *Accepted*, *Declined*).

6. **Email Notifications**:
   - Powered by Nodemailer for invitation and status update notifications.
   - **Safe Development Fallback**: If real SMTP credentials are not configured, HackMate never crashes—it prints formatted email previews directly to the server terminal.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18 + Vite + TypeScript
  - Tailwind CSS + Lucide Icons (`lucide-react`)
  - React Router DOM v6
  - Axios with JWT request/response interceptors

- **Backend**:
  - Node.js & Express.js (Model-Route-Controller architecture)
  - MongoDB Atlas & Mongoose
  - JSON Web Tokens (jsonwebtoken) & bcryptjs
  - express-validator & Multer
  - Nodemailer & dotenv

---

## 📂 Project Structure

```text
hackmate/
├── client/                     # Frontend React + Vite + TypeScript application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, SkillTag, StatusBadge, InviteModal, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT management & session handling)
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Hackathons, Teammates, Teams, Profile
│   │   ├── services/           # Axios API configuration & interceptors
│   │   ├── types/              # TypeScript interfaces for User, Hackathon, Team, Invitation
│   │   ├── App.tsx             # Routes and layout
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.tsx            # React root entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # Database connection (Mongoose)
│   ├── controllers/            # authController, userController, hackathonController, teamController, invitationController
│   ├── middleware/             # authMiddleware, uploadMiddleware (Multer), errorMiddleware
│   ├── models/                 # User, Hackathon, Team, Invitation schemas
│   ├── routes/                 # Express route definitions
│   ├── seed/                   # Realistic sample data & automated seeder script
│   ├── utils/                  # Nodemailer utility with safe dev logger
│   ├── uploads/                # Stored avatars and student PDF resumes
│   ├── .env.example            # Environment template with placeholders
│   ├── package.json
│   └── server.js               # Application entry point
│
├── postman_collection.json     # Complete Postman Collection for all endpoints
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.x or newer
- **MongoDB**: Either a local MongoDB instance running on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas cluster connection string.

---

### 2. Configure Environment Variables

Navigate to the `server/` directory and configure `.env`:

```bash
cd hackmate/server
cp .env.example .env
```

Open `server/.env` and configure:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hackmate
JWT_SECRET=your_super_secret_jwt_key_hackmate_2025
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Nodemailer SMTP (Leave as placeholder to use safe console email preview)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM=HackMate <no-reply@hackmate.dev>
```

---

### 3. Install Dependencies & Seed Sample Data

#### Backend:
```bash
cd hackmate/server
npm install
npm run seed
```

> **Seeder Output**: Populates realistic student builders from Stanford, MIT, Berkeley, Georgia Tech, plus active hackathons, teams, and sample invitations.
> **Default Test Password**: `password123` for all sample accounts:
> - `aarav@hackmate.dev` (Fullstack Developer & Team Leader)
> - `maya@hackmate.dev` (AI/ML Engineer)
> - `liam@hackmate.dev` (UI/UX Designer)
> - `zainab@hackmate.dev` (Backend & Cloud Developer)
> - `elena@hackmate.dev` (Mobile Developer)
> - `marcus@hackmate.dev` (Product Manager)

#### Frontend:
```bash
cd hackmate/client
npm install
```

---

### 4. Run the Application

#### Start Backend Server:
```bash
cd hackmate/server
npm start
# Server starts on http://localhost:5000
```

#### Start Frontend Client (in a separate terminal):
```bash
cd hackmate/client
npm run dev
# Vite dev server starts on http://localhost:5173
```

Open your browser to `http://localhost:5173`. You can immediately test the app or use the **Quick Test Accounts** button on the Login page!

---

## ☁️ MongoDB Atlas Setup Guide

To use MongoDB Atlas in the cloud:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free **M0 Sandbox Cluster**.
3. Under **Security → Database Access**, create a database user (e.g. `hackmate_admin`) with password.
4. Under **Security → Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so cloud deployments like Render can connect.
5. Under **Deployment → Database**, click **Connect** → **Drivers** → Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hackmate?retryWrites=true&w=majority
   ```
6. Paste this URI into `server/.env` as `MONGO_URI`.

---

## 🚢 Production Deployment Instructions

### Deploy Backend to Render or Railway

1. **Deploying on Render**:
   - Push your repository to GitHub.
   - Go to [dashboard.render.com](https://dashboard.render.com) → **New Web Service**.
   - Connect your GitHub repository.
   - Set **Root Directory** to `hackmate/server`.
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `node server.js`
   - In **Environment Variables**, add:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (or leave default, Render sets `PORT` automatically)
     - `MONGO_URI`: `<Your MongoDB Atlas Connection String>`
     - `JWT_SECRET`: `<A strong random string>`
     - `CLIENT_URL`: `<Your Vercel or Netlify frontend URL>`

2. **Deploying Frontend to Vercel**:
   - Go to [vercel.com](https://vercel.com) → **Add New Project**.
   - Select your repository.
   - Set **Root Directory** to `hackmate/client`.
   - Set **Framework Preset** to `Vite`.
   - In **Environment Variables**, add:
     - `VITE_API_BASE_URL`: `<Your deployed Render backend URL, e.g. https://hackmate-api.onrender.com/api>`
   - Click **Deploy**.

---

## 📬 Postman API Collection

The repository includes a ready-to-import Postman collection located at:
`hackmate/postman_collection.json`

### Key Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate student and get JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated student's profile |
| `GET` | `/api/auth/dashboard` | Private | Get personalized metrics, teams, and invites |
| `GET` | `/api/users` | Public | Search/filter students by skill, role, college |
| `GET` | `/api/users/:id` | Public | Get student profile details and active teams |
| `PUT` | `/api/users/profile` | Private | Update student bio, skills, roles, links |
| `POST` | `/api/users/upload` | Private | Upload profile picture & resume (Multer) |
| `GET` | `/api/hackathons` | Public | List hackathons with search and theme filters |
| `GET` | `/api/hackathons/:id` | Public | Hackathon details and registered teams |
| `POST` | `/api/hackathons` | Private | Post a new hackathon listing |
| `PUT` | `/api/hackathons/:id` | Private | Update own hackathon listing |
| `DELETE` | `/api/hackathons/:id` | Private | Delete own hackathon listing |
| `GET` | `/api/teams` | Public | List teams (optionally filter by hackathon) |
| `GET` | `/api/teams/:id` | Public | Get team details, roster, and open skills |
| `POST` | `/api/teams` | Private | Create a squad for a hackathon |
| `DELETE` | `/api/teams/:id` | Private | Delete team (leader only) |
| `POST` | `/api/teams/:id/members/remove` | Private | Remove member or leave squad |
| `POST` | `/api/invitations` | Private | Send invitation to student (leader only) |
| `GET` | `/api/invitations/received` | Private | Get invitations received by logged-in user |
| `GET` | `/api/invitations/sent` | Private | Get invitations sent by user's teams |
| `PUT` | `/api/invitations/:id/respond` | Private | Accept or decline team invitation |
| `DELETE` | `/api/invitations/:id` | Private | Cancel invitation (leader only) |

---

## 🛡️ License

This project is licensed under the MIT License.

