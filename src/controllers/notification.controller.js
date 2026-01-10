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

  // [POST] /api/v1/notifications/:id/read
  markRead = async (req, res) => {
    await this.notifyService.markRead(req.params.id, req.user.userId);
    res.sendStatus(204);
  };

  // [POST] /api/v1/notifications/read-all
  markAllRead = async (req, res) => {
    await this.notifyService.markAllRead(req.user.userId);
    res.sendStatus(204);
  };

  // [DELETE] /api/v1/notifications/:id
  deleteOne = async (req, res) => {
    await this.notifyService.deleteOne(req.params.id, req.user.userId);
    res.sendStatus(204);
  };

  // [DELETE] /api/v1/notifications
  deleteAll = async (req, res) => {
    await this.notifyService.deleteAll(req.user.userId);
    res.sendStatus(204);
  };
  
};

module.exports = NotifyController;
