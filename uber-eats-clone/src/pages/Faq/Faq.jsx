import React, { useState, useEffect } from "react";
import "./Faq.css";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GiDeliveryDrone } from "react-icons/gi";

const FAQ = () => {
  // State for tracking which FAQ items are open
  const [openItems, setOpenItems] = useState({});
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for filtered FAQ items
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How does drone food delivery work?",
      answer:
        "Our drone delivery system uses autonomous flying vehicles to transport food from restaurants to customers. When you place an order, it's prepared at the restaurant, loaded into a temperature-controlled compartment on our drone, and then flown directly to your delivery location. Upon arrival, the drone will hover at a safe height and lower your food via a specialized cable system. You'll receive real-time notifications through our app to track your delivery from restaurant to doorstep.",
    },
    {
      id: 2,
      question: "What areas do you currently serve?",
      answer:
        "We currently operate in select urban and suburban areas across major cities including San Francisco, Los Angeles, New York, Chicago, and Miami. Our service area is constantly expanding as we refine our technology and receive necessary regulatory approvals. You can check if your address is within our delivery zone by entering your location in our app or website.",
    },
    {
      id: 3,
      question: "Is there a weight limit for drone deliveries?",
      answer:
        "Yes, our current drone fleet can safely carry orders up to 10 pounds (approximately 4.5 kg). This covers most standard meal orders including drinks. For larger orders, our system may split your delivery into multiple drones or suggest our traditional delivery options. The app will automatically notify you if your order exceeds the weight limit.",
    },
    {
      id: 4,
      question: "How do weather conditions affect drone deliveries?",
      answer:
        "Our drones are designed to operate in various weather conditions, but extreme weather may cause delays or temporary service suspensions. This includes high winds (over 25 mph), heavy rain, snow, or thunderstorms. During such conditions, we'll notify you immediately and offer the option to either wait for conditions to improve or switch to traditional delivery methods. Safety is our top priority, and our system continuously monitors weather conditions.",
    },
    {
      id: 5,
      question:
        "What happens if there's no safe landing spot at my delivery location?",
      answer:
        "Before finalizing your order, our app will scan your delivery location to confirm it's drone-accessible. If your primary location lacks a suitable landing area, the app will suggest nearby alternative delivery points. For apartments or office buildings, we often have designated drone delivery spots on rooftops or in courtyard areas. You can also set pre-approved landing spots in your account settings for regular deliveries.",
    },
    {
      id: 6,
      question:
        "How much does drone delivery cost compared to traditional delivery?",
      answer:
        "Drone delivery is typically priced similarly to traditional delivery, with fees ranging from $1.99 to $4.99 depending on distance and order size. In many cases, drone delivery can actually be more cost-effective for shorter distances due to lower operational costs. We also offer a subscription service called 'Drone Prime' that provides unlimited free drone deliveries for a monthly fee of $9.99.",
    },
    {
      id: 7,
      question: "How do I become a restaurant partner for drone delivery?",
      answer:
        "Restaurant owners can apply to become partners through our 'Restaurant Partners' portal on our website. The onboarding process includes an assessment of your kitchen operation, installation of specialized packaging stations, and staff training. Our team will work with you to ensure seamless integration with your existing operations. There's a one-time setup fee of $299, which includes all necessary equipment and training.",
    },
    {
      id: 8,
      question: "Are drone deliveries environmentally friendly?",
      answer:
        "Yes, our drone deliveries have a significantly smaller carbon footprint compared to traditional vehicle deliveries. Our drones are 100% electric and produce zero direct emissions. A study by our sustainability team found that drone deliveries reduce carbon emissions by up to 90% compared to car deliveries for the same distance. We're also implementing solar charging stations for our drone fleet to further reduce our environmental impact.",
    },
    {
      id: 9,
      question: "What safety measures are in place for drone deliveries?",
      answer:
        "We've implemented multiple safety systems including obstacle detection and avoidance technology, redundant navigation systems, and automatic return-to-base protocols in case of any technical issues. All our drones undergo rigorous testing and are certified by relevant aviation authorities. We also maintain comprehensive insurance coverage and our drone operators receive extensive training and certification.",
    },
    {
      id: 10,
      question: "How is my food kept at the right temperature during delivery?",
      answer:
        "Our drones are equipped with insulated, temperature-controlled compartments that maintain hot foods at approximately 140°F (60°C) and cold items below 40°F (4°C). The compartments use a combination of passive insulation and active heating/cooling systems powered by the drone's batteries. This ensures your meal arrives at the optimal temperature, regardless of delivery distance or external weather conditions.",
    },
    {
      id: 11,
      question:
        "What if my drone delivery is late or there's an issue with my order?",
      answer:
        "We have a comprehensive satisfaction guarantee. If your delivery is significantly delayed (more than 15 minutes beyond the estimated time) or if there are issues with your order, you can report it through the app and receive either a full refund or credit toward your next order. Our customer support team is available 24/7 to address any concerns and resolve issues promptly.",
    },
    {
      id: 12,
      question: "Can I schedule drone deliveries in advance?",
      answer:
        "Yes, you can schedule drone deliveries up to 7 days in advance through our app. This is particularly useful for planned events or regular meal deliveries. You can select your preferred delivery date and time window, and our system will confirm availability. We'll send you reminders as your scheduled delivery approaches, and you'll receive real-time updates just like with immediate orders.",
    },
  ];

  // Initialize filtered FAQs with all FAQs
  useEffect(() => {
    setFilteredFaqs(faqData);
  }, []);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter FAQs based on search query
    if (query.trim() === "") {
      setFilteredFaqs(faqData);
    } else {
      const filtered = faqData.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
      setFilteredFaqs(filtered);
    }
  };

  // Toggle FAQ item open/closed state
  const toggleItem = (id) => {
    setOpenItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="faq-hero-content">
          {/* <GiDeliveryDrone className="hero-icon" /> */}
          <h1>Frequently Asked Questions</h1>
          <p>
            Find answers to common questions about our drone food delivery
            service
          </p>
        </div>
      </div>

      <div className="faq-container">
        <div className="faq-search">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for questions or keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchQuery("");
                  setFilteredFaqs(faqData);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="faq-results-summary">
          {searchQuery ? (
            <p>
              Showing {filteredFaqs.length} result
              {filteredFaqs.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          ) : (
            ""
          )}
        </div>

        <div className="faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                className={`faq-item ${openItems[faq.id] ? "open" : ""}`}
                key={faq.id}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleItem(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  {openItems[faq.id] ? (
                    <FaChevronUp className="toggle-icon" />
                  ) : (
                    <FaChevronDown className="toggle-icon" />
                  )}
                </div>
                <div
                  className={`faq-answer ${openItems[faq.id] ? "show" : ""}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p>Try using different keywords or browse all questions</p>
            </div>
          )}
        </div>
      </div>

      <div className="contact-prompt">
        <h2>Still have questions?</h2>
        <p>
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <a href="/contact" className="contact-button">
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default FAQ;
