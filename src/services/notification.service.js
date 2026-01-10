const NotifyRepo = require("../repositories/notification.repository");
const AppError = require("../utils/appError");

class NotifyService {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
 // ================= PRIVATE METHODS =================

}

module.exports = NotifyService;
