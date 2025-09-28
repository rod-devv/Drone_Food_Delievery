import React from "react";
import "./About.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  FaLeaf,
  FaStopwatch,
  FaShieldAlt,
  FaUtensils,
  FaChartLine,
} from "react-icons/fa";
import { GiDeliveryDrone } from "react-icons/gi"; // Import drone icon from Game Icons

const About = () => {
  return (
    <div className="about-page">
      {/* <Navbar /> */}
      <div className="about-container">
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>Revolutionizing Food Delivery with Drones</h1>
            {/* <p>
              Welcome to Drone Food Delivery – where cutting-edge technology
              meets culinary excellence.
            </p> */}
          </div>
        </section>

        <section className="about-mission">
          <div className="sub-title">
            <p>
              Welcome to Drone Food Delivery where cutting-edge technology meets
              culinary.
            </p>
          </div>

          <div className="section-container">
            <h2>Our Mission</h2>
            <p>
              At Drone Food Delivery, we're transforming the restaurant industry
              by replacing traditional automobile deliveries with
              state-of-the-art drone technology. Our platform empowers
              restaurants to deliver meals faster, more efficiently, and with a
              significantly reduced environmental footprint.
            </p>
            <p>
              Founded in 2025, we've quickly grown to become the leading drone
              delivery platform, connecting hungry customers with their favorite
              local restaurants through an innovative, contactless delivery
              experience.
            </p>
          </div>
        </section>

        <section className="about-benefits">
          <div className="section-container">
            <h2>Why Drone Delivery?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <FaStopwatch className="benefit-icon" />
                <h3>Faster Deliveries</h3>
                <p>
                  Our drones deliver meals in record time by flying direct
                  routes, avoiding traffic congestion that slows down
                  traditional delivery methods.
                </p>
              </div>
              <div className="benefit-card">
                <FaLeaf className="benefit-icon" />
                <h3>Eco-Friendly</h3>
                <p>
                  Dramatically reduce your restaurant's carbon footprint with
                  zero-emission deliveries that help protect our environment for
                  future generations.
                </p>
              </div>
              <div className="benefit-card">
                <FaShieldAlt className="benefit-icon" />
                <h3>Contactless & Safe</h3>
                <p>
                  Offer your customers the safest delivery experience possible
                  with fully contactless drone deliveries right to their
                  doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-platform">
          <div className="section-container">
            <h2>Our Comprehensive Platform</h2>
            <div className="platform-grid">
              <div className="platform-card">
                <FaUtensils className="platform-icon" />
                <h3>For Restaurants</h3>
                <p>
                  Restaurant owners can easily join our platform and gain access
                  to a sophisticated dashboard to manage orders, track
                  deliveries in real-time, analyze customer data, and optimize
                  their operations.
                </p>
                <p>
                  Our intuitive backend system integrates seamlessly with your
                  existing POS, making the transition to drone delivery smooth
                  and hassle-free.
                </p>
                <button className="cta-button">Partner With Us</button>
              </div>
              <div className="platform-card">
                <GiDeliveryDrone className="platform-icon" />{" "}
                {/* Using GiDeliveryDrone instead */}
                <h3>For Customers</h3>
                <p>
                  Our customer app functions similarly to other food delivery
                  platforms, but with the added excitement of drone delivery.
                  Customers can browse nearby restaurants, place orders, and
                  watch in real-time as their food flies to their location.
                </p>
                <p>
                  With no delivery drivers to tip and reduced delivery costs,
                  customers enjoy a more affordable and efficient experience.
                </p>
                <button className="cta-button">Download the App</button>
              </div>
              <div className="platform-card">
                <FaChartLine className="platform-icon" />
                <h3>Business Intelligence</h3>
                <p>
                  Our platform provides comprehensive analytics and insights to
                  help restaurant owners make data-driven decisions. Track order
                  history, analyze peak hours, identify popular menu items, and
                  much more.
                </p>
                <p>
                  With our powerful reporting tools, you'll have everything you
                  need to optimize your menu, pricing, and operations for
                  maximum profitability.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-join">
          <div className="section-container">
            <h2>Join the Drone Delivery Revolution</h2>
            <p>
              Whether you're a restaurant owner looking to optimize your
              delivery operations or a food enthusiast excited about receiving
              meals via drone, Drone Food Delivery offers a glimpse into the
              future of food service.
            </p>
            <p>
              Our technology isn't just changing how food gets delivered—it's
              reshaping the entire restaurant industry, making it more
              efficient, sustainable, and customer-focused.
            </p>
            <div className="cta-container">
              <button className="cta-button primary">
                Register Your Restaurant
              </button>
              <button className="cta-button secondary">Learn More</button>
            </div>
          </div>
        </section>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default About;
