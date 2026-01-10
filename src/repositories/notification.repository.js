const Notification = require("../models/notification.model");

class NotificationRepository {
  create(data) {
    return Notification.create(data);
  }

  findByUser(userId, filters, options) {
    return Notification.find({
      $or: [
        { userId: userId },
        { userId: "all" }  
      ],
      ...filters              
    })
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit);
  }


  countUnread(userId) {
    return Notification.countDocuments({
      userId,
      isRead: false,
    });
  }

  markRead(id, userId) {
    return Notification.updateOne(
      { _id: id, userId },
      { isRead: true }
    );
  }

  markAllRead(userId) {
    return Notification.updateMany(
      { userId },
      { isRead: true }
    );
  }

  deleteOne(id, userId) {
    return Notification.deleteOne({ _id: id, userId });
  }

  deleteAll(userId) {
    return Notification.deleteMany({ userId });
  }
}

module.exports = new NotificationRepository();
