# ResuRev 🚀

<div align="center">

### AI-Powered Resume Review Platform

Transform your resume with intelligent AI feedback and land your dream job

[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.7.1-ca4245?style=for-the-badge&logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)](https://docker.com/)

[🔗 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Analysis** - Advanced resume scanning with intelligent feedback
- **ATS Optimization** - Ensure your resume passes Applicant Tracking Systems
- **Real-time Scoring** - Get instant scores across multiple categories
- **Smart Suggestions** - Priority-based improvement recommendations
- **Multi-format Support** - Upload PDF, DOC, and DOCX files

### 🎨 User Experience
- **Responsive Design** - Seamless experience across all devices
- **Smooth Animations** - Framer Motion powered interactions
- **Dark Mode Support** - Eye-friendly interface
- **Intuitive Dashboard** - Clean, professional user interface
- **Drag & Drop Upload** - Easy file handling with progress indicators

### 🏗️ Technical Excellence
- **Modern Stack** - Built with React 19 and React Router 7
- **Type Safety** - Full TypeScript implementation
- **Component Library** - shadcn/ui with custom styling
- **Production Ready** - Multi-stage Docker deployment
- **Performance Optimized** - Fast loading with code splitting

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Docker (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/resurev.git
cd resurev

# Install dependencies
npm install

# Start development server
npm run dev
```

Your application will be available at `http://localhost:5173` 🌐

---

## 🛠️ Development

### Available Scripts

```bash
# Development with HMR
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck
```

### Project Structure

```
resurev/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── landing/         # Landing page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/              # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── animator.tsx
│   │   └── Navigation.tsx
│   ├── lib/                 # Utility functions
│   ├── routes/              # Application pages
│   │   ├── home.tsx         # Landing page
│   │   ├── dashboard.tsx    # User dashboard
│   │   ├── upload.tsx       # File upload
│   │   ├── review.tsx       # Review results
│   │   ├── signin.tsx       # Authentication
│   │   └── signup.tsx
│   ├── app.css             # Global styles
│   ├── root.tsx            # App root
│   └── routes.ts           # Route configuration
├── public/                 # Static assets
├── Dockerfile             # Production deployment
└── components.json        # shadcn/ui config
```

---

## 🎨 Design System

### Color Palette
- **Primary**: `oklch(0.4341 0.0392 41.9938)` - Professional blue
- **Secondary**: `oklch(0.9200 0.0651 74.3695)` - Accent yellow
- **Background**: `oklch(0.9821 0 0)` - Clean white/dark

### Typography
- **Headings**: Responsive scaling from `text-4xl` to `text-7xl`
- **Body**: Inter font family for optimal readability
- **Animations**: Smooth transitions with Framer Motion

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 🐳 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t resurev .

### Multi-stage Build Process

1. **Development dependencies** - Install all packages
2. **Production dependencies** - Install only runtime packages  
3. **Build stage** - Compile the application
4. **Runtime stage** - Serve the built application

---

## 🛡️ Tech Stack

### Frontend

- **[React 19](https://reactjs.org/)** - Latest React with concurrent features
- **[React Router 7](https://reactrouter.com/)** - File-based routing and SSR
- **[TypeScript 5.8](https://typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://framer.com/motion)** - Smooth animations
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### UI Components

- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://radix-ui.com/)** - Accessible primitives
- **[Class Variance Authority](https://cva.style/)** - Component variants

### Development Tools

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[Docker](https://docker.com/)** - Containerized deployment

---

## 📦 Key Dependencies

```json
{
  "react": "^19.1.0",
  "react-router": "^7.7.1", 
  "framer-motion": "^12.23.12",
  "tailwindcss": "^4.1.4",
  "@radix-ui/react-dialog": "^1.1.14",
  "lucide-react": "^0.539.0",
  "pdfjs-dist": "^5.4.54",
  "zustand": "^5.0.7"
}
```

---

## 🌟 Features Showcase

### Landing Page

- Hero section with animated background shapes
- Feature highlights with scroll animations
- Three-tier pricing structure
- Professional footer with company links

### Dashboard

- Resume management interface
- Visual scoring system
- Progress tracking
- Quick action buttons

### Review System

- Category-based analysis (ATS, Content, Format, Keywords)
- Priority-based suggestions
- Visual progress indicators
- Downloadable reports

### Upload Experience

- Drag & drop interface
- File validation and security
- Progress indicators
- Multiple format support

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Ensure responsive design
- Maintain accessibility standards

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- 📧 **Email**: support@resurev.com
- 💬 **Discord**: Join our community
- 📖 **Documentation**: Full docs
- 🐛 **Issues**: GitHub Issues

---

**Built with ❤️ using modern web technologies**

[⬆️ Back to Top](#resurev-)

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
