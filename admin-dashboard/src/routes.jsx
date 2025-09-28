import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import DeliveryManagement from './pages/DeliveryManagement/DeliveryManagement';
import RestaurantManagement from './pages/RestaurantManagement/RestaurantManagement';
import AddRestaurant from './pages/AddRestaurant/AddRestaurant';
import UserManagement from './pages/UserManagement/UserManagement';
import DataAnalytics from './pages/DataAnalytics/DataAnalytics';
import AICenter from './pages/AICenter/AICenter';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/delivery-management" element={<DeliveryManagement />} />
        <Route path="/restaurant-management" element={<RestaurantManagement />} />
        <Route path="/add-restaurant" element={<AddRestaurant />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/data-analytics" element={<DataAnalytics />} />
        <Route path="/ai-center" element={<AICenter />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;