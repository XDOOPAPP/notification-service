# 🔔 Notification Service

Microservice chịu trách nhiệm quản lý và gửi thông báo cho người dùng và admin. Service này lắng nghe các sự kiện từ hệ thống (RabbitMQ) và cung cấp API để quản lý thông báo.

## ✨ Tính Năng

- **Quản Lý Thông Báo**:
    - Lưu trữ lịch sử thông báo in-app.
    - Đánh dấu đã đọc/chưa đọc.
    - Xóa thông báo.
- **Event-Driven Notification**:
    - Tự động tạo thông báo khi có sự kiện từ các service khác.
    - **Events Lắng Nghe**:
        - `USER_CREATED`: Chào mừng người dùng mới (Gửi User & Admin).
        - `PAYMENT_SUCCESS`: Thông báo thanh toán thành công (Gửi User).
        - `PAYMENT_FAILED`: Thông báo lỗi thanh toán (Gửi User & Admin).
        - `SUBSCRIPTION_EXPIRED`: Cảnh báo hết hạn gói (Gửi User).
        - `BLOG_SUBMITTED`: Thông báo blog mới chờ duyệt (Gửi Admin).
        - `BLOG_APPROVED`: Thông báo blog đã được duyệt (Gửi User).
        - `BLOG_REJECTED`: Thông báo blog bị từ chối (Gửi User).
    - **Events Phát Đi**:
        - `notification.send`: Event internal để có thể tích hợp với Socket Gateway
- **Phân Quyền**:
    - Hỗ trợ target `ADMINS`, hoặc `ALL`.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Message Queue**: RabbitMQ (amqplib)
- **Authentication**: Internal Header Authentication (`x-user-id`) từ Gateway.

## 🚀 Cài Đặt & Chạy

### 1. Prerequisites

- Node.js (v18+)
- MongoDB
- RabbitMQ

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```env
PORT=3006
MONGO_URL=mongodb://localhost:27017/notification_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### 4. Chạy Service

- **Development**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints

Service chạy mặc định tại `http://localhost:3006`.

### Notification APIs

> **Lưu ý**: Các request **BẮT BUỘC** phải có header `x-user-id` (giả lập hoặc từ Gateway).

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Lấy danh sách thông báo của user hiện tại (có phân trang) |
| `GET` | `/api/v1/notifications/unread-count` | Lấy số lượng thông báo chưa đọc |
| `POST` | `/api/v1/notifications` | Tạo thông báo thủ công (Internal/Admin use) |
| `POST` | `/api/v1/notifications/:id/read` | Đánh dấu một thông báo là đã đọc |
| `POST` | `/api/v1/notifications/read-all` | Đánh dấu tất cả là đã đọc |
| `DELETE` | `/api/v1/notifications/:id` | Xóa một thông báo |
| `DELETE` | `/api/v1/notifications` | Xóa tất cả thông báo của user |

## 📝 API Usage Examples

Bạn có thể test trực tiếp bằng Postman hoặc Thunder Client.

> **Lưu ý quan trọng**: Khi test trực tiếp service này (`localhost:3006`), bạn **BẮT BUỘC** phải giả lập header `x-user-id` (giả lập việc request đã đi qua Gateway).

### 1. Manual Notification Flow (Admin/Internal)

Dùng để test việc tạo thông báo thủ công (thường dùng cho Admin gửi thông báo hệ thống hoặc test).

#### Step 1: Create a System Notification
```http
POST /api/v1/notifications
Content-Type: application/json
x-user-id: admin-id-123

{
  "title": "Bảo trì hệ thống",
  "message": "Hệ thống sẽ bảo trì vào 12:00 hôm nay.",
  "type": "SYSTEM",
  "target": "USER"
}
```

