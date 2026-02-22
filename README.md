# 🏥 MediCare — Full Stack MERN Healthcare Platform

A complete, production-ready hospital management and appointment booking platform built with the MERN stack.

---

## 🚀 Features

### Patient Features
- **Home page** with hero, services overview, featured doctors & testimonials
- **Find Doctors** — search & filter by specialty, pagination
- **Doctor Profiles** — detailed page with bio, schedule, fees
- **Book Appointments** — date/time slot selection with real-time validation
- **Patient Dashboard** — view all appointments, cancel pending, stats overview
- **User Auth** — register/login with JWT tokens

### Admin Features
- **Admin Dashboard** with full stats (patients, doctors, appointments)
- **Appointment Management** — update status (pending → confirmed → completed → cancelled)
- **Doctor Management** — add/delete doctors
- **Contact Messages** — view & mark as read

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Notifications | react-hot-toast |
| Fonts | Playfair Display + DM Sans |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Clone / Extract the Project

```bash
cd medicare
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

**Configure environment:**
Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/"your db"
JWT_SECRET=medicare_super_secret_jwt_key_2024
NODE_ENV=development
GROQ_API_KEY=
GROQ_MODEL=
TRIAGE_TIMEOUT_MS=8000
```

> 💡 For **MongoDB Atlas**, replace MONGO_URI with your Atlas connection string.

**Seed the database (adds sample doctors & users):**
```bash
node seed.js
```

**Start the backend:**
```bash
npm run dev    # development (with nodemon)
# or
npm start      # production
```

Backend runs at: `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

> The frontend proxies API requests to `http://localhost:5000` automatically.

---

## 🔑 Demo Login Credentials

After running `node seed.js`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@medicare.com | admin123 |
| **Patient** | patient@medicare.com | patient123 |

> Both credentials are also available as quick-fill buttons on the Login page!

---

## 📁 Project Structure

```
medicare/
├── backend/
│   ├── models/
│   │   ├── User.js          # Patient & admin users
│   │   ├── Doctor.js        # Doctor profiles
│   │   ├── Appointment.js   # Bookings
│   │   └── Contact.js       # Contact form messages
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── doctors.js       # CRUD for doctors
│   │   ├── appointments.js  # Book & manage appointments
│   │   ├── patients.js      # Patient list + stats
│   │   ├── services.js      # Static services data
│   │   └── contact.js       # Contact form
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role guards
│   ├── server.js            # Express app entry point
│   ├── seed.js              # Database seeder
│   └── .env                 # Environment variables
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── Footer.js
        │   └── DoctorCard.js
        ├── pages/
        │   ├── Home.js
        │   ├── Doctors.js
        │   ├── DoctorDetail.js
        │   ├── Services.js
        │   ├── Contact.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js      # Patient dashboard
        │   ├── AdminDashboard.js # Admin panel
        │   └── BookAppointment.js
        ├── context/
        │   └── AuthContext.js    # Global auth state
        ├── styles.css            # All global styles
        └── App.js                # Router setup
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Get current user | 🔒 |
| GET | /api/doctors | List doctors (w/ filters) | Public |
| GET | /api/doctors/:id | Get doctor profile | Public |
| POST | /api/doctors | Add doctor | 🔒 Admin |
| DELETE | /api/doctors/:id | Delete doctor | 🔒 Admin |
| POST | /api/appointments | Book appointment | 🔒 |
| GET | /api/appointments/my | My appointments | 🔒 |
| GET | /api/appointments | All appointments | 🔒 Admin |
| PUT | /api/appointments/:id/status | Update status | 🔒 |
| DELETE | /api/appointments/:id | Cancel appointment | 🔒 |
| GET | /api/patients/stats | Dashboard stats | 🔒 Admin |
| GET | /api/services | List services | Public |
| POST | /api/contact | Submit contact form | Public |
| GET | /api/contact | View all messages | 🔒 Admin |

---

## 🛠️ Production Deployment

### Build frontend:
```bash
cd frontend && npm run build
```

### Serve with Express (add to server.js):
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection | mongodb://localhost/medicare |
| JWT_SECRET | Secret for JWT signing | your-secret-key |
| NODE_ENV | Environment | development |

---

Built with ❤️ by MediCare Team
