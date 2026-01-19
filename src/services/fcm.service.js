const firebase = require("../config/firebase");

class FCMService {
  async sendToToken(token, payload) {
    if (!token) return;

    return firebase.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.message
      },
      data: {
        type: payload.type || "INFO"
      }
    });
  }

  async sendToMany(tokens, payload) {
    if (!tokens?.length) return;

    return firebase.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.message
      },
      data: {
        type: payload.type || "INFO"
      }
    });
  }
}

module.exports = new FCMService();