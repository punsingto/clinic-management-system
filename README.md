# Clinic Management System

A modern, full-stack clinic management system built with Next.js and Go, featuring a sleek glass morphism UI design and comprehensive patient management capabilities.

## 🚀 Features

- **Modern Dashboard** - Real-time statistics and overview
- **Patient Management** - Add, view, and manage patient records
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Glass Morphism UI** - Modern, elegant design with smooth animations
- **Real-time Updates** - Instant data synchronization
- **RESTful API** - Clean, well-structured backend architecture

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management

### Backend
- **Go (Golang)** - High-performance backend language
- **Gorilla Mux** - HTTP router and URL matcher
- **CORS Middleware** - Cross-origin resource sharing
- **Repository Pattern** - Clean architecture design

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Go** (v1.19 or higher)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/clinic-management-system.git
cd clinic-management-system
```

### 2. Install Frontend Dependencies
```bash
npm install
# or
yarn install
```

### 3. Install Backend Dependencies
```bash
cd backend
go mod tidy
```

### 4. Run the Backend Server
```bash
cd backend
go run main.go
```
The backend server will start on `http://localhost:8080`

### 5. Run the Frontend Development Server
```bash
# In a new terminal, from the project root
npm run dev
# or
yarn dev
```
The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
clinic-management-system/
├── backend/                 # Go backend
│   ├── api/
│   │   └── handlers/       # HTTP request handlers
│   ├── internal/
│   │   └── database/       # Database layer and models
│   ├── main.go            # Server entry point
│   ├── go.mod             # Go module file
│   └── go.sum             # Go dependencies
├── src/                   # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── patients/      # Patient management page
│   │   ├── add-patient/   # Add patient page
│   │   └── page.tsx       # Dashboard page
│   └── components/        # Reusable React components
├── public/                # Static assets
├── package.json           # Node.js dependencies
└── README.md             # Project documentation
```

## 🔌 API Endpoints

### Patient Management
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a new patient
- `PUT /api/patients/{id}` - Update a patient
- `DELETE /api/patients/{id}` - Delete a patient
- `GET /health` - Health check endpoint

## 🎨 UI Features

- **Glass Morphism Design** - Modern, translucent UI elements
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Elegant transitions and interactions
- **Responsive Layout** - Optimized for all screen sizes
- **Sidebar Navigation** - Easy access to all features

## 🗄️ Database

Currently uses an in-memory mock database with sample data. The project is structured to easily integrate with:
- PostgreSQL
- MySQL
- MongoDB
- Or any other database of your choice

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend
The Go backend can be deployed to:
- Heroku
- AWS
- Google Cloud Platform
- DigitalOcean
- Any cloud provider that supports Go applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using modern web technologies.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Go community for excellent libraries
- Tailwind CSS for the utility-first approach

---

⭐ **Star this repository if you found it helpful!**
