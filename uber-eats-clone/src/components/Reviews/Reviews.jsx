import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./Reviews.css";

const Reviews = ({ reviews, totalReviews, averageRating }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-filled" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-filled" />);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-empty" />);
    }

    return stars;
  };

  // Calculate percentages for the rating breakdown
  const getRatingPercentage = (rating) => {
    if (!reviews.length) return 0;
    const count = reviews.filter(
      (review) => Math.floor(review.rating) === rating
    ).length;
    return Math.round((count / reviews.length) * 100);
  };

  return (
    <div className="reviews-container">
      <h2>Customer Reviews</h2>

      <div className="reviews-summary">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="rating-stars">
              {renderStars(averageRating)}
              <span className="total-reviews">({totalReviews} reviews)</span>
            </div>
          </div>

          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} stars</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
                <span className="rating-percentage">
                  {getRatingPercentage(rating)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-image">
                  {review.profileImage ? (
                    <img src={review.profileImage} alt={review.userName} />
                  ) : (
                    <div className="default-profile">
                      {review.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="reviewer-details">
                  <h4>{review.userName}</h4>
                  <div className="review-meta">
                    <span className="review-stars">
                      {renderStars(review.rating)}
                    </span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="review-content">
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="show-more-container">
          <button
            className="show-more-button"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? "Show Less" : "Show All Reviews"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
