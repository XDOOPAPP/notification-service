const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");
const EventBus = require("./src/infra/event-bus/event-bus");
const notifyRoutes = require("./src/routes/notification.route");
const errorHandler = require("./src/middlewares/errorHandler.middleware");

(async () => {
  // 1. connect
  await connectDB();

  const bus = new EventBus(env.rabbitMQ_url);
  await bus.connect();

  // 2. inject
  app.set("eventBus", bus);

  // 3. user route
  app.use("/api/v1/notifications", notifyRoutes(app));

  // 4. error handler
  app.use(errorHandler);

  // 5. start server
  app.listen(env.port, () => {
    console.log(`Notification Service running on port ${env.port}`);
  });
})();
