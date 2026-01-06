const paymentRepo = require("../repositories/payment.repository");
const planRepo = require("../repositories/paymentPlan.repository");
const AppError = require("../utils/appError");

class PaymentService {
  constructor(eventBus, vnpayGateway) {
    this.eventBus = eventBus;
    this.vnpay = vnpayGateway;
  }


  async createPayment({subscriptionId, planId, ipAddr }) {
    const plan = await planRepo.findByPlanId(planId);
    if (!plan) throw new AppError("Plan not available for payment", 400);

    const paymentRef = `PAY_${Date.now()}`;

    await paymentRepo.createPending({
      subscriptionId,
      planId,
      amount: plan.price,
      paymentRef
    });

    const paymentUrl = await this.vnpay.createPaymentUrl({
      amount: plan.price,
      paymentRef,
      orderInfo: `Subscription ${plan.name}`,
      ipAddr
    });

    return { paymentRef, paymentUrl };
  }
}

module.exports = PaymentService;
