const NotifyService = require("../services/notification.service");

class NotifyController {

  constructor(eventBus) {
    this.NotifyService = new NotifyService(eventBus);
  }
};

module.exports = NotifyController;
