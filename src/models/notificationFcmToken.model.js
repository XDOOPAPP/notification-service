const mongoose = require("mongoose");

const notificationFcmTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    fcmToken: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("NotificationFcmToken", notificationFcmTokenSchema);