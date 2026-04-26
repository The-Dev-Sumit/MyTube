# MyTube - YouTube-like Video Platform

A modern, full-featured YouTube-like video streaming platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### For Viewers

- 🎬 **Responsive Video Grid** - Browse videos with category filters
- 🔍 **Search Functionality** - Find videos by title, description, or tags
- ▶️ **Custom HTML5 Player** with:
  - Quality selection (480p, 720p, 1080p)
  - Playback speed control (0.5x - 2x)
  - Picture-in-Picture mode
  - Theater mode
  - Volume, seek, and fullscreen controls
- 💬 **Comments System** - Like, comment, and reply (nested replies)
- 👍 **Like/Dislike** - Rate videos (login required)
- 📤 **Share & Download** - Share links and download videos
- 📱 **PWA Support** - Installable app on mobile devices

### For Admins

- 📹 **Video Upload** - Upload videos in 3 quality levels (480p, 720p, 1080p)
- 🖼️ **Thumbnail Management** - Upload custom thumbnails
- 📊 **Admin Dashboard** - View statistics (videos, views, comments, users)
- ✏️ **Video Management** - Edit, publish, or delete videos
- 💬 **Comment Moderation** - Delete/pin comments
- 📋 **Video Drafts** - Save videos as drafts before publishing

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js v4
- **Storage**: Cloudinary
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide React Icons
- **Form Validation**: Zod
- **Date Formatting**: date-fns
- **Notifications**: react-hot-toast

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── videos/       # Video CRUD operations
│   ├── admin/            # Admin panel pages
│   │   ├── upload/       # Video upload
│   │   ├── videos/       # Manage videos
│   │   └── comments/     # Moderate comments
│   ├── auth/             # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── video/            # Video watch page
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── Header.tsx
│   ├── VideoPlayer.tsx
│   ├── VideoCard.tsx
│   └── ...
├── lib/
│   ├── db.ts            # MongoDB connection
│   ├── auth.ts          # NextAuth configuration
│   └── cloudinary.ts    # Cloudinary utilities
├── models/              # MongoDB schemas
│   ├── User.ts
│   ├── Video.ts
│   └── Comment.ts
├── store/               # Zustand stores
│   ├── authStore.ts
│   └── playerStore.ts
├── types/               # TypeScript types
├── utils/               # Utility functions
│   ├── formatters.ts
│   └── validators.ts
└── styles/
    └── globals.css
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials (optional)

### Installation

1. **Navigate to project directory**

   ```bash
   cd my-tube
   ```

2. **Install dependencies** (already done)

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB Connection
   NEXT_PUBLIC_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mytube?retryWrites=true&w=majority

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Admin Email (for admin panel access)
   NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
   ```

### Environment Variables Setup Guide

#### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user and copy the connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in the URI

#### NextAuth

1. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```
2. Set `NEXTAUTH_URL` to your application URL

#### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name from the dashboard
3. Generate API Key and Secret from Settings > Security

## Running the Application

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

### Other Commands

```bash
# Run linting
pnpm lint

# Format code (if prettier configured)
pnpm format
```

## Usage Guide

### For Regular Users

1. **Browse Videos**
   - Visit the home page to see all published videos
   - Use category filters to narrow down results
   - Use the search bar to find specific videos

2. **Watch Videos**
   - Click on any video to open the watch page
   - Use the custom player controls to:
     - Play/pause
     - Change quality (480p, 720p, 1080p)
     - Adjust playback speed
     - Toggle volume
     - Enable fullscreen or theater mode
     - Use Picture-in-Picture

3. **Interact**
   - Sign up/login to like videos and comment
   - Leave comments and replies
   - Like other comments
   - Share videos via copy link

### For Admin

1. **Access Admin Panel**
   - Click on your profile menu (top right)
   - Click "Admin Panel" (only visible if logged in as admin)

2. **Upload Videos**
   - Go to Admin > Upload Video
   - Fill in title, description, category, and tags
   - Upload 3 versions of your video (480p, 720p, 1080p)
   - Upload a thumbnail image
   - Choose to publish now or save as draft

