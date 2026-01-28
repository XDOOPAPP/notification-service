# 📚 API Documentation - Notification Service

## 📋 Tổng Quan

Notification Service cung cấp các RESTful API endpoints để quản lý thông báo cho người dùng và admin. Service sử dụng JWT token authentication thông qua API Gateway.

**Base URL:** `/api/v1/notifications`

**Authentication:** Tất cả các endpoint (trừ `/health`) yêu cầu authentication thông qua:
- Header `Authorization: Bearer {token}`
- Header `x-user-id: {userId}` (được inject từ API Gateway)

---

## 🔐 Authentication

Service sử dụng authentication middleware để xác thực request từ API Gateway.

**Required Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
x-user-id: {USER_ID}
```

**User Object được inject vào `req.user`:**
```javascript
{
  userId: string,    // User ID từ Gateway
  role: string,      // ADMIN hoặc USER
  email: string      // Email của user (optional)
}
```

---

## 📌 Endpoints

### 1. Tạo Thông Báo Mới (Manual)

Tạo thông báo thủ công (thường dùng cho admin broadcast).

**Endpoint:**
```http
POST /api/v1/notifications
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Thông báo hệ thống",
  "message": "Hệ thống sẽ bảo trì vào 22h hôm nay",
  "type": "SYSTEM_MAINTENANCE",
  "target": "ALL"
}
```

**Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Tiêu đề thông báo |
| `message` | string | ✅ | Nội dung thông báo |
| `type` | string | ❌ | Loại thông báo (default: "INFO") |
| `target` | string | ✅ | Target nhận thông báo: `"ADMINS"` hoặc `"ALL"` |

**Response - 201 Created:**
```json
{
  "_id": "65abc123def456789",
  "userId": "admins",
  "title": "Thông báo hệ thống",
  "message": "Hệ thống sẽ bảo trì vào 22h hôm nay",
  "type": "SYSTEM_MAINTENANCE",
  "metadata": {},
  "isRead": false,
  "createdAt": "2026-01-22T10:30:00.000Z",
  "updatedAt": "2026-01-22T10:30:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Missing required fields
{
  "message": "title, message, target are required",
  "statusCode": 400
}

// 400 Bad Request - Invalid target
{
  "message": "Invalid target",
  "statusCode": 400
}

// 401 Unauthorized
{
  "message": "Unauthorized - Request must come from API Gateway",
  "statusCode": 401
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3003/api/v1/notifications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-user-id: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Thông báo hệ thống",
    "message": "Hệ thống sẽ bảo trì vào 22h hôm nay",
    "type": "SYSTEM_MAINTENANCE",
    "target": "ALL"
  }'
```

---

### 2. Lấy Danh Sách Thông Báo

Lấy danh sách thông báo của user hoặc admin với phân trang và filter.

**Endpoint:**
```http
GET /api/v1/notifications
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | Số trang hiện tại |
| `limit` | number | ❌ | 10 | Số lượng item mỗi trang |
| `unreadOnly` | string | ❌ | - | Filter chỉ lấy thông báo chưa đọc. Value: `"true"` |

**Response - 200 OK:**
```json
[
  {
    "_id": "65abc123def456789",
    "userId": "user123",
    "type": "BLOG_APPROVED",
    "title": "Blog của bạn đã được duyệt",
    "message": "Blog 'Hướng dẫn React' của bạn đã được phê duyệt và công khai.",
    "metadata": {
      "blogId": "blog789"
    },
    "isRead": false,
    "createdAt": "2026-01-22T14:30:00.000Z",
    "updatedAt": "2026-01-22T14:30:00.000Z"
  },
  {
    "_id": "65abc123def456790",
    "userId": "all",
    "type": "SYSTEM_MAINTENANCE",
    "title": "Thông báo bảo trì",
    "message": "Hệ thống sẽ bảo trì vào 22h hôm nay",
    "metadata": {},
    "isRead": true,
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T15:00:00.000Z"
  }
]
```

**Behavior:**
- **User thường:** Nhận thông báo có `userId` = {userId của họ} hoặc `userId` = "all"
- **Admin:** Nhận thông báo có `userId` = "admins" hoặc `userId` = "all"

**Example cURL:**
```bash
# Lấy trang 1, mỗi trang 20 items
curl -X GET "http://localhost:3003/api/v1/notifications?page=1&limit=20" \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"

# Lấy chỉ thông báo chưa đọc
curl -X GET "http://localhost:3003/api/v1/notifications?unreadOnly=true" \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

---

### 3. Đếm Số Lượng Thông Báo Chưa Đọc

Lấy số lượng thông báo chưa đọc của user/admin.

**Endpoint:**
```http
GET /api/v1/notifications/unread-count
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**Response - 200 OK:**
```json
{
  "count": 5
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3003/api/v1/notifications/unread-count \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

**Use Case:**
- Hiển thị badge số lượng chưa đọc trên UI
- Polling định kỳ để cập nhật badge (mỗi 30s)
- Cập nhật real-time qua WebSocket

---

### 4. Đánh Dấu Một Thông Báo Đã Đọc

Đánh dấu một thông báo cụ thể là đã đọc.

**Endpoint:**
```http
POST /api/v1/notifications/:id/read
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | ID của thông báo cần đánh dấu đã đọc |

**Response - 204 No Content**

(Không có body, chỉ status code 204)

**Example cURL:**
```bash
curl -X POST http://localhost:3003/api/v1/notifications/65abc123def456789/read \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

**Security:**
- User chỉ có thể đánh dấu thông báo của chính họ hoặc thông báo public ("all")
- Admin chỉ có thể đánh dấu thông báo của admin hoặc thông báo public

---

### 5. Đánh Dấu Tất Cả Thông Báo Đã Đọc

Đánh dấu tất cả thông báo của user/admin là đã đọc.

**Endpoint:**
```http
POST /api/v1/notifications/read-all
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**Response - 204 No Content**

**Example cURL:**
```bash
curl -X POST http://localhost:3003/api/v1/notifications/read-all \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

**Use Case:**
- Button "Đánh dấu tất cả đã đọc" trong notification UI
- Clear all unread notifications

---

### 6. Xóa Một Thông Báo

Xóa một thông báo cụ thể.

**Endpoint:**
```http
DELETE /api/v1/notifications/:id
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | ID của thông báo cần xóa |

**Response - 204 No Content**

**Example cURL:**
```bash
curl -X DELETE http://localhost:3003/api/v1/notifications/65abc123def456789 \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

**Security:**
- User chỉ có thể xóa thông báo của chính họ hoặc thông báo public
- Admin chỉ có thể xóa thông báo của admin hoặc thông báo public

---

### 7. Xóa Tất Cả Thông Báo

Xóa tất cả thông báo của user/admin.

**Endpoint:**
```http
DELETE /api/v1/notifications
```

**Headers:**
```http
Authorization: Bearer {token}
x-user-id: {userId}
```

**Response - 204 No Content**

**Example cURL:**
```bash
curl -X DELETE http://localhost:3003/api/v1/notifications \
  -H "Authorization: Bearer {token}" \
  -H "x-user-id: user123"
```

**Use Case:**
- Button "Xóa tất cả thông báo" trong settings
- Clear notification history

---

### 8. Health Check

Kiểm tra trạng thái service (không cần authentication).

**Endpoint:**
```http
GET /api/v1/notifications/health
```

**Response - 200 OK:**
```json
{
  "status": "ok",
  "service": "notification-service"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3003/api/v1/notifications/health
```

**Use Case:**
- Load balancer health check
- Monitoring systems
- Docker health check

---

## 🔔 Notification Types

Các loại thông báo được tự động tạo từ events:

| Type | Description | Target | Trigger Event |
|------|-------------|--------|---------------|
| `USER_CREATED` | Người dùng mới đăng ký | User + Admin | Event: `USER_CREATED` |
| `PAYMENT_SUCCESS` | Thanh toán thành công | User | Event: `PAYMENT_SUCCESS` |
| `PAYMENT_FAILED` | Thanh toán thất bại | User + Admin | Event: `PAYMENT_FAILED` |
| `SUBSCRIPTION_EXPIRED` | Gói đăng ký hết hạn | User | Event: `SUBSCRIPTION_EXPIRED` |
| `BLOG_SUBMITTED` | Blog mới chờ duyệt | Admin | Event: `BLOG_SUBMITTED` |
| `BLOG_APPROVED` | Blog đã được duyệt | User (Author) | Event: `BLOG_APPROVED` |
| `BLOG_REJECTED` | Blog bị từ chối | User (Author) | Event: `BLOG_REJECTED` |
| `SYSTEM_MAINTENANCE` | Thông báo bảo trì | Manual (Admin) | Manual API call |
| `INFO` | Thông báo thông tin | Manual | Manual API call |

---

## 📊 Event-Driven Architecture

Service lắng nghe các events từ RabbitMQ và tự động tạo thông báo.

### Event Subscriptions

#### 1. USER_CREATED
```javascript
// Event Payload
{
  "userId": "user123",
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com"
}

// Notifications Created:
// 1. User notification
{
  "userId": "user123",
  "title": "Chào mừng Nguyễn Văn A đến với hệ thống!",
  "message": "Bạn vừa đăng ký tài khoản thành công. Hãy bắt đầu trải nghiệm dịch vụ.",
  "type": "USER_CREATED"
}

// 2. Admin notification
{
  "userId": "admins",
  "title": "Người dùng mới",
  "message": "Nguyễn Văn A vừa đăng ký.",
  "type": "USER_CREATED"
}
```

#### 2. PAYMENT_SUCCESS
```javascript
// Event Payload
{
  "userId": "user123",
  "paymentRef": "PAY-12345"
}

// Notification Created:
{
  "userId": "user123",
  "title": "Thanh toán thành công",
  "message": "Thanh toán #PAY-12345 của bạn đã thành công.",
  "type": "PAYMENT_SUCCESS"
}
```

#### 3. PAYMENT_FAILED
```javascript
// Event Payload
{
  "userId": "user123",
  "paymentRef": "PAY-12346"
}

// Notifications Created:
// 1. User notification
{
  "userId": "user123",
  "title": "Thanh toán thất bại",
  "message": "Thanh toán #PAY-12346 của bạn đã thất bại.",
  "type": "PAYMENT_FAILED"
}

// 2. Admin notification
{
  "userId": "admins",
  "title": "Thanh toán thất bại",
  "message": "Người dùng #user123 thanh toán thất bại (ref: PAY-12346).",
  "type": "PAYMENT_FAILED"
}
```

#### 4. SUBSCRIPTION_EXPIRED
```javascript
// Event Payload
{
  "userId": "user123",
  "planName": "Premium",
  "endDate": "2026-01-22"
}

// Notification Created:
{
  "userId": "user123",
  "title": "Gói đăng ký hết hạn",
  "message": "Gói Premium của bạn đã hết hạn vào 2026-01-22",
  "type": "SUBSCRIPTION_EXPIRED"
}
```

#### 5. BLOG_SUBMITTED
```javascript
// Event Payload
{
  "blogId": "blog123",
  "userId": "user123",
  "title": "Hướng dẫn React"
}

// Notification Created:
{
  "userId": "admins",
  "title": "Blog mới cần duyệt",
  "message": "Blog 'Hướng dẫn React' vừa được gửi và đang chờ duyệt.",
  "type": "BLOG_SUBMITTED",
  "metadata": {
    "blogId": "blog123",
    "authorId": "user123"
  }
}
```

#### 6. BLOG_APPROVED
```javascript
// Event Payload
{
  "blogId": "blog123",
  "userId": "user123",
  "title": "Hướng dẫn React"
}

// Notification Created:
{
  "userId": "user123",
  "title": "Blog của bạn đã được duyệt",
  "message": "Blog 'Hướng dẫn React' của bạn đã được phê duyệt và công khai.",
  "type": "BLOG_APPROVED",
  "metadata": {
    "blogId": "blog123"
  }
}
```

#### 7. BLOG_REJECTED
```javascript
// Event Payload
{
  "blogId": "blog123",
  "userId": "user123",
  "title": "Hướng dẫn React",
  "rejectionReason": "Nội dung không phù hợp"
}

// Notification Created:
{
  "userId": "user123",
  "title": "Blog của bạn bị từ chối",
  "message": "Blog 'Hướng dẫn React' của bạn đã bị từ chối. Lý do: Nội dung không phù hợp",
  "type": "BLOG_REJECTED",
  "metadata": {
    "blogId": "blog123",
    "rejectionReason": "Nội dung không phù hợp"
  }
}
```

#### 8. FCM_TOKEN_UPDATED
```javascript
// Event Payload
{
  "userId": "user123",
  "token": "fcm_token_string",
  "role": "USER"
}

// Action: Save FCM token vào database để gửi push notification
```

---

## 🔄 Real-time Updates

Service publish events về Socket Gateway để hỗ trợ real-time notifications.

### Published Events

#### notification.send

Mỗi khi có thông báo mới được tạo, service sẽ publish event này:

```javascript
{
  "target": "USER" | "ADMINS",
  "userId": "user123",        // Optional: chỉ có khi target = USER
  "payload": {
    "title": "Tiêu đề",
    "message": "Nội dung",
    "type": "NOTIFICATION_TYPE",
    "timestamp": "2026-01-22T10:30:00.000Z"
  }
}
```

**Workflow:**
```
Service khác → RabbitMQ Event → Notification Service
                                      ↓
                               Create Notification
                                      ↓
                          Publish notification.send
                                      ↓
                              Socket Gateway
                                      ↓
                            WebSocket → Client
```

---

## 🎯 Use Cases & Examples

### Use Case 1: Hiển Thị Badge Số Lượng Chưa Đọc

**Frontend Implementation:**

```javascript
// Polling approach (simple)
const fetchUnreadCount = async () => {
  const response = await fetch('/api/v1/notifications/unread-count', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-user-id': userId
    }
  });
  const { count } = await response.json();
  updateBadge(count);
};

