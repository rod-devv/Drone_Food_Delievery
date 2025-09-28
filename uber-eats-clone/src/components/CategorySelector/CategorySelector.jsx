import React from "react";
import { categories } from "../../data/categories";
import "./CategorySelector.css";

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="category-selector">
      <h2>Categories</h2>
      <div className="category-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item ${
              selectedCategory === category.id ? "selected" : ""
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <img src={category.icon} alt={category.name} />
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
