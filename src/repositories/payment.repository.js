const Payment = require('../models/payment.model');
const PaymentRepositoryInterface = require('./paymentInterface.repository');
const STATUS = require("../constants/payment-status");

class PaymentRepository extends PaymentRepositoryInterface{
  async createPending({ subscriptionId, planId, paymentRef, amount}) {
    return Payment.create({
      subscriptionId,
      planId,
      paymentRef,
      amount,
      status: STATUS.PENDING
    });
  }

  async findByRef(paymentRef) {
    return Payment.findOne({ paymentRef });
  }

  updateStatus(paymentRef, status) {
    return Payment.findOneAndUpdate(
      { paymentRef },
      { status },
      { new: true }
    );
  };
}

module.exports = new PaymentRepository();