import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "../../styles/AuthModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const AuthModal = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const {
    setIsLoginModalOpen,
    setIsSignupModalOpen, // Added this line to get the setIsSignupModalOpen function
    login,
    signup,
    url,
    isLoginModalOpen,
    isSignupModalOpen, // Added this line to get the isSignupModalOpen state
  } = useApp();

  // Update the mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset form when switching modes
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
  }, [mode]);

  const onLogin = async (e) => {
    e.preventDefault();

    try {
      let new_url = url;
      if (mode === "login") {
        new_url += "/api/user/login";
      } else {
        new_url += "/api/user/register";
      }

      const response = await axios.post(new_url, data);

      console.log("response==", response);
      if (response.data.success) {
        if (mode === "login") {
          console.log("successful==");
          toast.success("Login successful");
          login({
            name: response.data.user?.name || "User",
            email: data.email,
          });
        } else {
          console.log("Created Account");
          toast.success("Account created successfully");
          signup({
            name: data.name,
            email: data.email,
          });
        }
        closeModal();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  // Fixed switchMode function - just toggle the mode without closing the modal
  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  const closeModal = () => {
    // Close both modals to ensure the modal goes away regardless of which mode we're in
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeModal}>
          &times;
        </button>

        <h2>{mode === "login" ? "Log in" : "Sign up"}</h2>

        <form onSubmit={onLogin}>
          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                required={mode === "signup"}
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              required
              placeholder={
                mode === "login" ? "Enter your password" : "Create a password"
              }
              minLength={6}
            />
            {mode === "signup" && (
              <small className="password-hint">
                Password must be at least 6 characters
              </small>
            )}
          </div>

          <button type="submit" className="submit-button">
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="switch-form">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <button type="button" className="text-button" onClick={switchMode}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
