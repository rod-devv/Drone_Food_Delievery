import React, { useEffect, useState } from 'react';
import { fetchRestaurants } from '../../services/restaurantService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getRestaurants = async () => {
      const data = await fetchRestaurants();
      setRestaurants(data);
    };
    getRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { title: 'Name', key: 'name' },
    { title: 'Location', key: 'location' },
    { title: 'Actions', key: 'actions' },
  ];

  const actions = (restaurant) => (
    <button onClick={() => handleDelete(restaurant.id)}>Delete</button>
  );

  const handleDelete = (id) => {
    // Logic to delete restaurant
  };

  return (
    <div>
      <h1>Restaurant Management</h1>
      <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <Table columns={columns} data={filteredRestaurants.map(restaurant => ({
        ...restaurant,
        actions: actions(restaurant),
      }))} />
    </div>
  );
};

export default RestaurantList;