// Filename: RazorpayButton.jsx
import React, { useEffect } from "react";

const RazorpayButton = ({ amount, onSuccess, onError }) => {
  // ✅ Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ✅ Trigger payment window
  const loadRazorpay = () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY, // ⚙️ Your public Razorpay key
        amount: Math.round(amount * 100), // Amount in paise
        currency: "INR",
        name: "Creamy Cake & Co",
        description: "Order Payment",
        image: "https://yourstore.com/logo.png",

        // ✅ Razorpay success callback
        handler: function (response) {
          // Include Razorpay payment details
          const paymentDetails = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          if (onSuccess) {
            onSuccess(paymentDetails);
          }
        },

        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "7798270105",
        },
        notes: {
          purpose: "Cake Order Payment",
        },
        theme: {
          color: "#8b5cf6", // purple
        },
      };

      const rzp = new window.Razorpay(options);

      // ✅ Optional: handle payment failure
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        if (onError) {
          onError(response.error);
        } else {
          alert("Payment failed. Please try again.");
        }
      });

      rzp.open();
    } catch (err) {
      console.error("Error during Razorpay setup:", err);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <button
      onClick={loadRazorpay}
      className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
    >
      Pay ₹{amount}
    </button>
  );
};

export default RazorpayButton;
