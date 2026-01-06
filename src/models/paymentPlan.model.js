const mongoose = require("mongoose");

const paymentPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    interval: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "LIFETIME"],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentPlan", paymentPlanSchema);
