const admin = require("firebase-admin");
const serviceAccount = require("../../firebase-service-account.json");

class FirebaseConfig {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }

  messaging() {
    return admin.messaging();
  }
}

module.exports = new FirebaseConfig();