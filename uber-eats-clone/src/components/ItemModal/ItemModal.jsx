import React, { useEffect, useState } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import "./ItemModal.css";
import { useApp } from "../../context/AppContext";

const ItemModal = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [availableOptions, setAvailableOptions] = useState([]);

  const getImageFilename = (name) => {
    // Convert to lowercase for case-insensitive matching
    const nameLower = name.toLowerCase();

    const foodKeywords = ["fries", "cola", "soda", "pie"];

    // Check each keyword against the item name
    for (const keyword of foodKeywords) {
      if (nameLower.includes(keyword)) {
        return keyword;
      }
    }

    return name;
  };

  useEffect(() => {
    // Initialize available options from item
    setAvailableOptions(item.availableOptions || []);

    // Debug options
    // console.log("Initial available options:", item.availableOptions);
  }, [item]);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleOption = (option) => {
    // console.log("Toggle option:", option);
    // console.log("Current selected options:", selectedOptions);

    // Check if this option is already selected by comparing _id or id
    const optionId = option._id || option.id;
    const isSelected = selectedOptions.some(
      (opt) => (opt._id || opt.id) === optionId
    );

    if (isSelected) {
      // Remove the option from selection
      setSelectedOptions(
        selectedOptions.filter((opt) => (opt._id || opt.id) !== optionId)
      );
    } else {
      // Add the option to selection
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = item.price * quantity;
    const optionsPrice = selectedOptions.reduce(
      (sum, option) => sum + (parseFloat(option.price) || 0),
      0
    );
    return (basePrice + optionsPrice).toFixed(2);
  };

  const handleAddToCart = () => {
    onAddToCart(item, quantity, selectedOptions, specialInstructions);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        {item.imageUrl && (
          <div className="item-image">
            {/* <img src={item.imageUrl} alt={item.name} /> */}

            {/* <img
              // src={`/images/item-names/${item.name}.jpg`}
              src={`/images/item-names/${item.name}.jpg`}


              alt=""
            /> */}

            <img
              // src={food.imageUrl}
              src={`https://res.cloudinary.com/dynoujkny/image/upload/images/item-names/${getImageFilename(
                item.name
              )}.jpg`}
              alt={item.name}
            />

            {/* <img src={`/images/item-names/${item.name}.jpg`} alt={item.id} /> */}
          </div>
        )}

        <div className="item-details">
          <h2>{item.name}</h2>
          <p className="item-description">{item.description}</p>
          <p className="item-base-price">
            Base price: ${item.price.toFixed(2)}
          </p>

          {availableOptions && availableOptions.length > 0 && (
            <div className="item-options-section">
              <h3>Customize Your Order</h3>
              {availableOptions.map((option, index) => {
                const optionId = option._id || option.id;
                const isChecked = selectedOptions.some(
                  (opt) => (opt._id || opt.id) === optionId
                );

                return (
                  <div key={optionId || index} className="option-row">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption(option)}
                      />
                      <span>{option.name}</span>
                      {option.price > 0 && (
                        <span className="option-price">
                          +${parseFloat(option.price).toFixed(2)}
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          <div className="special-instructions">
            <h3>Special Instructions</h3>
            <textarea
              placeholder="Add any special requests here..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          <div className="quantity-selector">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button
                className="plus-button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <span
                  style={{
                    color: "black",
                    // fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  -
                </span>
              </button>
              <span>{quantity}</span>
              <button
                onClick={increaseQuantity}
                aria-label="Increase quantity"
                className="plus-button"
              >
                <span
                  style={{
                    color: "black",
                    // fontWeight: "bold",
                    fontSize: "20px",
                    hover: { Background: "black" },
                  }}
                >
                  +
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="total-price">Total: ${calculateTotalPrice()}</div>
          <button className="add-to-cart-button" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
