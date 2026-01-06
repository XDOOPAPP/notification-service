const { VNPay, ProductCode } = require("vnpay");

class VNPayGateway {
  constructor({ vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl }) {
    this.vnpay = new VNPay({
      tmnCode: vnp_TmnCode,
      secureSecret: vnp_HashSecret,
      vnpayHost: vnp_Url,
      hashAlgorithm: "SHA512",
      testMode: true,
    });

    this.vnp_ReturnUrl = vnp_ReturnUrl;
  }

  async createPaymentUrl({ amount, paymentRef, orderInfo, ipAddr }) {
    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const paymentUrl = await this.vnpay.buildPaymentUrl({
      vnp_Amount: Number(amount),
      vnp_TxnRef: paymentRef,
      vnp_OrderInfo: orderInfo,
      vnp_IpAddr: ipAddr || "127.0.0.1",
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_Locale: "vn",
      vnp_OrderType: ProductCode.Other,
    });

    return paymentUrl;
  }

  verify(query) {
    return this.vnpay.verifyReturnUrl(query);
  }
}

module.exports = VNPayGateway;
