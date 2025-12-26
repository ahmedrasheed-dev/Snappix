# Snappix
Snappix is a full-stack video sharing platform inspired by modern video streaming applications.  
The project focuses on real-world system design, clean UI behavior, and production-style architecture rather than relying on third-party APIs.

---

## Features

### Video Platform
- Upload, stream, and watch videos
- Responsive video player with desktop-only theater mode
- Support for both horizontal and vertical videos
- Watch history tracking
- View count handling
- Creater Dashboard with History and everything
- Playlist Creation and Management

### User & Channel System
- User authentication using JWT
- Channel profiles
- Subscribe and unsubscribe functionality
- Subscriber count tracking

### Content Interaction
- Comments system
- Related videos based on the currently playing video

### UI & UX
- Fully responsive layout (mobile, tablet, desktop)
- Theater mode similar to YouTube (desktop only)
- Mobile-friendly related videos layout
- Skeleton loaders and loading states
- Graceful error handling

---

## Tech Stack

### Frontend
- React
- React Router
- Redux Toolkit
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- S3 used for storing Videos

## Deployment & Infrastructure

- **AWS S3** for video storage
- **Amazon CloudFront** for low-latency video distribution
- **AWS Lambda** for backend deployment (serverless architecture)
- **Amazon CloudWatch** for backend logging and monitoring
- Media uploads handled through signed URLs to keep the backend stateless

This setup mirrors real-world video platforms by separating storage, distribution, and application logic.

---

## Improvements & Next Steps

The following improvements can be done to make it a production-grade video systems:

- **HLS (HTTP Live Streaming)** for adaptive bitrate streaming across different network conditions
- Server-side video transcoding pipeline for multiple resolutions (240p–1080p)

- **Bad-word filtering for comments using Node.js streams**, allowing real-time processing without loading entire content into memory
- Comment reporting and moderation tools for creators
- Rate limiting on comments to reduce spam

### Platform Features
- Notifications for uploads, comments, and subscriptions
- Improved recommendation logic based on watch history using Ai



## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>

# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm run dev


⚠️ Note: Repository history was reset due to local git corruption.
All code is original work.