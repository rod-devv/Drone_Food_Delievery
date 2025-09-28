import React from "react";
import "./Footer.css";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";

const Footer = () => {
  // Determine if we're in local development or production
  const isLocalDev = !import.meta.env.PROD;
  const baseUrl = isLocalDev ? "/" : "https://drone-food-client.fly.dev/";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Drone Food Delivery</h3>
          <p>
            cutting-edge drone technology. Eco-friendly service for the modern
            world.
          </p>
        </div>

        <div className="footer-section middle">
          <ul>
            <li>
              <a href={`${baseUrl}`}>Home</a>
            </li>
            <li>
              <a href={`${baseUrl}about`}>About Us</a>
            </li>
            <li>
              <a href={`${baseUrl}contact`}>Contact</a>
            </li>
            <li>
              <a href={`${baseUrl}faq`}>FAQ</a>
            </li>
          </ul>
        </div>

        <div className="footer-section middle">
          <ul>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>

        <div className="footer-section middle">
          <h3>Connect with Us</h3>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <FaFacebook size={24} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>

        <div className="app-download">
          <h3>Download Our App</h3>
          <div className="download-buttons">
            <a href="#" className="download-button app-store">
              <FaApple size={20} />
              <div className="download-text">
                <span className="download-small">Download on the</span>
                <span className="download-big">App Store</span>
              </div>
            </a>
            <a href="#" className="download-button google-play">
              <FaGooglePlay size={20} />
              <div className="download-text">
                <span className="download-small">GET IT ON</span>
                <span className="download-big">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Drone Food Delivery App. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
