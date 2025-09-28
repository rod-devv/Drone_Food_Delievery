import React, { useState } from "react";

const RestaurantForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Restaurant Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="cuisine">Cuisine Type:</label>
        <input
          type="text"
          id="cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="contact">Contact Number:</label>
        <input
          type="text"
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Restaurant</button>
    </form>
  );
};

export default RestaurantForm;