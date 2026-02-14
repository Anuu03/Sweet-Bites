# 🍬 Sweet Bites

A modern e-commerce platform for ordering traditional Indian sweets and desserts.

## 🚀 Tech Stack

**Frontend:**
- React 19 + Vite
- Redux Toolkit (State Management)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Framer Motion (Animations)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image Storage)
- Razorpay (Payment Integration)

## 📦 Features

- 🛒 Shopping cart with guest & authenticated user support
- 🔐 JWT-based authentication
- 💳 Razorpay payment integration
- 📱 Responsive design
- 🎨 Dynamic product filtering & search
- 👤 User profile & order management
- 🔄 Cart merge on login

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Bun or npm

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Seed database:
```bash
npm run seed
```

Start server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_BACKEND_URL=http://localhost:9000
VITE_RAZORPAY_KEY=your_razorpay_key
```

Start development server:
```bash
npm run dev
```

## 🌐 Access

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:9000

## 📝 License

MIT

## 👨‍💻 Author

[Anurag Dubey](https://github.com/anuraggdubey)
