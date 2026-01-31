# Nivasa - Modern Real Estate Platform

A comprehensive peer-to-peer real estate platform for buying, selling, and renting properties in India. Built with modern web technologies to deliver an exceptional user experience with zero brokerage fees.

## 🏠 Key Features

### 🔍 **Smart Property Discovery**
- **AI-Powered Search**: Intelligent property recommendations based on lifestyle and preferences
- **Advanced Filtering**: Filter by property type, price range, location, amenities, and more
- **Voice Search**: Search properties using voice commands
- **Lifestyle Filters**: Pet-friendly, near metro, office-ready, garden view options
- **Recent & Saved Searches**: Quick access to your search history and favorites
- **Interactive Maps**: Integrated with OpenStreetMap for location-based property discovery

### 🏡 **Immersive Property Experience**
- **360° Virtual Tours**: Comprehensive property viewing with high-quality images
- **Gaussian Splat Viewer**: Cutting-edge 3D property visualization
- **Before/After Slider**: Compare property transformations
- **Floor Plan Viewer**: Interactive floor plan exploration
- **Virtual Staging**: AI-powered interior staging for empty properties
- **Property Brochures**: Generate and download PDF brochures
- **Photo Gallery**: High-resolution image galleries with zoom functionality

### 🤖 **AI-Powered Assistant**
- **Property Chatbot**: Ask questions about specific properties and get instant AI responses
- **Natural Language Queries**: Ask about amenities, location, pricing, and more
- **Conversation History**: Persistent chat history for logged-in users
- **Quick Suggestions**: Pre-built questions for common property inquiries
- **Multi-language Support**: Contextual responses based on property data

### 💬 **Advanced Communication**
- **Real-time Chat**: Firebase-powered instant messaging between buyers and sellers
- **WhatsApp Integration**: Direct WhatsApp contact with property sellers
- **Inbox Management**: Centralized message inbox with unread count tracking
- **Property-specific Chats**: Organized conversations by property listings
- **User Profiles**: Detailed seller profiles with response rates and member since dates

### 📊 **Analytics & Insights**
- **Price Trends Charts**: Historical price analysis for localities
- **Locality Insights**: Detailed neighborhood information and statistics
- **Property Views Tracking**: Monitor interest in your listings
- **Investment Calculator**: Calculate potential returns and investment scenarios
- **Home Loan Calculator**: EMI calculations with current bank rates
- **Market Analytics**: Comprehensive market insights and trends

### 🔐 **Authentication & Security**
- **Firebase Authentication**: Secure login/signup with email and social providers
- **Protected Routes**: Role-based access control
- **User Profiles**: Comprehensive user profile management
- **Session Management**: Persistent login sessions across devices

### 🏢 **Seller Dashboard**
- **Property Listing Management**: Create, edit, and manage property listings
- **Multi-step Listing Process**: Guided property submission with image uploads
- **Cloudinary Integration**: Professional image upload and optimization
- **Amenities Management**: Comprehensive amenities selection
- **Contact Management**: Handle buyer inquiries efficiently
- **Performance Tracking**: Monitor listing views and engagement

### 📱 **Modern UI/UX**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Smooth Animations**: Framer Motion powered smooth transitions
- **Accessibility**: WCAG compliant design elements
- **Progressive Web App**: Fast loading and offline capabilities

### 🎯 **Advanced Search & Compare**
- **Property Comparison**: Side-by-side property comparison tool
- **Favorites System**: Save and manage favorite properties
- **Search Filters**: Comprehensive filtering by multiple criteria
- **Sort Options**: Sort by price, date, popularity, and relevance
- **Pagination**: Efficient property browsing with optimized loading

### 📰 **Additional Features**
- **News Integration**: Latest real estate news and market updates
- **FAQ Section**: Comprehensive frequently asked questions
- **Contact Forms**: Multiple contact options and inquiry forms
- **Legal Pages**: Terms of service, privacy policy, and about pages
- **SEO Optimized**: Search engine friendly with proper meta tags

## 🛠 Technologies Used

### Frontend Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with excellent IDE support
- **Vite** - Lightning-fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid development
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible components for complex UI patterns
- **Framer Motion** - Production-ready motion library for React
- **Lucide Icons** - Beautiful, customizable SVG icons

### Backend & Database
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - Secure authentication service
- **Firebase Storage** - File storage for images and documents
- **Cloudinary** - Advanced image and video management

### State Management & Data Fetching
- **TanStack Query** - Powerful data synchronization for React
- **React Context** - Built-in state management for global state
- **Zustand** - Lightweight state management solution

### Maps & Location
- **Leaflet** - Interactive maps for property locations
- **OpenStreetMap** - Free geographic data for mapping
- **Geocoding API** - Convert addresses to coordinates

### AI & External Services
- **Groq API** - Fast AI inference for property chatbot
- **Bank Rates API** - Real-time interest rate data
- **News API** - Latest real estate news integration

### Development & Testing
- **ESLint** - Code quality and consistency
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- npm, yarn, or bun package manager

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd nivasa
```

2. **Install dependencies**
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun
bun install
```

3. **Environment Setup**
Create a `.env` file in the root directory with the required environment variables:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# AI Services
VITE_GROQ_API_KEY=your_groq_api_key

# Other APIs
VITE_NEWS_API_KEY=your_news_api_key
```

4. **Start development server**
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun dev
```

5. **Open in browser**
Navigate to `http://localhost:8080` to view the application.


## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── analytics/       # Analytics and insights components
│   ├── auth/           # Authentication components
│   ├── communication/  # Chat and messaging components
│   ├── landing/        # Landing page components
│   ├── pdf/            # PDF generation components
│   ├── property/       # Property-related components
│   ├── search/         # Search functionality components
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── pages/              # Application pages/routes
├── services/           # API and external service integrations
├── stores/             # State management stores
├── styles/             # Global styles and themes
└── types/              # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions to improve Nivasa! Please read our contributing guidelines and follow our code of conduct.

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- 📧 Email: support@nivasa.com
- 💬 Chat: Use the in-app messaging system

---

**Made with ❤️ for the Indian real estate market**
