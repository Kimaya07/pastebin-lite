# Pastebin Lite

A simple pastebin application that allows users to create and share text pastes with optional expiry and view limits.

## Features

- Create text pastes with shareable URLs
- Optional time-to-live (TTL) expiry
- Optional view count limits
- Clean, responsive UI
- RESTful API

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Persistence**: Vercel KV (Redis)
- **Deployment**: Vercel

## Running Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pastebin-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   ```

   To get these values:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new KV Database or use existing one
   - Copy the environment variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Persistence Layer

This application uses **Vercel KV** (Redis-based key-value store) for data persistence.

### Why Vercel KV?

- Serverless-friendly (data persists across requests)
- Fast read/write operations
- Native TTL support for automatic expiry
- Easy integration with Vercel deployments
- Free tier available

### Data Structure

Each paste is stored with the following structure:
```javascript
{
  content: string,
  expires_at: number | null,
  max_views: number | null,
  remaining_views: number | null,
  created_at: number
}
```

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns: `{ "ok": true }`

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "string (required)",
  "ttl_seconds": number (optional, >= 1),
  "max_views": number (optional, >= 1)
}
```
Returns: `{ "id": "string", "url": "string" }`

### Fetch Paste
```
GET /api/pastes/:id
```
Returns:
```json
{
  "content": "string",
  "remaining_views": number | null,
  "expires_at": "ISO8601 string" | null
}
```

### View Paste (HTML)
```
GET /p/:id
```
Returns: HTML page with paste content

## Design Decisions

### 1. Next.js App Router
Used the modern App Router for better performance and server-side rendering capabilities.

### 2. API vs HTML View Counts
Only API calls (`/api/pastes/:id`) decrement the view counter. The HTML view (`/p/:id`) does not count as a view, allowing users to share links without worrying about accidentally consuming views.

### 3. Atomic Operations
View count decrements use atomic operations to prevent race conditions under concurrent access.

### 4. Test Mode Support
Implements deterministic time testing via `TEST_MODE=1` environment variable and `x-test-now-ms` header for reliable automated testing.

### 5. Error Handling
All error responses return proper JSON with appropriate HTTP status codes (4xx for client errors, 404 for unavailable pastes).

### 6. Security
- Content is rendered safely to prevent XSS attacks
- Input validation on all API endpoints
- No sensitive data in client-side code

## Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add a Vercel KV database to your project
   - Deploy!

## License

MIT