class PaymentRepositoryInterface {
  create(payment) {}
  findByRef(paymentRef) {}
  markSuccess(paymentRef){}
  markFailed(paymentRef){}
}

module.exports = PaymentRepositoryInterface;