require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3006,
  mongoUrl: process.env.MONGO_URL,
  rabbitMQ_url: process.env.RABBITMQ_URL,
};
