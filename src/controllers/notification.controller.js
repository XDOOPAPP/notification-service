const NotifyService = require("../services/notification.service");

class NotifyController {

  constructor(eventBus) {
    this.notifyService = new NotifyService(eventBus);
  }

  // [GET] /api/v1/notifications
  getAll = async (req, res) => {
    const data = await this.notifyService .getUserNotifications(req.user.userId, req.query);
    res.json(data);
  };

  // [GET] /api/v1/notifications/unread-count
  getUnreadCount = async (req, res) => {
    const count = await this.notifyService.countUnread(req.user.userId);
    res.json({ count });
  };
};

module.exports = NotifyController;
