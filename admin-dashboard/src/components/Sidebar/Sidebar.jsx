// const navItems = [
//   { path: "/", label: "Dashboard", icon: "📊" },
//   { path: "/delivery-management", label: "Delivery Management", icon: "🚚" },
//   {
//     path: "/restaurant-management",
//     label: "Restaurant Management",
//     icon: "🍽️",
//   },
//   { path: "/add-restaurant", label: "Add Restaurant", icon: "➕" },
//   { path: "/user-management", label: "User Management", icon: "👥" },
//   { path: "/data-analytics", label: "Data Analytics", icon: "📈" },
//   { path: "/ai-center", label: "AI Center", icon: "🤖" },
// ];

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import "./Sidebar.css";

const Sidebar = ({ navItems }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      console.log("Logging out user...");
      
      // Use the userService logout function
      userService.logout();
      
      // Clear all authentication-related items from localStorage
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      
      // Clear session storage as well (just in case)
      sessionStorage.clear();
      
      console.log("User logged out successfully");
      
      // Force a page reload to clear any cached state and navigate to login
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, force navigation to login
      window.location.href = "/login";
    }
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Food Delivery</h2>
      </div>
      <nav className="nav-menu">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-symbols-outlined">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
