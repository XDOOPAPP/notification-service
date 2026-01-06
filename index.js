const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");
const EventBus = require("./src/infra/event-bus/event-bus");
const paymentRoutes = require("./src/routes/payment.route");
const errorHandler = require("./src/middlewares/errorHandler.middleware");
const VNPayGateway = require("./src/infra/vnpay/vnpay");

(async () => {
  // 1. connect
  await connectDB();

  const bus = new EventBus(env.rabbitMQ_url);
  await bus.connect();

  const vnpayGateway = new VNPayGateway({
    vnp_TmnCode: env.vnp_TmnCode,
    vnp_HashSecret: env.vnp_HashSecret,
    vnp_Url: env.vnp_Url,
    vnp_ReturnUrl: env.vnp_ReturnUrl
  });

  // 2. inject
  app.set("eventBus", bus);
  app.set("vnpayGateway", vnpayGateway);

  // 3. user route
  app.use("/api/v1/payments", paymentRoutes(app));

  // 4. error handler
  app.use(errorHandler);

  // 5. start server
  app.listen(env.port, () => {
    console.log(`Payment Service running on port ${env.port}`);
  });
})();
