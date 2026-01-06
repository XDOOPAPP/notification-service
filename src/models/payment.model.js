const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true
    },
    planId: { 
      type: mongoose.Types.ObjectId, 
      required: true
    },
    paymentRef: { 
      type: String, 
      unique: true 
    },
    amount: Number,
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      required: true,
      default: "PENDING",
    },
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
