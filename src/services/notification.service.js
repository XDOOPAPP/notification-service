const NotifyRepo = require("../repositories/notification.repository");
const AppError = require("../utils/appError");

class NotifyService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this._listenUserCreatedEvents();
    this._listenPaymentEvents();
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

  deleteAll(userId) {
    return NotifyRepo.deleteAll(userId);
  }


 // ================= PRIVATE METHODS =================

  _listenUserCreatedEvents() {
    if (!this.eventBus) return;

    // Event USER_CREATED
    this.eventBus.subscribe("USER_CREATED", async (payload) => {
      try {
        const { userId, fullName} = payload;

        if (!userId) return;

        const notificationPayload = {
          title: "Chào mừng!",
          message: `Chào mừng ${fullName || "người dùng"} đã đăng ký.`,
          type: "USER_CREATED",
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('notification.send', {
          target: 'USER',
          userId: userId,
          payload: notificationPayload
        });

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        const adminPayload = {
          title: "Người dùng mới",
          message: `${fullName || "Người dùng"} vừa đăng ký.`,
          type: "USER_CREATED",
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('notification.send', {
          target: 'ADMINS',
          userId: userId,
          payload: adminPayload
        });

        await NotifyRepo.create({
          userId: 'admins',
          ...adminPayload,
          isRead: false
        });

        console.log(`✅ USER_CREATED notification sent to user:${userId} and admins`);
      } catch (err) {
        console.error("❌ Error sending USER_CREATED notification:", err);
      }
    });
  }

  _listenPaymentEvents() {
    if (!this.eventBus) return;

    // Event PAYMENT_SUCCESS 
    this.eventBus.subscribe("PAYMENT_SUCCESS", async (payload) => {
      try {
        const { userId, paymentRef } = payload;
        if (!userId) return;

        const notificationPayload = {
          title: "Thanh toán thành công",
          message: `Thanh toán #${paymentRef} của bạn đã thành công.`,
          type: "PAYMENT_SUCCESS",
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('notification.send', {
          target: 'USER',
          userId,
          payload: notificationPayload
        });

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        console.log(`✅ PAYMENT_SUCCESS notification sent to user:${userId} and admins`);
      } catch (err) {
        console.error("❌ Error sending PAYMENT_SUCCESS notification:", err);
      }
    });

    // Event PAYMENT_FAILED
    this.eventBus.subscribe("PAYMENT_FAILED", async (payload) => {
      try {
        const { userId, paymentRef } = payload;
        if (!userId) return;

        const notificationPayload = {
          title: "Thanh toán thất bại",
          message: `Thanh toán #${paymentRef} của bạn đã thất bại.`,
          type: "PAYMENT_FAILED",
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('notification.send', {
          target: 'USER',
          userId,
          payload: notificationPayload
        });

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        const adminPayload = {
          title: "Thanh toán thất bại",
          message: `Người dùng #${userId} thanh toán thất bại (ref: ${paymentRef}).`,
          type: "PAYMENT_FAILED",
          timestamp: new Date().toISOString()
        };

        this.eventBus.publish('notification.send', {
          target: 'ADMINS',
          payload: adminPayload
        });

        await NotifyRepo.create({
          userId: 'admins',
          ...adminPayload,
          isRead: false
        });

        console.log(`✅ PAYMENT_FAILED notification sent to user:${userId} and admins`);
      } catch (err) {
        console.error("❌ Error sending PAYMENT_FAILED notification:", err);
      }
    });
  }

}

module.exports = NotifyService;
