import React, { useState } from "react";
import "./Contact.css";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaHeadset,
  FaPlane, // We'll use this as a replacement
} from "react-icons/fa";
import { GiDeliveryDrone } from "react-icons/gi"; // Import drone icon from Game Icons

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
        </div>
      </div>

      <div className="sub-title">
        <p>
          We'd love to hear from you. Whether you're a restaurant owner
          interested in partnering with us, a customer with questions, or just
          curious about drone delivery technology - our team is ready to help!
        </p>
      </div>

      <div className="contact-container">
        <section className="contact-info-section">
          <div className="section-container">
            <h2>Contact Information</h2>
            <div className="contact-info-grid">
              <div className="info-card">
                <FaMapMarkerAlt className="info-icon" />
                <h3>Our Location</h3>
                <p>123 Drone Avenue</p>
                <p>San Francisco, CA 94105</p>
              </div>

              <div className="info-card">
                <FaPhoneAlt className="info-icon" />
                <h3>Phone Number</h3>
                <p>+1 (555) 123-4567</p>
                <p>+1 (555) 987-6543</p>
              </div>

              <div className="info-card">
                <FaEnvelope className="info-icon" />
                <h3>Email Address</h3>
                <p>info@dronefoodiv.com</p>
                <p>support@dronefoodiv.com</p>
              </div>

              <div className="info-card">
                <FaClock className="info-icon" />
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9am - 8pm</p>
                <p>Saturday - Sunday: 10am - 6pm</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <div className="section-container">
            <div className="form-and-support">
              <div className="contact-form">
                <h2>Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="cta-button">
                    Send Message
                  </button>
                </form>
              </div>

              <div className="support-info">
                <div className="support-card">
                  <FaHeadset className="support-icon" />
                  <h3>Customer Support</h3>
                  <p>
                    Need help with your order or account? Our customer support
                    team is available 24/7.
                  </p>
                  <button className="cta-button">Get Support</button>
                </div>

                <div className="support-card">
                  <GiDeliveryDrone className="support-icon" />
                  <h3>Restaurant Partnerships</h3>
                  <p>
                    Interested in joining our platform? Learn how drone delivery
                    can transform your restaurant.
                  </p>
                  <button className="cta-button">Partner With Us</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="map-section">
          <div className="section-container">
            <h2>Visit Our Headquarters</h2>
            <div className="map-container">
              {/* Replace with your Google Maps embed code */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1134476711103!2d-122.4005!3d37.7915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ3JzI5LjQiTiAxMjLCsDI0JzAxLjgiVw!5e0!3m2!1sen!2sus!4v1619123456789!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Drone Food Delivery Headquarters"
              ></iframe>
            </div>
          </div>
        </section>

        {/* <section className="faq-section">
          <div className="section-container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How does drone delivery work?</h3>
                <p>
                  Our drones navigate using GPS technology to deliver your food
                  directly to your location. When the drone arrives, you'll
                  receive a notification to collect your order from the landing
                  spot.
                </p>
              </div>
              <div className="faq-item">
                <h3>What areas do you serve?</h3>
                <p>
                  We currently operate in select urban areas across the United
                  States. Check our app to see if drone delivery is available in
                  your neighborhood.
                </p>
              </div>
              <div className="faq-item">
                <h3>How do I become a restaurant partner?</h3>
                <p>
                  Restaurant owners can apply through our Partner Portal. We'll
                  guide you through the onboarding process and help set up your
                  drone delivery operations.
                </p>
              </div>
              <div className="faq-item">
                <h3>Is drone delivery more expensive?</h3>
                <p>
                  Actually, drone delivery can be more cost-effective than
                  traditional delivery methods since it eliminates driver costs
                  and reduces delivery time significantly.
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
};

export default Contact;
