const Notification = require("../models/notification.model");
const NotificationFcmToken = require("../models/notificationFcmToken.model");

class NotificationRepository {
  saveFcmToken(userId, fcmToken, role) {
    return NotificationFcmToken.findOneAndUpdate(
      { userId },
      { fcmToken, role },
      { upsert: true, new: true }
    );
  }

  getAllFCMTokens() {
    return NotificationFcmToken.find({}).select("fcmToken").lean();
  }

  getAdminFCMTokens() {
    return NotificationFcmToken.find({ role: "ADMIN" }).select("fcmToken").lean();
  }

  getUserFCMToken(userId) {
    return NotificationFcmToken.findOne({ userId }).select("fcmToken").lean();
  }


  create(data) {
    return Notification.create(data);
  }

  findByUser(userId, filters = {}, options = {}) {
    return Notification.find({
      $or: [
        { userId: userId },
        { userId: "all" }
      ],
      ...filters
    })
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 10);
  }

  findByAdmin(filters = {}, options = {}) {
    return Notification.find({
      $or: [
        { userId: "admins" },
        { userId: "all" }
      ],
      ...filters
    })
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 10);
  }

  countUnread(userId, isAdmin = false) {
    const query = {
      isRead: false,
    };

    if (isAdmin) {
      query.userId = { $in: ["admins", "all"] };
    } else {
      query.userId = { $in: [userId, "all"] };
    }

    return Notification.countDocuments(query);
  }

  markRead(id, userId, isAdmin = false) {
    const query = { _id: id };
    if (isAdmin) {
      query.userId = { $in: ["admins", "all"] };
    } else {
      query.userId = { $in: [userId, "all"] };
    }

    return Notification.updateOne(query, { isRead: true });
  }

  markAllRead(userId, isAdmin = false) {
    const query = {};
    if (isAdmin) {
      query.userId = { $in: ["admins", "all"] };
    } else {
      query.userId = { $in: [userId, "all"] };
    }

    return Notification.updateMany(query, { isRead: true });
  }

  deleteOne(id, userId, isAdmin = false) {
    const query = { _id: id };
    if (isAdmin) {
      query.userId = { $in: ["admins", "all"] };
    } else {
      query.userId = { $in: [userId, "all"] };
    }

    return Notification.deleteOne(query);
  }

  deleteAll(userId, isAdmin = false) {
    const query = {};
    if (isAdmin) {
      query.userId = { $in: ["admins", "all"] };
    } else {
      query.userId = { $in: [userId, "all"] };
    }

    return Notification.deleteMany(query);
  }
}

module.exports = new NotificationRepository();
