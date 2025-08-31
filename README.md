# ClinicCare - Hospital Management System

A modern, full-stack clinic management system built with Next.js (frontend) and Go (backend), featuring Thai language support and modern UI design.

## 🏗️ Project Structure

```
clinic-management-system/
├── frontend/          # Next.js React frontend
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   └── components/ # Reusable React components
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Go REST API backend
│   ├── api/           # HTTP handlers
│   ├── internal/      # Internal packages
│   └── main.go        # Server entry point
└── README.md
```

## ✨ Features

### Patient Management
- **Thai Language Support**: Full Thai language interface
- **HN System**: Hospital Number (HNXXXXXX) identification
- **Complete Patient Records**:
  - ชื่อ-นามสกุล (Full Name)
  - เพศ (Gender)
  - ชื่อเล่น (Nickname)
  - เบอร์โทร (Phone Number)
  - อายุ (Age)
  - วันเกิด (Date of Birth)
  - รูปภาพ (Photo)

### Modern UI/UX
- Glass morphism design
- Gradient backgrounds
- Responsive layout
- Sidebar navigation
- Real-time data updates

### Technical Features
- RESTful API with Go
- React with TypeScript
- Tailwind CSS styling
- Mock database (ready for real DB integration)
- CORS enabled for development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Go 1.19+
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

3. **Run the backend server:**
   ```bash
   go run main.go
   ```

   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## � API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/patients` | Get all patients |
| GET | `/api/patients/{hn}` | Get patient by HN |
| POST | `/api/patients` | Create new patient |
| PUT | `/api/patients/{hn}` | Update patient |
| DELETE | `/api/patients/{hn}` | Delete patient |

## 🔧 Development

### Project Commands

**Backend:**
```bash
cd backend
go run main.go          # Start development server
go build                # Build binary
go test ./...           # Run tests
```

**Frontend:**
```bash
cd frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## 🎨 UI Components

### Dashboard
- Patient statistics
- Quick navigation
- Modern card layouts

### Patient Management
- Integrated patient list and add form
- Photo support
- Real-time updates
- Thai language labels

### Navigation
- Responsive sidebar
- Active state highlighting
- Gradient styling

## 🌐 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: State management

### Backend
- **Go**: High-performance backend language
- **Gorilla Mux**: HTTP router and dispatcher
- **JSON**: API data format
- **CORS**: Cross-origin resource sharing

## � Sample Data

The system includes sample Thai patient data:
- นายสมชาย ใจดี (HN000001)
- นางสาวสมหญิง สวยงาม (HN000002)
- นายวิชัย เก่งกาจ (HN000003)

## 🔮 Future Enhancements

- [ ] PostgreSQL database integration
- [ ] User authentication and authorization
- [ ] Appointment scheduling
- [ ] Medical records management
- [ ] Reporting and analytics
- [ ] File upload for patient photos
- [ ] Print functionality
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## � License

This project is licensed under the MIT License.

## 🏥 About

ClinicCare is designed to modernize clinic management with a focus on Thai healthcare facilities. The system provides an intuitive interface for managing patient records while maintaining professional healthcare standards.

---

**Developed with ❤️ for Thai healthcare facilities**
