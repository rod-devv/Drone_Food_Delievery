import React from "react";
import "./MenuItem.css";

const MenuItem = ({ item, onClick }) => {
  // Function to determine the image filename based on item name
  const getImageFilename = (name) => {
    // Convert to lowercase for case-insensitive matching
    const nameLower = name.toLowerCase();

    const foodKeywords = ["fries", "cola", "soda", "pie"];
    const foodKeywords2 = ["drink", "cola", "soda", "pie"];

    // Check each keyword against the item name
    for (const keyword of foodKeywords) {
      if (nameLower.includes(keyword)) {
        return keyword;
      }
    }

    return name;
  };

  return (
    <div className="menu-item" onClick={onClick}>
      <div className="menu-item-info">
        <h3>{item.name}</h3>
        <p className="menu-item-description">{item.description}</p>
        <p className="menu-item-price">${item.price.toFixed(2)}</p>
        {item.popular && <span className="popular-tag">Popular</span>}
      </div>

      <div className="menu-item-image">
        <img
          src={`https://res.cloudinary.com/dynoujkny/image/upload/images/item-names/${getImageFilename(
            item.name
          )}.jpg`}
          alt={item.name}
          onError={(e) => {
            // Fallback image if the specific one isn't found
            e.target.src =
              "https://res.cloudinary.com/dynoujkny/image/upload/images/item-names/default-food.jpg";
          }}
        />
      </div>
    </div>
  );
};

export default MenuItem;
