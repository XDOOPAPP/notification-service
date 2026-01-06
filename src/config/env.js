require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3101,
  mongoUrl: process.env.MONGO_URL,
  rabbitMQ_url: process.env.RABBITMQ_URL,
  
  vnp_TmnCode: process.env.VNP_TMN_CODE,
  vnp_HashSecret: process.env.VNP_HASH_SECRET,
  vnp_Url: process.env.VNP_URL,
  vnp_ReturnUrl: process.env.VNP_RETURN_URL
};
