import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import MerchantPage from "./pages/MerchantPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import CourierGuard from "./components/courier/CourierGuard";
import CourierLayout from "./components/courier/CourierLayout";
import CourierHomePage from "./pages/courier/CourierHomePage";
import CourierOrdersPage from "./pages/courier/CourierOrdersPage";
import CourierEarningsPage from "./pages/courier/CourierEarningsPage";
import CourierProfilePage from "./pages/courier/CourierProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/courier"
        element={
          <CourierGuard>
            <CourierLayout />
          </CourierGuard>
        }
      >
        <Route index element={<CourierHomePage />} />
        <Route path="orders" element={<CourierOrdersPage />} />
        <Route path="earnings" element={<CourierEarningsPage />} />
        <Route path="profile" element={<CourierProfilePage />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/merchants/:id" element={<MerchantPage />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
