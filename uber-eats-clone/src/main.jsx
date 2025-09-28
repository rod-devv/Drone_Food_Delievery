import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext";
import "./global.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// console.log(
//   "VITE_STRIPE_PUBLISHABLE_KEY Key:",
//   import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
// );

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
