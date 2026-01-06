const PaymentService = require("../services/payment.service");
const mongoose = require("mongoose")

class PaymentController {

  constructor(eventBus, vnpayGateway) {
    this.paymentService = new PaymentService(eventBus, vnpayGateway);
  }

  // [POST] /api/v1/payments
  create = async (req, res) => {
    const result = await this.paymentService.createPayment({
      subscriptionId: req.subscriptionId,
      planId: req.planId,
      ipAddr: req.ip
    });
    res.json(result);
  };

  // [GET] /api/v1/payments/vnpay/ipn
  ipn = async (req, res) => {
    await this.paymentService.handleIPN(req.query);
    res.json({ message: "OK" });
  };

  // [GET] /api/v1/payments/:ref
  getStatus = async (req, res) => {
    const payment = await this.paymentService.getPaymentStatus(req.params.ref);
    res.json(payment);
  };

};

module.exports = PaymentController;
