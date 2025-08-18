# FinFX Admin Panel

A modern React-based administrative dashboard for FinFX, built with TypeScript, Vite, and Tailwind CSS. This application provides comprehensive user management capabilities with a clean, responsive interface.

## 🌐 Live Demo

You can access the live version of the FinFX Admin Panel at:  
[https://finfx-dashboard.sarankar.com/](https://finfx-dashboard.sarankar.com/)

To log in and explore the demo, use the following credentials:  
- **Email:** [test@yopmail.com](mailto:test@yopmail.com)  
- **Password:** test@123

## 🚀 Features

### User Management
- **Complete CRUD Operations**: Create, read, update, and delete users
- **Bulk Operations**: Select and delete multiple users at once
- **Real-time Validation**: Form validation with proper error handling
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Modern Tech Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Router DOM** for navigation
- **Sonner** for toast notifications

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratham-sarankar/finfx-admin-panel.git
   cd finfx-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory (optional):
   ```env
   VITE_API_BASE_URL=https://finfx-backend-dev.onrender.com/dev
   ```
   
   **Note**: If you don't set this environment variable, the application will automatically use the development server URL.

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
# or
yarn build
# or
pnpm build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## 🔗 Backend Integration

This application integrates with the FinFX backend development server:

**Base URL**: `https://finfx-backend-dev.onrender.com/dev`

### API Endpoints
- `POST /users` - Create new user
- `GET /users` - List users with pagination
- `GET /users/:id` - Get single user details
- `PUT /users/:id` - Update existing user
- `DELETE /users/:id` - Delete user

### Authentication
The application uses JWT-based authentication through:
- `POST /auth/login` - User login

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, dialogs, etc.)
│   └── ...             # Feature-specific components
├── config/             # Application configuration
│   └── api.ts          # API configuration and endpoints
├── lib/                # Utility functions and helpers
├── pages/              # Page components
├── services/           # API service layers
├── types/              # TypeScript type definitions
└── ...
```

## 🎨 UI Components

The application uses a combination of:
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **Lucide React** and **Tabler Icons** for icons
- **Custom components** built with shadcn/ui patterns

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Override the default backend URL

### Customization
- Modify `src/config/api.ts` to change API endpoints
- Update Tailwind configuration in `tailwind.config.js`
- Adjust TypeScript settings in `tsconfig.json`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary to FinFX.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
