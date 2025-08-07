# 📺 Snappix API Documentation

Most endpoints require **Bearer Token** authentication in the `Authorization` header:  
`Authorization: Bearer <token>`

---

## 🧑‍💼 User Routes

### POST `/users/register`
Register a new user.

**FormData Parameters:**
- `username` (string, required)
- `fullName` (string, required)
- `email` (string, required)
- `password` (string, required)
- `avatar` (file, optional)
- `coverImage` (file, optional)

---

### POST `/users/login`
Authenticate user and receive tokens.

**Body (x-www-form-urlencoded):**
- `email` (string, required)
- `password` (string, required)

---

### POST `/users/refresh-token`
Refresh the access token.

**Body (x-www-form-urlencoded):**
- `email` (string, required)
- `password` (string, required)

---

### POST `/users/change-password`
Change user password.

**Body (x-www-form-urlencoded):**
- `currentPassword` (string, required)
- `newPassword` (string, required)

---

### POST `/users/logout`
Logout the authenticated user.

**Body (x-www-form-urlencoded):**
- `email` (string)
- `password` (string)

---

### POST `/users/update-profile`
Update profile details.

**Body (x-www-form-urlencoded):**
- `fullName` (string)
- `email` (string)

---

### POST `/users/update-avatar`
Update avatar image.

**FormData:**
- `avatar` (file, required)

---

### GET `/users/profile`
Get the currently authenticated user profile.

---

### GET `/users/c/:username`
Get channel details by username.

---

## 📹 Video Routes

### POST `/videos/upload`
Upload a new video.

**FormData:**
- `video` (file, required)
- `thumbnail` (file, required)
- `title` (string, required)
- `description` (string, required)

---

### GET `/videos/`
Retrieve all videos.

---

### GET `/videos/:videoId`
Get a single video by its ID.

---

### PATCH `/videos/:videoId`
Update video details.

**FormData:**
- `title` (string)
- `description` (string)
- `thumbnail` (file, optional)

---

### PATCH `/videos/toggle-publish/:videoId`
Toggle video visibility (published/unpublished).

---

### DELETE `/videos/:videoId`
Delete a video by ID.

---

## 💬 Comment Routes

### GET `/comments/:videoId`
Retrieve comments for a video.

---

### POST `/comments/:videoId`
Add a comment to a video.

**Body (x-www-form-urlencoded):**
- `content` (string, required)

---

### PATCH `/comments/:commentId`
Update a comment.

**Body (x-www-form-urlencoded):**
- `content` (string, required)

---

### DELETE `/comments/:commentId`
Delete a comment by ID.

---

### POST `/comments/reply/:videoId/:parentCommentId`
Add a reply to a comment.

**Body (x-www-form-urlencoded):**
- `content` (string, required)

---

## ❤️ Like Routes

### GET `/likes/videos`
Retrieve all liked videos.

---

### POST `/likes/v/:videoId`
Like or unlike a video.

---

### POST `/likes/c/:commentId`
Like or unlike a comment.

---

### POST `/likes/t/:tweetId`
Like or unlike a tweet.

---

## 📝 Tweet Routes

### GET `/tweets/`
Fetch all tweets by the authenticated user.

---

### POST `/tweets/`
Post a new tweet.

**Body (x-www-form-urlencoded):**
- `content` (string, required)

---

### PATCH `/tweets/:tweetId`
Update an existing tweet.

**Body (x-www-form-urlencoded):**
- `content` (string, required)

---

### DELETE `/tweets/:tweetId`
Delete a tweet.

---

## 📂 Playlist Routes

### GET `/playlists/:userId/:page/:limit`
Fetch paginated playlists for a user.

---

### GET `/playlists/:playlistId`
Retrieve a playlist by ID.

---

### POST `/playlists/`
Create a new playlist.

**Body (x-www-form-urlencoded):**
- `name` (string, required)
- `description` (string, optional)

---

### PATCH `/playlists/:playlistId`
Update playlist details.

**Body (x-www-form-urlencoded):**
- `name` (string)
- `description` (string)

---

### DELETE `/playlists/:playlistId`
Delete a playlist.

---

### POST `/playlists/add-video/:playlistId/:videoId`
Add a video to a playlist.

---

### DELETE `/playlists/remove-video/:playlistId/:videoId`
Remove a video from a playlist.

---


---

## 📦 Example Request/Response Bodies

### 🧑‍💼 User Registration

**Request:**
```
POST /users/register
Content-Type: multipart/form-data

{
  "username": "ahmedreal",
  "fullName": "Ahmed Rasheed",
  "email": "ahmedreal@gmail.com",
  "password": "12345678",
  "avatar": [image file],
  "coverImage": [image file]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "6891234567abcdef",
    "username": "ahmedreal",
    "email": "ahmedreal@gmail.com"
  }
}
```

---

### 🔐 Login User

**Request:**
```
POST /users/login
Content-Type: application/x-www-form-urlencoded

email=ahmedreal@gmail.com&password=12345678
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg==",
  "user": {
    "id": "6891234567abcdef",
    "username": "ahmedreal",
    "email": "ahmedreal@gmail.com"
  }
}
```

---

### 📹 Upload Video

**Request:**
```
POST /videos/upload
Content-Type: multipart/form-data

{
  "title": "My first video",
  "description": "awesome init",
  "video": [video file],
  "thumbnail": [image file]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "videoId": "6890beba90e632d240cfc2dd",
    "title": "My first video",
    "published": false
  }
}
```

---

### 💬 Add Comment

**Request:**
```
POST /comments/:videoId
Content-Type: application/x-www-form-urlencoded

content=my first comment
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "68943bc9c5a38fe91abfff98",
    "content": "my first comment",
    "author": "ahmedreal",
    "videoId": "6894212cca1c9f6372c6526d"
  }
}
```

---

### 📂 Create Playlist

**Request:**
```
POST /playlists/
Content-Type: application/x-www-form-urlencoded

name=My Playlist&description=My favorite videos
```

**Response:**
```json
{
  "success": true,
  "playlist": {
    "id": "6894a25767d96c99ed80bec5",
    "name": "My Playlist",
    "videos": []
  }
}
```

---