// Poll every 30 seconds
setInterval(fetchUnreadCount, 30000);
```

### Use Case 2: Hiển Thị Danh Sách Thông Báo với Pagination

**Frontend Implementation:**

```javascript
const fetchNotifications = async (page = 1, limit = 20) => {
  const response = await fetch(
    `/api/v1/notifications?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      }
    }
  );
  const notifications = await response.json();
  renderNotifications(notifications);
};
```

### Use Case 3: Đánh Dấu Đã Đọc Khi Click

**Frontend Implementation:**

```javascript
const handleNotificationClick = async (notificationId) => {
  // Mark as read
  await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-user-id': userId
    }
  });
  
  // Navigate to detail page (if has metadata)
  if (notification.metadata?.blogId) {
    window.location.href = `/blogs/${notification.metadata.blogId}`;
  }
  
  // Update UI
  updateNotificationAsRead(notificationId);
};
```

### Use Case 4: Admin Gửi Thông Báo Broadcast

**Admin Panel Implementation:**

```javascript
const sendBroadcastNotification = async () => {
  const response = await fetch('/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'x-user-id': 'admin123',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Thông báo bảo trì hệ thống',
      message: 'Hệ thống sẽ bảo trì từ 22h-24h hôm nay',
      type: 'SYSTEM_MAINTENANCE',
      target: 'ALL'  // Send to all users
    })
  });
  
  if (response.ok) {
    alert('Đã gửi thông báo đến tất cả người dùng');
  }
};
```

### Use Case 5: Real-time với WebSocket

**Frontend Implementation:**

```javascript
import io from 'socket.io-client';

const socket = io(process.env.SOCKET_GATEWAY_URL, {
  auth: { token: localStorage.getItem('token') }
});

// Listen for new notifications
socket.on('notification:new', (notification) => {
  // Add to list
  addNotificationToList(notification);
  
  // Update badge
  incrementUnreadCount();
  
  // Show toast
  showNotificationToast(notification.title, notification.message);
  
  // Play sound (optional)
  playNotificationSound();
});

// Listen for unread count updates
socket.on('notification:unread-count', (count) => {
  updateBadge(count);
});
```

---

## 🧪 Testing Examples

### Postman Collection

#### Test 1: Create Notification (Admin Broadcast)

```
POST http://localhost:3003/api/v1/notifications
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: admin123
  Content-Type: application/json
Body:
{
  "title": "Test Notification",
  "message": "This is a test broadcast",
  "type": "INFO",
  "target": "ALL"
}
```

#### Test 2: Get Notifications (User)

```
GET http://localhost:3003/api/v1/notifications?page=1&limit=10
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 3: Get Unread Count

```
GET http://localhost:3003/api/v1/notifications/unread-count
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 4: Mark Notification as Read

```
POST http://localhost:3003/api/v1/notifications/65abc123def456789/read
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 5: Mark All as Read

```
POST http://localhost:3003/api/v1/notifications/read-all
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 6: Delete One Notification

```
DELETE http://localhost:3003/api/v1/notifications/65abc123def456789
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 7: Delete All Notifications

```
DELETE http://localhost:3003/api/v1/notifications
Headers:
  Authorization: Bearer eyJhbGc...
  x-user-id: user123
```

#### Test 8: Health Check

```
GET http://localhost:3003/api/v1/notifications/health
(No headers required)
```

---

## ⚠️ Error Handling

Tất cả các error response đều có format:

```json
{
  "message": "Error message",
  "statusCode": 400,
  "stack": "Error stack trace (chỉ ở development mode)"
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 | Bad Request | Missing required fields, invalid data format |
| 401 | Unauthorized | Missing or invalid authentication headers |
| 404 | Not Found | Notification ID không tồn tại |
| 500 | Internal Server Error | Database error, service error |

---

## 🔐 Security Best Practices

### 1. Authentication
- Tất cả requests phải đi qua API Gateway
- Gateway inject `x-user-id` header để xác định user
- JWT token được verify ở Gateway level

### 2. Authorization
- User chỉ có thể truy cập thông báo của chính họ
- Admin có thể truy cập thông báo admin và public
- Không cho phép user giả mạo `x-user-id`

### 3. Data Validation
- Validate tất cả input từ client
- Sanitize data trước khi lưu vào database
- Limit pagination size để tránh overload

### 4. Rate Limiting
- Nên implement rate limiting ở Gateway level
- Giới hạn số lượng requests per user per minute

---

## 📈 Performance Tips

### 1. Pagination
- Luôn sử dụng pagination khi lấy danh sách
- Default limit: 10-20 items
- Max limit: 100 items

### 2. Caching
- Cache unread count trong 30 giây
- Invalidate cache khi có thông báo mới

### 3. Database Indexing
- Index trên `userId` field
- Index trên `isRead` field
- Index trên `createdAt` field

### 4. Real-time Updates
- Ưu tiên WebSocket thay vì polling
- Nếu dùng polling, interval >= 30 giây

---

## 📞 Support & Contact

- **Service Name:** Notification Service
- **Default Port:** 3003
- **Health Check:** `/api/v1/notifications/health`
- **RabbitMQ Required:** Yes
- **MongoDB Required:** Yes

---

**Last Updated:** January 22, 2026  
**Version:** 1.0.0
