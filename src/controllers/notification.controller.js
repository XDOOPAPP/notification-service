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
};

module.exports = NotifyController;
