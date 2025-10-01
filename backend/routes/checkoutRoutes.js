const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order"); 
const { protect } = require("../middleware/authMiddleware");

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
            paymentStatus: "pending", // ✅ FIX: Initial status is pending
            isPaid: false,
        });

        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Error creating checkout session", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid or pending
// @access private
router.put("/:id/pay", protect, async (req, res) => {
    const { paymentStatus, paymentDetails } = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (paymentStatus === "paid" || paymentStatus === "pending") {
            checkout.paymentStatus = paymentStatus;
            checkout.isPaid = (paymentStatus === "paid");
            checkout.paymentDetails = paymentDetails;
            
            if(paymentStatus === "paid") {
                checkout.paidAt = Date.now();
            } else {
                checkout.paidAt = undefined;
            }

            await checkout.save();

            res.status(200).json(checkout);
        } else {
            res.status(400).json({ message: "Invalid Payment Status" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        
        if ((checkout.isPaid || (checkout.paymentMethod === 'cod' && checkout.paymentStatus === 'pending')) && !checkout.isFinalized) {
            // Create final order based on checkout details
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

            // Mark the checkout as finalized
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            await Cart.findOneAndDelete({ user: checkout.user });

            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: "Checkout already finalized" });
        } else {
            res.status(400).json({ message: "Checkout is not paid or COD not handled" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;