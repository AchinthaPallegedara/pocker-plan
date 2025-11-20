# Poker Planning App

A real-time poker planning application built with Next.js, Socket.IO, and Upstash Redis.

## Features

- Real-time voting with Socket.IO
- Persistent storage with Upstash Redis
- Create and join planning rooms
- Fibonacci sequence voting options
- Spectator mode
- Auto-expiring rooms (24 hours)

## Tech Stack

- **Next.js 16** - React framework
- **Socket.IO** - Real-time bidirectional communication
- **Upstash Redis** - Serverless Redis for data persistence
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Upstash Redis account (free tier available)

### Local Development

1. Clone the repository
2. Install dependencies:

   ```bash
   bun install
   # or
   npm install
   ```

3. Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

4. Run the development server:

   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

**⚠️ Important:** Vercel's serverless architecture doesn't support persistent WebSocket connections required by Socket.IO.

### Recommended Approach

Deploy the Socket.IO server separately and the Next.js frontend on Vercel:

1. **Deploy Socket.IO server to Railway/Render:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. **Deploy frontend to Vercel:**
   - Add environment variables in Vercel dashboard
   - Point `NEXT_PUBLIC_SOCKET_URL` to your Socket.IO server URL

For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   └── room/              # Room pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── room-store.ts     # Upstash Redis storage layer
│   ├── socket-context.tsx # Socket.IO React context
│   └── types.ts          # TypeScript types
├── server.ts             # Custom Socket.IO server
└── DEPLOYMENT.md         # Detailed deployment guide
```

## Environment Variables

| Variable                   | Description            | Required |
| -------------------------- | ---------------------- | -------- |
| `NEXT_PUBLIC_SOCKET_URL`   | Socket.IO server URL   | Yes      |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL | Yes      |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token    | Yes      |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)

## License

MIT
