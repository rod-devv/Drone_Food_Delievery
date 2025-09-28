import React, { useEffect, useState } from 'react';
import { getUsers } from '../../services/userService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import './UserManagement.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-list">
      <h1>User Management</h1>
      <SearchBar 
        placeholder="Search users..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      <Table data={filteredUsers} />
    </div>
  );
};

export default UserList;