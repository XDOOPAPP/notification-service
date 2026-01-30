const NotifyRepo = require("../repositories/notification.repository");
const AppError = require("../utils/appError");
const FCMService = require("./fcm.service");

class NotifyService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this._listenUserCreatedEvents();
    this._listenPaymentEvents();
    this._listenSubscriptionExpired();
    this._listenUserFcmToken();
    this._listenBlogEvents();
  }

  async createNotification(data) {
    const { title, message, type, target } = data;

    const allowedTargets = ["ADMINS", "ALL"];
    if (!title || !message || !target) {
      throw new AppError("title, message, target are required", 400);
    }
    if (!allowedTargets.includes(target)) {
      throw new AppError("Invalid target", 400);
    }

    const dbUserId = target === "ADMINS" ? "admins" : "all";
    const notificationPayload = {
      userId: dbUserId,
      title,
      message,
      type: type || "INFO",
      isRead: false,
      timestamp: new Date().toISOString(),
    };

    const notification = await NotifyRepo.create(notificationPayload);

    if (target === "ALL") {
      const tokens = await NotifyRepo.getAllFCMTokens();
      await FCMService.sendToMany(tokens, notification);
    }

    if (target === "ADMINS") {
      const tokens = await NotifyRepo.getAdminFCMTokens();
      await FCMService.sendToMany(tokens, notification);
    }

    return notification;
  }

  getUserNotifications(userId, query, role) {
    const filters = {};
    if (query.unreadOnly === "true") filters.isRead = false;

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    if (role === "ADMIN") {
      return NotifyRepo.findByAdmin(filters, {
        skip: (page - 1) * limit,
        limit,
      });
    }
    return NotifyRepo.findByUser(userId, filters, {
      skip: (page - 1) * limit,
      limit,
    });
  }

  countUnread(userId, role) {
    return NotifyRepo.countUnread(userId, role === "ADMIN" ? true : false);
  }

  markRead(id, userId, role) {
    return NotifyRepo.markRead(id, userId, role === "ADMIN" ? true : false);
  }


  markAllRead(userId, role) {
    return NotifyRepo.markAllRead(userId, role === "ADMIN" ? true : false);
  }

  deleteOne(id, userId, role) {
    return NotifyRepo.deleteOne(id, userId, role === "ADMIN" ? true : false);
  }

  deleteAll(userId, role) {
    return NotifyRepo.deleteAll(userId, role === "ADMIN" ? true : false);
  }


  // ================= METHODS =================

  _listenUserCreatedEvents() {
    if (!this.eventBus) return;

    // Event USER_CREATED
    this.eventBus.subscribe("USER_CREATED", async (payload) => {
      try {
        const { userId, fullName } = payload;

        if (!userId) return;

        const notificationPayload = {
          title: `Chào mừng ${fullName || "bạn"} đến với hệ thống!`,
          message: `Bạn vừa đăng ký tài khoản thành công. Hãy bắt đầu trải nghiệm dịch vụ.`,
          type: "USER_CREATED",
          timestamp: new Date().toISOString()
        };

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

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

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

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

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

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

  _listenSubscriptionExpired() {
    if (!this.eventBus) return;
    // Event SUBSCRIPTION_EXPIRED
    this.eventBus.subscribe("SUBSCRIPTION_EXPIRED", async (payload) => {
      try {
        const { userId, planName, endDate } = payload;

        const notificationPayload = {
          title: "Gói đăng ký hết hạn",
          message: `Gói ${planName} của bạn đã hết hạn vào ${endDate}`,
          type: "SUBSCRIPTION_EXPIRED",
          timestamp: new Date().toISOString()
        };

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

        console.log(`✅ SUBSCRIPTION_EXPIRED notification sent to user:${userId}`);
      } catch (err) {
        console.error("❌ Error sending SUBSCRIPTION_EXPIRED notification:", err);
      }
    });
  }

  _l

  _listenUserFcmToken() {
    if (!this.eventBus) return;

    this.eventBus.subscribe("FCM_TOKEN_UPDATED", async ({ userId, token, role }) => {
      await NotifyRepo.saveFcmToken(userId, token, role);
    });
  }

  _listenBlogEvents() {
    if (!this.eventBus) return;

    // BLOG_SUBMITTED -> Notify Admins
    this.eventBus.subscribe("BLOG_SUBMITTED", async (payload) => {
      try {
        const { blogId, userId, title } = payload;
        const notificationPayload = {
          title: "Blog mới cần duyệt",
          message: `Blog "${title}" vừa được gửi và đang chờ duyệt.`,
          type: "BLOG_SUBMITTED",
          timestamp: new Date().toISOString(),
          metadata: { blogId, authorId: userId }
        };

        this.eventBus.publish('notification.send', {
          target: 'ADMINS',
          payload: notificationPayload
        });

        await NotifyRepo.create({
          userId: 'admins',
          ...notificationPayload,
          isRead: false
        });

        console.log(`✅ BLOG_SUBMITTED notification sent to admins for blog:${blogId}`);
      } catch (err) {
        console.error("❌ Error sending BLOG_SUBMITTED notification:", err);
      }
    });

    // BLOG_APPROVED -> Notify Author
    this.eventBus.subscribe("BLOG_APPROVED", async (payload) => {
      try {
        const { blogId, userId, title } = payload;
        const notificationPayload = {
          title: "Blog của bạn đã được duyệt",
          message: `Blog "${title}" của bạn đã được phê duyệt và công khai.`,
          type: "BLOG_APPROVED",
          timestamp: new Date().toISOString(),
          metadata: { blogId }
        };

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        console.log(`✅ BLOG_APPROVED notification sent to user:${userId} for blog:${blogId}`);
      } catch (err) {
        console.error("❌ Error sending BLOG_APPROVED notification:", err);
      }
    });

    // BLOG_REJECTED -> Notify Author
    this.eventBus.subscribe("BLOG_REJECTED", async (payload) => {
      try {
        const { blogId, userId, title, rejectionReason } = payload;
        const notificationPayload = {
          title: "Blog của bạn bị từ chối",
          message: `Blog "${title}" của bạn đã bị từ chối. Lý do: ${rejectionReason}`,
          type: "BLOG_REJECTED",
          timestamp: new Date().toISOString(),
          metadata: { blogId, rejectionReason }
        };

        const userToken = await NotifyRepo.getUserFCMToken(userId);
        if (userToken && userToken.fcmToken) {
          await FCMService.sendToToken(userToken.fcmToken, notificationPayload);
        }

        await NotifyRepo.create({
          userId,
          ...notificationPayload,
          isRead: false
        });

        console.log(`✅ BLOG_REJECTED notification sent to user:${userId} for blog:${blogId}`);
      } catch (err) {
        console.error("❌ Error sending BLOG_REJECTED notification:", err);
      }
    });
  }

}

module.exports = NotifyService;
