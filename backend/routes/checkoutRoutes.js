const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// 🟢 CREATE CHECKOUT
// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  const user = req.user._id;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  try {
    const newCheckout = await Checkout.create({
      user,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isPaid: false,
    });

    console.log(`✅ Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("❌ Error creating checkout:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🟡 PAY CHECKOUT
// @route PUT /api/checkout/:id/pay
// @desc Update checkout payment status (COD or Online)
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails, paymentMethod } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (paymentMethod) checkout.paymentMethod = paymentMethod;

    if (["paid", "pending"].includes(paymentStatus)) {
      checkout.paymentStatus = paymentStatus;
      checkout.isPaid = paymentStatus === "paid";
      checkout.paymentDetails = paymentDetails || {};
      checkout.paidAt = paymentStatus === "paid" ? Date.now() : undefined;

      await checkout.save();
      return res.status(200).json(checkout);
    }

    return res.status(400).json({ message: "Invalid Payment Status" });
  } catch (error) {
    console.error("❌ Error in payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🟣 FINALIZE CHECKOUT
// @route POST /api/checkout/:id/finalize
// @desc Convert checkout into order
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    // ✅ Allow finalization if paid online or COD (pending)
    const canFinalize =
      (checkout.paymentMethod === "cod" && checkout.paymentStatus === "pending") ||
      checkout.isPaid;

    if (checkout.isFinalized)
      return res.status(400).json({ message: "Checkout already finalized" });

    if (!canFinalize)
      return res.status(400).json({ message: "Payment not completed or invalid for COD" });

    const finalOrder = await Order.create({
      user: checkout.user,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: checkout.isPaid,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: checkout.paymentStatus,
      paymentDetails: checkout.paymentDetails,
    });

    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    await Cart.findOneAndDelete({ user: checkout.user }); // clear user's cart

    res.status(201).json(finalOrder);
  } catch (error) {
    console.error("❌ Error finalizing checkout:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
