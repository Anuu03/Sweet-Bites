const mongoose = require("mongoose");

// ✅ Define individual checkout item schema
const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    weights: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// ✅ Define main checkout schema
const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkoutItems: [checkoutItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pinCode: { type: String, required: true },
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "razorpay", "stripe", "paypal"], // ✅ safer
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed, // can store Razorpay or COD info
      default: {},
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkout", checkoutSchema);
