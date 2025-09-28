import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import DeliveryManagement from "./pages/DeliveryManagement/DeliveryManagement";
import RestaurantManagement from "./pages/RestaurantManagement/RestaurantManagement";
import AddRestaurant from "./pages/AddRestaurant/AddRestaurant";
import UserManagement from "./pages/UserManagement/UserManagement";
import DataAnalytics from "./pages/DataAnalytics/DataAnalytics";
import AICenter from "./pages/AICenter/AICenter";
import AddFood from "./pages/AddFood/AddFood";

import "./App.css";
import userService from "./services/userService";
import RestaurantManagementOwner from "./pages/RestaurantManagementOwner/RestaurantManagementOwner";
import DataAnalyticsOwner from "./pages/DataAnalyticsOwner/DataAnalyticsOwner";
// Role-based protected route component

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = userService.isAuthenticated();
  const userRole = userService.getUserRole();

  console.log("Auth check:", { isAuthenticated, userRole, allowedRoles });

  // Check if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`User role ${userRole} not in allowed roles:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Admin-only protected route
const AdminRoute = ({ children }) => {
  return <RoleBasedRoute allowedRoles={["admin"]}>{children}</RoleBasedRoute>;
};

// Route accessible by both admin and restaurateur
const SharedRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={["admin", "restaurateur"]}>
      {children}
    </RoleBasedRoute>
  );
};

// Restaurateur-only protected route
const RestaurateurRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={["restaurateur"]}>{children}</RoleBasedRoute>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Unauthorized page */}
          <Route
            path="/unauthorized"
            element={
              <Layout>
                <div className="unauthorized-page">
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              </Layout>
            }
          />

          {/* Shared routes (accessible by both admin and restaurateur) */}
          <Route
            path="/"
            element={
              <SharedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </SharedRoute>
            }
          />

          <Route
            path="/delivery-management"
            element={
              <SharedRoute>
                <Layout>
                  <DeliveryManagement />
                </Layout>
              </SharedRoute>
            }
          />

          <Route
            path="/data-analytics"
            element={
              <AdminRoute>
                <Layout>
                  <DataAnalytics />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/data-analytics-owner"
            element={
              <RestaurateurRoute>
                <Layout>
                  <DataAnalyticsOwner />
                </Layout>
              </RestaurateurRoute>
            }
          />

          <Route
            path="/ai-center"
            element={
              <SharedRoute>
                <Layout>
                  <AICenter />
                </Layout>
              </SharedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/restaurant-management"
            element={
              <AdminRoute>
                <Layout>
                  <RestaurantManagement />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/add-restaurant"
            element={
              <AdminRoute>
                <Layout>
                  <AddRestaurant />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/user-management"
            element={
              <AdminRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Restaurateur-only routes */}
          <Route
            path="/add-food"
            element={
              <RestaurateurRoute>
                <Layout>
                  <AddFood />
                </Layout>
              </RestaurateurRoute>
            }
          />

          <Route
            path="/rest-management"
            element={
              <RestaurateurRoute>
                <Layout>
                  <RestaurantManagementOwner />
                </Layout>
              </RestaurateurRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