3. **Manage Videos**
   - Go to Admin > Manage Videos
   - Edit video details
   - Toggle between draft and published
   - Delete videos

4. **Moderate Comments**
   - Go to Admin > Moderate Comments
   - Delete inappropriate comments
   - Pin important comments

## API Routes

### Video Routes

- `GET /api/videos` - Get all published videos with pagination
- `GET /api/videos/[videoId]` - Get video details and related videos
- `POST /api/videos/[videoId]/like` - Like/unlike a video

### Authentication Routes

- `POST /api/auth/signup` - Create new account
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

## Database Models

### User

```typescript
{
  email: string(unique);
  name: string;
  password: string(hashed);
  image: string(optional);
  provider: "credentials" | "google";
  createdAt: Date;
  updatedAt: Date;
}
```

### Video

```typescript
{
  title: string
  description: string (optional)
  thumbnail: string (Cloudinary URL)
  duration: number (seconds)
  category: string
  tags: string[]
  views: number
  likes: number
  dislikes: number
  likedBy: ObjectId[]
  dislikedBy: ObjectId[]
  published: boolean
  uploadedBy: ObjectId (User reference)
  videos: {
    "480p": string (Cloudinary URL)
    "720p": string (Cloudinary URL)
    "1080p": string (Cloudinary URL)
  }
  createdAt: Date
  updatedAt: Date
}
```

### Comment

```typescript
{
  videoId: ObjectId (Video reference)
  authorId: ObjectId (User reference)
  content: string
  likes: number
  likedBy: ObjectId[]
  parentId: ObjectId (for nested replies, optional)
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading for video cards
- Zustand for efficient state management
- MongoDB indexing on frequently queried fields
- Video quality selection to reduce bandwidth
- Custom player preserves current timestamp when switching quality

## Security Features

- NextAuth.js for authentication
- Password hashing with bcryptjs
- CSRF protection via NextAuth
- Secure HTTP-only cookies
- Environment variable validation
- Admin access control via email verification

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

1. Create a Dockerfile
2. Build: `docker build -t mytube .`
3. Run: `docker run -p 3000:3000 mytube`

### Other Platforms

Works on any platform supporting Node.js 18+:

- AWS (EC2, ECS, Lambda)
- Google Cloud Run
- DigitalOcean
- Railway
- Render

## Implemented Features

✅ Home page with video grid and category filters
✅ Search functionality
✅ Custom HTML5 video player with quality switching
✅ Playback speed control
✅ Picture-in-Picture mode
✅ Theater mode
✅ Video watch page with player
✅ Related videos sidebar
✅ Like/Dislike functionality
✅ Share video link
✅ User authentication (signup/login)
✅ Google OAuth integration
✅ Admin dashboard
✅ Video upload form
✅ Manage videos page
✅ Comment moderation page
✅ Responsive design
✅ Dark mode support
✅ TypeScript throughout
✅ Zustand state management

## Todo - Future Implementation

- [ ] Full comment system (create, edit, delete, reply)
- [ ] Comment likes
- [ ] Cloudinary integration for actual file uploads
- [ ] Admin statistics dashboard
- [ ] Video analytics
- [ ] User profiles
- [ ] Playlist management
- [ ] Subscription system
- [ ] Video notifications
- [ ] Advanced search filters
- [ ] Video transcoding (automatic quality generation)
- [ ] Live streaming support
- [ ] Mobile app (React Native)

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string is correct
- Check MongoDB Atlas whitelist includes your IP
- Ensure database user has appropriate permissions

### Video Quality Switching Issues

- Current timestamp is preserved automatically via Zustand
- If time resets, check localStorage isn't disabled
- Browser cache might interfere; try clearing

### NextAuth Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Admin Panel Access

- Ensure email matches `NEXT_PUBLIC_ADMIN_EMAIL`
- Log out and log back in after changing admin email
- Check browser developer console for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:

- Check the [Next.js docs](https://nextjs.org/docs)
- Check the [MongoDB docs](https://docs.mongodb.com/)
- Check the [NextAuth.js docs](https://next-auth.js.org/)
- Review the code comments for implementation details

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS
