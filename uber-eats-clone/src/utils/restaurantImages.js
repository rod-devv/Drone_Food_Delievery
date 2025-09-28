// Mapping of restaurant names to correct Cloudinary URLs
export const restaurantImageMap = {
  // NYC
  "Burger King": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051283/images/rests/Burger%20King/Burger%20King.jpg",
  "McDonalds": "https://res.cloudinary.com/dynoujkny/image/upload/v1745143342/images/rests/McDonalds/McDonalds.jpg",
  "Little Italy": "https://res.cloudinary.com/dynoujkny/image/upload/images/rest.jpg",
  
  // Chicago  
  "Thai Palace": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051284/images/rests/Thai%20Palace/Thai%20Palace.jpg",
  "Chicago Steakhouse": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051264/images/rests/Chicago%20Steakhouse/Chicago%20Steakhouse.jpg",
  
  // LA
  "Sushi Heaven": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051285/images/rests/Sushi%20Heaven/Sushi%20Heaven.jpg",
  "Subway": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051286/images/rests/Subway/Subway.jpg",
  
  // Miami
  "Taqueria Auténtico Mexicano": "https://res.cloudinary.com/dynoujkny/image/upload/v1745056194/images/rests/Taqueria%20Aut%C3%A9ntico%20Mexicano/Taqueria%20Aut%C3%A9ntico%20Mexicano.jpg",
  
  // SF
  "Le Petit Bistro": "https://res.cloudinary.com/dynoujkny/image/upload/v1745051288/images/rests/Le%20Petit%20Bistro/Le%20Petit%20Bistro.jpg",
};

// Helper function to get correct image URL
export const getRestaurantImageUrl = (restaurant) => {
  // First try the mapped URL
  if (restaurantImageMap[restaurant.name]) {
    return restaurantImageMap[restaurant.name];
  }
  
  // Then try the backend imageUrl
  if (restaurant.imageUrl && !restaurant.imageUrl.includes('404')) {
    return restaurant.imageUrl;
  }
  
  // Finally fallback to local path
  return `/images/rests/${restaurant.name}/${restaurant.name}.jpg`;
};