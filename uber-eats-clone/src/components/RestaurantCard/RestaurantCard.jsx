import React from "react";
import { Link } from "react-router-dom";
import { getRestaurantImageUrl } from "../../utils/restaurantImages";
import "./RestaurantCard.css";

const RestaurantCard = ({ restaurant }) => {
  // const { _id, name, address, description, rating, imageUrl } = restaurant;

  // console.log("restaurant@@@@@@@@@ === ", restaurant);
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star full">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">
            ☆
          </span>
        );
      }
    }

    return stars;
  };

  return (
    <Link to={`/restaurant/${restaurant._id}`} className="restaurant-card">
      {/* <Link to={`/restaurant/"sshit"}`} className="restaurant-card"> */}
      <div className="restaurant-image">
        <img
          src={getRestaurantImageUrl(restaurant)}
          alt={restaurant.name}
        />
      </div>
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p className="restaurant-address">{restaurant.address}</p>
        <p className="restaurant-description">{restaurant.description}</p>
        <div className="restaurant-rating">
          <span className="rating-number">{restaurant.rating}</span>
          <div className="rating-stars">{renderStars(restaurant.rating)}</div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
