import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RazorpayButton from "./RazorpayButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout, payCheckout, finalizeCheckout } from "../../redux/slices/checkoutSlice";
import { clearCart } from "../../redux/slices/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { checkout: checkoutState } = useSelector((state) => state.checkout);

  const [checkoutId, setCheckoutId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pinCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    if (cart && cart.products && cart.products.length === 0 && !checkoutState) {
      navigate("/");
    }
  }, [cart, navigate, checkoutState]);

  // ✅ Create Checkout Session
  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if (cart && cart.products.length > 0) {
      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod,
          totalPrice: cart.totalPrice,
        })
      );
      if (res.payload && res.payload._id) {
        setCheckoutId(res.payload._id);
      }
    }
  };

  // ✅ Razorpay success handler
  const handlePaymentSuccess = async (details) => {
    if (!checkoutId) return alert("Checkout session missing!");
    const payRes = await dispatch(
      payCheckout({
        checkoutId,
        paymentStatus: "paid",
        paymentDetails: details,
      })
    );
    if (payRes.meta.requestStatus === "fulfilled") {
      const finalizeRes = await dispatch(finalizeCheckout(checkoutId));
      if (finalizeRes.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        navigate("/order-confirmation");
      } else {
        alert("Finalize failed after payment.");
      }
    } else {
      alert("Payment update failed.");
    }
  };

  // ❌ COD is now disabled
  /*
  const handleCodPayment = async () => {
    if (!checkoutId) return alert("Checkout session missing!");
    const payRes = await dispatch(
      payCheckout({
        checkoutId,
        paymentStatus: "pending",
        paymentDetails: {},
      })
    );
    if (payRes.meta.requestStatus === "fulfilled") {
      const finalizeRes = await dispatch(finalizeCheckout(checkoutId));
      if (finalizeRes.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        navigate("/order-confirmation");
      } else {
        alert("Finalize failed after COD.");
      }
    } else {
      alert("COD payment update failed.");
    }
  };
  */

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error loading cart: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty. Please add items to cart before checkout.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* ================= LEFT SECTION ================= */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-3xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          {/* Contact Details */}
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              className="w-full p-2 border rounded"
              disabled
            />
          </div>

          {/* Delivery Details */}
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Pin Code</label>
              <input
                type="text"
                value={shippingAddress.pinCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, pinCode: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, country: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Phone No.</label>
            <input
              type="text"
              value={shippingAddress.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setShippingAddress({ ...shippingAddress, phone: value });
                }
              }}
              onBlur={(e) => {
                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(e.target.value)) {
                  alert("Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.");
                }
              }}
              className="w-full p-2 border rounded"
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          {/* Payment Section */}
          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
                disabled={loading}
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Payment Method</h3>

                {/* ✅ Razorpay only */}
                <RazorpayButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={() => alert("Payment failed. Try again.")}
                  disabled={loading}
                />

                {/* ❌ COD Option Hidden
                <button
                  type="button"
                  onClick={handleCodPayment}
                  className="w-full bg-green-600 text-white py-3 rounded mt-3"
                  disabled={loading}
                >
                  Place Order (COD)
                </button>
                */}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ================= RIGHT SECTION ================= */}
      <div className="bg-gray-50 p-6 rounded-lg shadow">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div key={index} className="flex items-start justify-between py-2 border-b">
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4 rounded"
                />
                <div>
                  <h3 className="text-md font-medium">{product.name}</h3>
                  <p className="text-gray-500">Weight: {product.weights}</p>
                  <p className="text-gray-500">Qty: {product.quantity}</p>
                </div>
              </div>
              <p className="text-lg font-semibold">₹{product.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>₹{cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>₹{cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
