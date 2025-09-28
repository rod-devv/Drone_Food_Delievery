import React, { useState, useRef, useEffect } from "react";
import "./AuthModal.css";
import { useApp } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AuthModal = ({ initialMode = "login" }) => {
  const {
    url,
    login,
    signup,
    setIsLoginModalOpen,
    setIsSignupModalOpen,
    setToken,
  } = useApp();

  // Directly map initialMode to the corresponding display string
  const [currState, setCurrState] = useState(
    initialMode === "login" ? "Login" : "Sign Up"
  );

  const modalRef = useRef(null);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Update currState whenever initialMode changes
  useEffect(() => {
    setCurrState(initialMode === "login" ? "Login" : "Sign Up");
  }, [initialMode]);

  // Log the initialMode and currState for debugging
  //   console.log("InitialMode:", initialMode);
  //   console.log("CurrState:", currState);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // Function to close the modal
  const closeModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      let new_url = url;
      if (currState === "Login") {
        new_url += "/api/users/login";
      } else {
        new_url += "/api/users/register";
      }

      console.log("Submitting to:", new_url);
      console.log("With data:", data);

      const response = await axios.post(new_url, data);
      console.log("response");
      console.log("response :", response);
      if (response.data.success) {
        // Handle successful login/signup
        if (currState === "Login") {
          setToken(response.data.token);
          console.log("saved token in local storage :", response.data.token);
          localStorage.setItem("token", response.data.token);
          login({
            name: response.data.name,
            email: data.email,
          });
          toast.success("Login successful!");
        } else {
          signup({
            name: data.name,
            email: data.email,
          });
          toast.success("Account created successfully!");
        }
        closeModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="login-popup" onClick={closeModal}>
      <form
        ref={modalRef}
        onSubmit={onLogin}
        className="login-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <button type="button" className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="login-popup-inputs">
          {currState === "Sign Up" ? (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          ) : null}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">
          {currState === "Login" ? "Login" : "Create account"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" name="" id="" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default AuthModal;
