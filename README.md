# Lost & Found - Full-Stack MERN Project

A complete Full-Stack MERN (MongoDB, Express/Next API, React JSX, Node.js) community web application for reporting lost items, listing found belongings, and securely reuniting items with their rightful owners.

---

## 🛠️ Tech Stack

- **Frontend**: React (pure JavaScript / JSX), Tailwind CSS, Lucide Icons, Radix UI primitives.
- **Backend**: Node.js, Next.js Server Route Handlers (`app/api/*`).
- **Database**: MongoDB with Mongoose ODM ([models/User.js](models/User.js), [models/Item.js](models/Item.js), [models/Claim.js](models/Claim.js)).
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and secure cookies.
- **Image Storage**: [ImageKit.io](https://imagekit.io/) CDN API ([lib/imagekit.js](lib/imagekit.js)).

---

## 🔑 Environment Variables & API Configuration

Open your local [.env.local](.env.local) file and configure the empty placeholders:

```env
# MongoDB Atlas Connection String
# Get free cluster from https://www.mongodb.com/cloud/atlas
MONGODB_URI=

# JWT Secret Key (Any random 32+ character string)
JWT_SECRET=lost_and_found_secret_key_2026_dev_mode

# ImageKit.io API Credentials (Dashboard -> Developer Options -> API Keys)
# Free account at https://imagekit.io
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Super Admin Email
SUPER_ADMIN_EMAIL=amarsinghkatiyar13@gmail.com
```

> **Note on Placeholders**: If you haven't set up MongoDB Atlas or ImageKit yet, the application gracefully provides instant local previews so you can test the UI and workflows immediately.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📡 REST API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Create user account with hashed password.
- `POST /api/auth/login` - Authenticate user & issue JWT cookie.
- `GET /api/auth/me` - Get current session user.
- `POST /api/auth/logout` - Clear session token.

### 📦 Lost & Found Items
- `GET /api/items?type=lost&status=active` - List active lost reports with search & filters.
- `GET /api/items?type=found&status=active` - List active found items.
- `POST /api/items` - Create a new lost or found post (saved to MongoDB).
- `GET /api/items/:id` - Fetch item details by ID.
- `PATCH /api/items/:id` - Mark item as found/returned or update details.
- `DELETE /api/items/:id` - Delete item report.

### ☁️ Media Uploads
- `POST /api/upload` - Upload item photos to ImageKit.io CDN.

### 👑 Admin & Super Admin
- `GET /api/admin/stats` - Platform metrics (total users, lost items, found items, resolved reunions).
- `GET /api/admin/users` - User directory (Super Admin).
- `DELETE /api/admin/users?userId=...` - Remove user.
- `POST /api/admin/clear-db` - Reset database collections (Super Admin).
