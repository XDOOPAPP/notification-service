const PaymentPlan = require("../models/paymentPlan.model");

class PaymentPlanRepository {

  findByPlanId(planId) {
    return PaymentPlan.findOne({ planId });
  }

  upsertFromEvent(payload) {
    const {
      planId,
      name,
      price,
      interval,
      isActive
    } = payload;

    return PaymentPlan.findOneAndUpdate(
      { planId },
      {
        name,
        price,
        interval,
        isActive
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new PaymentPlanRepository();