**Response:**
```json
{
  "_id": "65123abc...",
  "userId": "user-id-123",
  "type": "SYSTEM",
  "title": "Bảo trì hệ thống",
  "message": "Hệ thống sẽ bảo trì vào 12:00 hôm nay.",
  "isRead": false,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 2. User Notification Flow

#### Step 1: Get My Notifications
Lấy danh sách thông báo của user hiện tại (được xác định bởi `x-user-id`).

```http
GET /api/v1/notifications?page=1&limit=10
x-user-id: user-id-123
```

**Response:**
```json
[
  {
    "_id": "65123abc...",
    "userId": "user-id-123",
    "type": "SYSTEM",
    "title": "Bảo trì hệ thống",
    "message": "Hệ thống sẽ bảo trì vào 12:00 hôm nay.",
    "isRead": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

#### Step 2: Get Unread Count
Thường dùng để hiển thị badge số lượng thông báo trên UI.

```http
GET /api/v1/notifications/unread-count
x-user-id: user-id-123
```

**Response:**
```json
{
  "count": 1
}
```

#### Step 3: Mark One As Read
Đánh dấu một thông báo cụ thể là đã đọc.

```http
POST /api/v1/notifications/65123abc.../read
x-user-id: user-id-123
```

**Response:**
`204 No Content`

#### Step 4: Mark All As Read
Đánh dấu tất cả thông báo của user là đã đọc.

```http
POST /api/v1/notifications/read-all
x-user-id: user-id-123
```

**Response:**
`204 No Content`

### 3. Delete Flow

#### Delete One Notification
```http
DELETE /api/v1/notifications/65123abc...
x-user-id: user-id-123
```

**Response:**
`204 No Content`

#### Delete All Notifications
```http
DELETE /api/v1/notifications
x-user-id: user-id-123
```

**Response:**
`204 No Content`

### 4. Event Integration Examples (RabbitMQ)

Service tự động lắng nghe và tạo thông báo khi các event sau được bắn lên Exchange `domain_events`:

#### Event: USER_CREATED
```json
// Exchange: domain_events
// Routing Key: USER_CREATED
{
  "userId": "user_123",
  "fullName": "Nguyen Van A"
}
// -> Tạo noti chào mừng cho user_123 và admin
```

#### Event: PAYMENT_SUCCESS
```json
// Exchange: domain_events
// Routing Key: PAYMENT_SUCCESS
{
  "userId": "user_123",
  "paymentRef": "PAY_123456"
}
// -> Tạo noti thành công cho user_123
```

#### Event: PAYMENT_FAILED
```json
// Exchange: domain_events
// Routing Key: PAYMENT_FAILED
{
  "userId": "user_123",
  "paymentRef": "PAY_FAILED_01"
}
// -> Tạo noti báo lỗi thanh toán cho user_123 và admin
```

#### Event: BLOG_SUBMITTED
```json
// Exchange: domain_events
// Routing Key: BLOG_SUBMITTED
{
  "blogId": "blog_001",
  "userId": "author_123",
  "title": "Hướng dẫn học NestJS"
}
// -> Tạo noti cho admin: "Blog mới cần duyệt"
```

#### Event: BLOG_APPROVED
```json
// Exchange: domain_events
// Routing Key: BLOG_APPROVED
{
  "blogId": "blog_001",
  "userId": "author_123",
  "title": "Hướng dẫn học NestJS"
}
// -> Tạo noti cho author_123: "Blog của bạn đã được duyệt"
```

#### Event: BLOG_REJECTED
```json
// Exchange: domain_events
// Routing Key: BLOG_REJECTED
{
  "blogId": "blog_001",
  "userId": "author_123",
  "title": "Hướng dẫn học NestJS",
  "rejectionReason": "Nội dung chưa đạt yêu cầu"
}
// -> Tạo noti cho author_123: "Blog của bạn bị từ chối"
```

## 🏗️ Cấu Trúc Project

```
src/
├── config/         # Cấu hình DB, Env
├── controllers/    # Xử lý request HTTP
├── infra/          # Event Bus (RabbitMQ)
├── middlewares/    # Auth, Error Handler
├── models/         # Mongoose Schemas (Notification)
├── repositories/   # Data Access Layer
├── routes/         # Định nghĩa API routes
├── services/       # Business Logic (Listen Events & Handle Logic)
└── utils/          # Helper functions
```

## ⚠️ Lưu ý
Service này hiện tại tập trung vào việc **lưu trữ và phục vụ API** lấy thông báo. Việc push realtime (WebSocket) được xử lý thông qua event `notification.send` mà service này bắn ra (cần Socket Service lắng nghe).
