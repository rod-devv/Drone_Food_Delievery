import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
// import Header from "../Header/Header";
import userService from "../../services/userService";
import "./Layout.css";

const Layout = ({ children }) => {
  // Set initial state based on user role
  const userRole = userService.getUserRole();
  console.log("Layout detected user role:", userRole);

  // Define navigation items as constants
  const adminNavItems = [
    { path: "/", label: "Admin Dashboard", icon: "📊" },
    { path: "/delivery-management", label: "Delivery Management", icon: "🚚" },
    {
      path: "/restaurant-management",
      label: "Restaurant Management",
      icon: "🍽️",
    },
    { path: "/add-restaurant", label: "Add Restaurant", icon: "➕" },
    { path: "/user-management", label: "User Management", icon: "👥" },
    { path: "/data-analytics", label: "Data Analytics", icon: "📈" },
    { path: "/ai-center", label: "AI Center", icon: "🤖" },
  ];

  const restaurateurNavItems = [
    { path: "/", label: "Owner Dashboard", icon: "📊" },
    { path: "/delivery-management", label: "Delivery Management", icon: "🚚" },
    { path: "/add-food", label: "Add Food", icon: "🍔" },
    { path: "/rest-management", label: "Restaurant Management", icon: "📋" },
    { path: "/data-analytics-owner", label: "Data Analytics", icon: "📈" },
    { path: "/ai-center", label: "AI Center", icon: "🤖" },
  ];

  // Directly set initial state based on role
  const [navItems, setNavItems] = useState(
    userRole === "restaurateur" ? restaurateurNavItems : adminNavItems
  );

  // Additionally, listen for role changes
  useEffect(() => {
    // Function to update navigation based on role
    const updateNavigation = () => {
      const currentRole = userService.getUserRole();
      console.log("Updating navigation for role:", currentRole);

      if (currentRole === "restaurateur") {
        setNavItems(restaurateurNavItems);
      } else {
        setNavItems(adminNavItems);
      }
    };

    // Update on mount
    updateNavigation();

    // Setup event listener for login/logout changes
    window.addEventListener("storage", (e) => {
      if (e.key === "userRole" || e.key === "token") {
        updateNavigation();
      }
    });

    return () => {
      window.removeEventListener("storage", updateNavigation);
    };
  }, []);

  return (
    <div className="layout">
      <Sidebar key={userRole} navItems={navItems} />
      <div className="main-content">
        {/* <Header /> */}
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
