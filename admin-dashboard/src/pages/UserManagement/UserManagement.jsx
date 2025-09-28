import React, { useState, useEffect } from "react";
import userService from "../../services/userService";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Using userService instead of direct API calls
      const data = await userService.getUsers();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn("API did not return an array of users:", data);
        setUsers([]);
      }
    } catch (err) {
      setError(
        "Failed to load users. Make sure your backend server is running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError(null);
      // Using userService instead of direct API calls
      await userService.updateUserRole(userId, newRole);

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      setSuccessMessage(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update user role. Check your backend connection.");
      console.error(err);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;

    try {
      setError(null);
      // Using userService instead of direct API calls
      await userService.deleteUser(confirmDelete);

      setUsers(users.filter((user) => user._id !== confirmDelete));
      setConfirmDelete(null);

      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete user. Check your backend connection.");
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleRetry = () => {
    loadUsers();
  };

  let filteredUsers = [];

  // Only try to filter if users is an array
  if (Array.isArray(users)) {
    filteredUsers = users.filter((user) => {
      // Safe access to properties with optional chaining
      const nameMatch =
        (user?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === "all" || user?.role === roleFilter;

      return nameMatch && roleMatch;
    });
  }

  // Show loading indicator
  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  // Show error with retry button
  if (error && users.length === 0) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={handleRetry} className="retry-btn">
          Retry
        </button>
        <p className="error-help">
          Please make sure your backend server is running.
          <br />
          Check the browser console for more details about the error.
        </p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <br />

        <div className="filter-container">
          <label>Filter by Role:</label>
          <select value={roleFilter} onChange={handleRoleFilterChange}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="restaurateur">Restaurateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="user-list">
        {filteredUsers.length === 0 ? (
          <div className="no-data">
            {loading
              ? "Loading users..."
              : "No users found matching your criteria."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>
                    <select
                      value={user.role || "user"}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="restaurateur">Restaurateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <div className="delete-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>
            <div className="modal-buttons">
              <button onClick={confirmDeleteUser}>Yes, Delete</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
