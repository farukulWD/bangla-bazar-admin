# Bangla Bazar Admin Dashboard

A modern, feature-rich e-commerce admin dashboard built with React.js and Tailwind CSS. This application provides comprehensive management tools for online stores, including product management, order processing, customer management, and store customization.

## 🚀 Features

### 📊 Dashboard & Analytics
- **Real-time Dashboard**: Comprehensive overview with sales analytics, revenue charts, and performance metrics
- **Interactive Charts**: Built with Chart.js for data visualization
- **Customer Analytics**: Track customer behavior and purchase patterns
- **Revenue Tracking**: Monitor sales performance and revenue trends

### 🛍️ Product Management
- **Product Catalog**: Complete product management with categories and attributes
- **Inventory Management**: Track stock levels and manage inventory
- **Product Attributes**: Flexible attribute system for product variations
- **Bulk Operations**: Mass import/export and bulk editing capabilities
- **Image Management**: Cloudinary integration for image optimization and storage

### 📦 Order Management
- **Order Processing**: Complete order lifecycle management
- **Invoice Generation**: PDF invoice creation and printing
- **Order Status Tracking**: Real-time order status updates
- **Customer Order History**: Detailed order tracking per customer

### 👥 Customer Management
- **Customer Database**: Comprehensive customer information management
- **Customer Analytics**: Purchase history and behavior analysis
- **Customer Support**: Integrated customer service tools

### 🎫 Coupon & Discount System
- **Coupon Management**: Create and manage discount coupons
- **Promotional Campaigns**: Set up various promotional offers
- **Discount Tracking**: Monitor coupon usage and effectiveness

### 🌍 Internationalization
- **Multi-language Support**: i18next integration for multiple languages
- **Currency Management**: Multi-currency support for global operations
- **Localization**: Region-specific settings and preferences

### 🏪 Store Customization
- **Store Settings**: Comprehensive store configuration
- **Theme Customization**: Customizable store appearance
- **SEO Management**: Search engine optimization tools
- **Content Management**: Manage store pages and content

### 👨‍💼 Staff Management
- **User Management**: Admin and staff account management
- **Role-based Access**: Granular permission system
- **Activity Tracking**: Monitor staff activities and performance

### 🔧 Advanced Features
- **Real-time Notifications**: Socket.io integration for live updates
- **Data Export**: CSV, JSON, and Excel export capabilities
- **Advanced Filtering**: Sophisticated search and filter options
- **Responsive Design**: Mobile-first responsive interface
- **PWA Support**: Progressive Web App capabilities
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.2.0**: Modern React with hooks and functional components
- **React Router DOM 5.3.4**: Client-side routing
- **Redux Toolkit 1.9.7**: State management
- **React Query 5.65.1**: Server state management and caching

### UI & Styling
- **Tailwind CSS 3.4.3**: Utility-first CSS framework
- **Headless UI 1.7.15**: Unstyled, accessible UI components
- **React Icons 4.9.0**: Icon library
- **React Toastify 9.1.3**: Toast notifications

### Build Tools
- **Vite 5.0.12**: Fast build tool and development server
- **PostCSS 8.4.31**: CSS processing
- **Autoprefixer 10.4.16**: CSS vendor prefixing

### Data Visualization
- **Chart.js 4.4.0**: Interactive charts and graphs
- **React Chart.js 2 5.2.0**: React wrapper for Chart.js

### File Management
- **Cloudinary**: Cloud image and video management
- **React Dropzone 14.2.3**: File upload functionality
- **Browser Image Compression 2.0.2**: Client-side image optimization

### Forms & Validation
- **React Hook Form 7.44.3**: Performant forms with minimal re-renders
- **AJV 8.12.0**: JSON schema validation

### Internationalization
- **i18next 22.5.1**: Internationalization framework
- **React i18next 12.3.1**: React bindings for i18next

### Additional Libraries
- **Axios 1.4.0**: HTTP client
- **Day.js 1.11.8**: Date manipulation
- **React PDF Renderer 3.1.6**: PDF generation
- **Socket.io Client 4.7.2**: Real-time communication
- **React Draft WYSIWYG 1.15.0**: Rich text editor

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bangla-bazar-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory and configure your environment variables:
   ```env
   VITE_API_BASE_URL=your_api_base_url
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🚀 Development

### Available Scripts
- `npm run dev` - Start development server on port 4100
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── context/            # React context providers
├── reduxStore/         # Redux store configuration
├── routes/             # Routing configuration
├── utils/              # Utility functions
├── assets/             # Static assets
└── layout/             # Layout components
```

### Key Features Implementation
- **Authentication**: JWT-based authentication with protected routes
- **State Management**: Redux Toolkit for global state, React Query for server state
- **Real-time Updates**: Socket.io for live notifications and updates
- **Image Optimization**: Cloudinary integration for efficient image handling
- **Data Export**: Multiple format support (CSV, JSON, Excel)
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 PWA Features

- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Installable as a native app
- **Push Notifications**: Real-time notifications support
- **Background Sync**: Data synchronization in background

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission system
- **Protected Routes**: Authentication guards for sensitive pages
- **Input Validation**: Comprehensive form validation

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Automatic image compression and optimization
- **Bundle Analysis**: Visual bundle analyzer for optimization
- **Caching Strategies**: Efficient caching with React Query
- **Tree Shaking**: Unused code elimination




## 👨‍💻 Author

**Baangla Bazar** - *Initial work*

## 🙏 Acknowledgments

- React.js community for the amazing framework
- Tailwind CSS team for the utility-first CSS framework
- All contributors and maintainers

---

**Note**: This is an updated version of Bangla Bazar-admin with enhanced features and modern development practices.