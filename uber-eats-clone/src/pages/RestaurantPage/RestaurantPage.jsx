import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaClock,
  FaMotorcycle,
} from "react-icons/fa";

import { useApp } from "../../context/AppContext";

import SearchBar from "../../components/SearchBar/SearchBar";

import MenuItem from "../../components/MenuItem/MenuItem";
import ItemModal from "../../components/ItemModal/ItemModal";
import Cart from "../../components/Cart/Cart";
import "./RestaurantPage.css";
import Reviews from "../../components/Reviews/Reviews";

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const {
    userAddress,
    setUserAddress,
    setCart,
    setRestaurantId,
    selectedLocation,
    getRestaurantById,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [categoryItemsMap, setCategoryItemsMap] = useState({}); // Track items per category

  const menuRef = useRef(null);
  const categorySectionRefs = useRef({});

  // Save Restaurant Id in context
  useEffect(() => {
    // console.log("rest page ");

    setRestaurantId(restaurantId);

    // console.log("rest page -- restaurantId -- ", restaurantId);
    const fetchRestaurant = async () => {
      try {
        const temp = await getRestaurantById(restaurantId);
        // console.log("restaurant current", temp);
        setRestaurant(temp);
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      }
    };
    fetchRestaurant();
  }, []);

  // Debug restaurant data and categories
  useEffect(() => {
    if (restaurant && restaurant.menuItems) {
      // console.log(`DEBUG - Restaurant: ${restaurant.name}`);
      // console.log("DEBUG - Menu categories:", restaurant.menu.categories);
      // console.log("DEBUG - Menu items count:", restaurant.menuItems.length);

      // Create a map of categories to items for debugging
      const categoryMap = {};

      // Initialize all categories with empty arrays
      restaurant.menu.categories.forEach((category) => {
        categoryMap[category.id] = [];
      });

      // Add items to their categories
      restaurant.menuItems.forEach((item) => {
        const categoryId = item.category;
        if (categoryMap[categoryId]) {
          categoryMap[categoryId].push(item);
        } else {
          console.warn(
            `Item ${item.name} has category ${categoryId} which doesn't exist in categories list`
          );
        }
      });

      // Log the mapping
      // console.log("DEBUG - Category to items mapping:");
      Object.keys(categoryMap).forEach((categoryId) => {
        const category = restaurant.menu.categories.find(
          (c) => c.id === categoryId
        );
        const categoryName = category ? category.name : "Unknown";
        // console.log(
        //   `${categoryName} (${categoryId}): ${categoryMap[categoryId].length} items`
        // );
      });

      // Store the mapping in state for use in rendering
      setCategoryItemsMap(categoryMap);
    }
  }, [restaurant]);

  useEffect(() => {
    if (
      restaurant &&
      restaurant.menu &&
      restaurant.menu.categories.length > 0
    ) {
      setActiveCategory(restaurant.menu.categories[0].id);
    }
  }, [restaurant]);

  // Setup sticky menu observer
  useEffect(() => {
    if (!menuRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    observer.observe(menuRef.current);

    return () => {
      observer.disconnect();
    };
  }, [menuRef]);

  // Scroll to section on category change
  useEffect(() => {
    if (activeCategory && categorySectionRefs.current[activeCategory]) {
      categorySectionRefs.current[activeCategory].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, [activeCategory]);

  // Loading state
  if (!restaurant) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  // Get popular items
  const popularItems = restaurant.menuItems.filter((item) => item.popular);

  const handleAddressSearch = (address) => {
    setUserAddress(address);
  };

  const handleAddToCart = (item, quantity = 1, options = []) => {
    const newItem = {
      ...item,
      quantity,
      options,
      totalPrice:
        item.price * quantity +
        options.reduce((sum, opt) => sum + (opt.price || 0), 0),
    };

    setCartItems([...cartItems, newItem]);
    setIsModalOpen(false);
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Price range indicator
  const priceIndicator = () => {
    return restaurant.priceRange;
  };

  // Function to get items for a category with better error handling
  const getItemsForCategory = (categoryId) => {
    // First try exact match
    let items = restaurant.menuItems.filter(
      (item) => item.category === categoryId
    );

    // If no items found, try case-insensitive match
    if (items.length === 0) {
      items = restaurant.menuItems.filter((item) => {
        if (!item.category) return false;
        return (
          item.category.toString().toLowerCase() ===
          categoryId.toString().toLowerCase()
        );
      });
    }

    // If still no items, try to match based on name
    if (items.length === 0) {
      const category = restaurant.menu.categories.find(
        (c) => c.id === categoryId
      );
      if (category) {
        const categoryName = category.name.toLowerCase();
        items = restaurant.menuItems.filter((item) => {
          if (!item.category) return false;

          // Try to match category name if it's a string
          if (typeof item.category === "string") {
            return item.category.toLowerCase().includes(categoryName);
          }
          return false;
        });
      }
    }

    return items;
  };

  return (
    <div className="restaurant-page">
      {/* <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Homepage
      </button> */}
      {/* Hero Section with Restaurant Image */}
      <div
        className="restaurant-hero"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dynoujkny/image/upload/images/rests/${restaurant.name}/${restaurant.name}.jpg')`,
        }}
      >
        <div className="hero-overlay">
          <div className="logo-image">
            <img
              src={`https://res.cloudinary.com/dynoujkny/image/upload/images/rests/${restaurant.name}/logo.png`}
              alt=""
            />
          </div>
          <div className="hero-content">
            <div className="favor-con">
              <button
                className="btn-favorite"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? (
                  <FaHeart className="heart filled" />
                ) : (
                  <FaRegHeart className="heart" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-info">
        <h1>{restaurant.name}</h1>
        <p className="restaurant-description">{restaurant.description}</p>
        <div className="restaurant-meta">
          <span className="ratings">
            <FaStar /> {restaurant.rating} ({restaurant.reviewCount} reviews)
          </span>
          <span className="price-range">{priceIndicator()}</span>
          <span className="delivery-time">
            <FaClock /> {restaurant.deliveryTime}
          </span>
          {/* <span className="delivery-fee">
            <FaMotorcycle /> {restaurant.deliveryFee} delivery
          </span> */}
        </div>
      </div>

      {/* Address Search Bar */}
      <div className="delivery-address-bar" ref={menuRef}>
        <div className="container">
          <div className="address-input">
            <h1 className="title-search">Get it delivered to your door.</h1>
            <SearchBar
              className="search-bar"
              placeholder="Enter your address..."
              value={userAddress}
              onSearch={handleAddressSearch}
            />
          </div>

          <div className="restaurant-info-card">
            <h3>Restaurant Information</h3>
            <div className="info-item">
              <strong>Address:</strong> {restaurant.address}
            </div>
            <div className="info-item">
              <strong>Hours:</strong>{" "}
              {restaurant.hours?.monday || "10:00 AM - 10:00 PM"}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div className={`category-nav ${isSticky ? "sticky" : ""}`}>
        <div className="container">
          {/* <nav> */}
          <ul className="list-foods">
            <li
              className={activeCategory === "popular" ? "active" : ""}
              onClick={() => setActiveCategory("popular")}
            >
              <span>Popular Items</span>
            </li>
            {restaurant.menu.categories.map((category) => (
              <li
                key={category.id}
                className={activeCategory === category.id ? "active" : ""}
                onClick={() => setActiveCategory(category.id)}
              >
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
          {/* </nav> */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="restaurant-content container">
        <div className="menu-column">
          {/* Popular Items Section */}
          <section
            className="menu-section"
            ref={(el) => (categorySectionRefs.current["popular"] = el)}
          >
            <h2>Popular Items</h2>
            <div className="menu-items">
              {popularItems.length > 0 ? (
                popularItems.map((item, index) => (
                  <MenuItem
                    key={item.id || `popular-${index}`}
                    item={item}
                    onClick={() => openItemModal(item)}
                  />
                ))
              ) : (
                <div className="empty-category-message">
                  <p>No popular items available</p>
                  <p className="empty-category-note">
                    Check out our other menu categories!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Regular Menu Sections by Category */}
          {restaurant.menu.categories.map((category) => {
            // Get items using our enhanced function
            const items = getItemsForCategory(category.id);

            // Log for debugging
            // console.log(
            //   `Rendering ${category.name}: found ${items.length} items`
            // );

            return (
              <section
                key={category.id}
                className="menu-section"
                ref={(el) => (categorySectionRefs.current[category.id] = el)}
              >
                <br />
                <h2>{category.name}</h2>
                <div className="menu-items">
                  {items && items.length > 0 ? (
                    items.map((item, index) => (
                      <MenuItem
                        key={item.id || `${category.id}-${index}`}
                        item={item}
                        onClick={() => openItemModal(item)}
                      />
                    ))
                  ) : (
                    <div className="empty-category-message">
                      <p>No items available in this category</p>
                      <p className="empty-category-note">
                        Check back soon for updates to our menu!
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="order-column">
          <div className="order-sticky">
            <Cart
              items={cartItems}
              total={cartTotal}
              deliveryFee={restaurant.deliveryFee}
              restaurantName={restaurant.name}
              onRemoveItem={(index) => {
                const newItems = [...cartItems];
                newItems.splice(index, 1);
                setCartItems(newItems);
              }}
            />
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {isModalOpen && selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default RestaurantPage;
