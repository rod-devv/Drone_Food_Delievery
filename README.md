# 🚁 Drone Food Delivery System

A comprehensive full-stack food delivery application featuring **real-time drone tracking** and intelligent delivery management.

## 🌟 Live Demo

- **Customer App**: https://drone-food-client.fly.dev/
- **Admin Dashboard**: https://drone-food-dashboard.fly.dev/
- **Backend API**: https://drone-food-backend.fly.dev/

## ✨ Key Features

### 🚁 **Live Drone Tracking**
- Real-time drone position calculations and movement visualization
- Interactive maps with moving drone markers
- Smart delivery status detection (auto-delivered when drone reaches destination)
- Multiple delivery routes across 5 cities

### 📱 **Customer Experience**
- Browse restaurants by city (NYC, Chicago, LA, Miami, SF)
- Interactive map for delivery location selection
- Real-time order tracking
- Secure payment processing with Stripe
- Responsive design for all devices

### 🏢 **Admin Dashboard**
- Live drone delivery management and monitoring
- Real-time analytics and reporting
- Restaurant and user management
- Role-based access (Admin vs Restaurant Owner)
- Comprehensive order tracking system

### 🛡️ **Backend Features**
- RESTful API with JWT authentication
- MongoDB Atlas integration
- Cloudinary image management
- Stripe payment processing
- Real-time drone position algorithms

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Customer App  │    │  Admin Dashboard │    │    Backend API  │
│   (React + Vite)│    │   (React + Vite) │    │ (Node.js/Express)│
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Order Food    │    │ • Drone Tracking │    │ • JWT Auth      │
│ • Track Orders  │    │ • Analytics      │    │ • MongoDB Atlas │
│ • Interactive   │    │ • User Mgmt      │    │ • Stripe API    │
│   Maps          │    │ • Restaurant     │    │ • Cloudinary    │
│ • Stripe Pay    │    │   Management     │    │ • Real-time     │
└─────────────────┘    └──────────────────┘    │   Algorithms    │
                                               └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Mapbox GL JS** - Interactive maps and drone tracking
- **Material-UI** - Admin dashboard components
- **Axios** - HTTP client for API calls

### **Backend**
- **Node.js & Express** - Server runtime and web framework
- **MongoDB Atlas** - Cloud database
- **JWT** - Secure authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image storage and optimization

### **DevOps & Deployment**
- **Docker** - Containerization
- **Fly.io** - Cloud deployment platform
- **Git** - Version control

## 🚀 Live Drone Tracking System

### **Real-Time Position Calculation**
```javascript
// Smart drone position algorithm
const calculateDronePosition = (droneDelivery) => {
  const now = new Date();
  const startTime = new Date(droneDelivery.startTime);
  const speed = droneDelivery.speed || 10; // m/s
  
  // Calculate progress along route
  const elapsedMs = now.getTime() - startTime.getTime();
  const durationMs = (totalDistance / speed) * 1000;
  const fraction = Math.min(elapsedMs / durationMs, 1);
  
  // Interpolate position between restaurant and destination
  return [
    startLng + (endLng - startLng) * fraction,
    startLat + (endLat - startLat) * fraction
  ];
};
```

### **Smart Status Detection**
- Automatically shows "delivered" when drone reaches destination
- Real-time status updates based on position calculations
- Visual indicators for all delivery phases

## 🗺️ Multi-City Support

- **New York City** - 3 restaurants (Burger King, McDonalds, Little Italy)
- **Chicago** - 2 restaurants (Chicago Steakhouse, Thai Palace)
- **Los Angeles** - 2 restaurants (Sushi Heaven, Subway)
- **Miami** - 1 restaurant (Taqueria Auténtico Mexicano)
- **San Francisco** - 1 restaurant (Le Petit Bistro)

## 📊 Analytics & Management

- Real-time delivery analytics
- Revenue tracking and reporting
- User behavior insights
- Restaurant performance metrics
- Drone efficiency monitoring

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin, Restaurant Owner, Customer)
- Secure payment processing
- Environment-based configuration
- Input validation and sanitization

## 🎯 Smart Features

### **Intelligent Delivery Management**
- Automatic status detection based on drone position
- Real-time position updates every few seconds
- Visual delivery progress indicators

### **Interactive Maps**
- Click-to-select delivery locations
- Real-time drone movement visualization
- Restaurant and delivery location markers
- Multiple map styles and views

### **Payment Integration**
- Secure Stripe payment processing
- Order confirmation and tracking
- Payment success/failure handling

## 🌐 API Endpoints

### **Authentication**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### **Restaurants**
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/by-city/:city` - Get restaurants by city
- `GET /api/restaurants/:id` - Get restaurant details

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### **Cities**
- `GET /api/cities` - Get all supported cities

## 🏃‍♂️ Getting Started

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Stripe account
- Mapbox account
- Cloudinary account

### **Local Development**

1. **Clone the repository**
```bash
git clone <repository-url>
cd drone-food-delivery
```

2. **Backend Setup**
```bash
cd backend
npm install
# Configure .env with your API keys
npm start
```

3. **Customer App Setup**
```bash
cd uber-eats-clone
npm install
npm run dev
```

4. **Admin Dashboard Setup**
```bash
cd admin-dashboard
npm install
npm run dev
```

### **Environment Variables**

Create `.env` files in each directory:

**Backend (.env)**
```env
PORT=4000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🚀 Deployment

The application is deployed on **Fly.io** using Docker containers:

```bash
# Deploy backend
cd backend && flyctl deploy

# Deploy customer app
cd uber-eats-clone && flyctl deploy --build-arg VITE_API_URL="https://your-backend.fly.dev"

# Deploy admin dashboard
cd admin-dashboard && flyctl deploy --build-arg VITE_API_URL="https://your-backend.fly.dev"
```

## 📱 Screenshots

### Customer App
- **Homepage**: City selection with beautiful images
- **City Page**: Interactive map and restaurant listings
- **Restaurant Page**: Menu browsing and ordering
- **Order Tracking**: Real-time delivery progress

### Admin Dashboard
- **Delivery Management**: Live drone tracking on interactive maps
- **Analytics**: Comprehensive business insights
- **Restaurant Management**: Add/edit restaurants and menus
- **User Management**: Customer and staff administration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mapbox** for incredible mapping services
- **Stripe** for secure payment processing
- **Cloudinary** for image management
- **MongoDB Atlas** for reliable database hosting
- **Fly.io** for seamless deployment

---

**Built with ❤️ for the future of food delivery**

🚁 *Experience the next generation of food delivery with real-time drone tracking!*