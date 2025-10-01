import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { fetchOrderDetails } from "../redux/slices/orderSlice"; // Import the fetch order thunk

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { checkout } = useSelector((state) => state.checkout);
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  const [finalOrderId, setFinalOrderId] = useState(null);

  useEffect(() => {
    // If a checkout ID exists in the state, save it and clear the cart.
    if (checkout && checkout._id) {
      localStorage.setItem("finalOrderId", checkout._id);
      dispatch(clearCart());
      // The checkout state is transient and can be cleared after saving the ID
      // You may need to create a `clearCheckout` action for this.
    }

    // Now, fetch the order details using the ID from localStorage
    const savedOrderId = localStorage.getItem("finalOrderId");
    if (savedOrderId) {
      setFinalOrderId(savedOrderId);
      dispatch(fetchOrderDetails(savedOrderId));
    } else {
      // If no order ID is found, navigate away.
      navigate("/my-orders");
    }
  }, [dispatch, checkout, navigate]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 2);
    return orderDate.toLocaleDateString();
  };

  if (loading) {
    return <p className="text-center py-8">Loading order details...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Use orderDetails from the state, not the local checkout variable.
  const confirmedOrder = orderDetails;

  if (!confirmedOrder) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4">No Order Found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You for Your Order!
      </h1>

      <div className="p-6 rounded-lg border">
        <div className="flex justify-between mb-20">
          <div>
            <h2 className="text-xl font-semibold">Order ID: {confirmedOrder._id}</h2>
            <p className="text-gray-500">
              Order date: {new Date(confirmedOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-emerald-700 text-sm">
              Estimated Delivery:{" "}
              {calculateEstimatedDelivery(confirmedOrder.createdAt)}
            </p>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="mb-20">
          {confirmedOrder.orderItems?.map((item, index) => (
            <div key={index} className="flex items-center mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h4 className="text-md font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-500">
                  {item.weights} | {item.quantity}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-md">₹{item.price}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment</h4>
            <p className="text-gray-600">{confirmedOrder.paymentMethod}</p>
            <p className="text-gray-600">Status: {confirmedOrder.paymentStatus}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Delivery</h4>
            <p className="text-gray-600">{confirmedOrder.shippingAddress?.address}</p>
            <p className="text-gray-600">
              {confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;