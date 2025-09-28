import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CityPage from "./pages/CityPage/CityPage";
import RestaurantPage from "./pages/RestaurantPage/RestaurantPage";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import CartPage from "./pages/CartPage/CartPage";
import OrderSuccessPage from "./pages/OrderSuccess/OrderSuccess";
import OrderCancelPage from "./pages/OrderCancel/OrderCancel";
import OrderPage from "./pages/OrderPage/OrderPage";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Faq from "./pages/Faq/Faq";

const ScrollToTopOnMount = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <>
      <ScrollToTopOnMount />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/city/:cityId" element={<CityPage />} />
          <Route
            path="/restaurant/:restaurantId"
            element={<RestaurantPage />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />{" "}
          {/* Add the OrderPage route */}
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order-cancel" element={<OrderCancelPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
