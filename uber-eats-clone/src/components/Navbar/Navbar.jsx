import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import AuthModal from "../auth/AuthModal";
import "./Navbar.css";
import { GiDeliveryDrone } from "react-icons/gi";
const Navbar = () => {
  const {
    user,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignupModalOpen,
    setIsSignupModalOpen,
  } = useApp();

  // Determine which modal to show
  const showLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const showSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  // useEffect(() => {
  //   console.log("Navbar user:", user);
  // }, []);

  return (
    <nav className="navbar">
      <br />

      <div className="navbar-container">
        <Link to="/">
          <div className="logo-container">
            <GiDeliveryDrone className="icon-drone" />
            <span
              style={{
                position: "absolute",
                color: "white",
                border: "1px solid white",
                padding: "2px",
                borderRadius: "5px",
                marginRight: "2px",
                fontSize: "20px",
                top: "-13px",

                background: "rgb(167, 52, 52)",
                zIndex: "100",
              }}
            >
              FooD
            </span>
            <h1 id="logo">elivery</h1>
          </div>
        </Link>

        <div className="navbar-buttons">
          {user ? (
            <>
              <span className="welcome-text">{user.name}</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={showLoginModal}>
                Login
              </button>
              <button className="signup-btn" onClick={showSignupModal}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
      {/* Only render one modal at a time with the correct initialMode */}
      {isLoginModalOpen && <AuthModal initialMode="login" />}
      {isSignupModalOpen && <AuthModal initialMode="signup" />}
    </nav>
  );
};

export default Navbar;
