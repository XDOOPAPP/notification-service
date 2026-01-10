const NotifyRepo = require("../repositories/notification.repository");
const AppError = require("../utils/appError");

class NotifyService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  getUserNotifications(userId, query) {
    const filters = {};
    if (query.unreadOnly === "true") filters.isRead = false;

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    return NotifyRepo.findByUser(userId, filters, {
      skip: (page - 1) * limit,
      limit,
    });
  }

  countUnread(userId) {
    return NotifyRepo.countUnread(userId);
  }

  markRead(id, userId) {
    return NotifyRepo.markRead(id, userId);
  }


  markAllRead(userId) {
    return NotifyRepo.markAllRead(userId);
  }

  deleteOne(id, userId) {
    return NotifyRepo.deleteOne(id, userId);
  }


 // ================= PRIVATE METHODS =================

}

module.exports = NotifyService;
