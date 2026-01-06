const paymentRepo = require("../repositories/payment.repository");
const planRepo = require("../repositories/paymentPlan.repository");
const AppError = require("../utils/appError");
const STATUS = require("../constants/payment-status")

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

  async handleIPN(query) {
    const verified = this.vnpay.verifyIPN(query);
    if (!verified.isSuccess) return;

    const paymentRef = verified.orderId;

    const payment = await paymentRepo.updateStatus(
      paymentRef,
      verified.isSuccess ? STATUS.SUCCESS : STATUS.FAILED
    );

    if (payment.status === STATUS.SUCCESS) {
      await this.eventBus.publish("PAYMENT_SUCCESS", {
        userId: payment.userId,
        paymentRef
      });
    }
  }

  async getPaymentStatus(paymentRef) {
    const payment = await paymentRepo.findByRef(paymentRef);
    if (!payment) throw new AppError("Payment not found", 404);
    return payment;
  }
}

module.exports = PaymentService;
