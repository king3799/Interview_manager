# Interview Manager

A modern web application for managing interview schedules with role-based access control. Built with Next.js, NextAuth, and PostgreSQL.

## Features

### 🎯 Core Features
- **Interview Management**: Create, read, update, and delete interviews
- **Role-Based Access**: Admin, Bidder, and Viewer roles with different permissions
- **Dashboard**: Statistics and insights at a glance
- **Advanced Filters**: Search by role, country, date range, progress status, and creator
- **Excel Export**: Export filtered interview data to CSV
- **Timezone Support**: Automatic timezone conversion for interview times

### 👥 User Roles

| Role | View | Create | Edit | Delete | User Management |
|------|------|--------|------|--------|-----------------|
| **Admin** | All ✓ | ✓ | All ✓ | All ✓ | ✓ |
| **Bidder** | All ✓ | ✓ | Own ✓ | Own ✓ | ✗ |
| **Viewer** | All ✓ | ✗ | ✗ | ✗ | ✗ |

### 📊 Interview Progress States
- Not Started
- Scheduled
- Phone Call
- Test
- Initial Interview
- Technical Interview
- CEO/CTO Interview
- Rejected

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL (Neon for production)
- **ORM**: Prisma
- **Styling**: Inline styles (green theme)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/interview-manager.git
cd interview-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/interviewjob"
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Set up the database

Run Prisma migrations:

```bash
npm run db:push
```

### 5. Seed the admin user

```bash
npm run db:seed
```

This creates:
- Username: `admin`
- Password: `admin123`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel + Neon.

### Quick Deploy Steps:

1. Push to GitHub
2. Import to Vercel
3. Add Neon PostgreSQL from Vercel Marketplace
4. Set environment variables (`AUTH_SECRET`, `AUTH_URL`)
5. Run migrations: `npm run db:push`
6. Seed admin: `npm run db:seed`

## Project Structure

```
interview-manager/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages (users)
│   ├── dashboard/         # Dashboard page
│   ├── interviews/        # Interview CRUD pages
│   ├── login/             # Login page
│   └── profile/           # User profile
├── components/            # React components
├── lib/                   # Utilities (db, timezone, etc.)
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Utility scripts (seed, etc.)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed admin user
- `npm run db:studio` - Open Prisma Studio

## Key Features

### Dashboard
- Total interviews count
- Scheduled, in-progress, completed, and rejected statistics
- Top countries chart with progress bars
- Recent interviews list

### Interview Management
- Create interviews with profile name, interviewee name, and all details
- Edit own interviews (Bidder) or all (Admin)
- Delete with confirmation modal
- View detailed interview information
- Color-coded progress states

### Filters & Search
- Full-text search across role, country, and URLs
- Filter by progress status
- Filter by country
- Date range filter (start/end date)
- Creator filter (Admin/Bidder only)
- Real-time result count

### User Management (Admin Only)
- Create new users with username, name, role, and password
- Edit user information and change roles
- Delete users (cascades to their interviews)
- Password change on edit (optional)

## Security Features

- Password hashing with bcrypt
- Session-based authentication (NextAuth)
- Role-based access control
- API route protection
- SQL injection prevention (parameterized queries)
- Self-delete prevention (users can't delete themselves)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Database by [Neon](https://neon.tech/)
- Hosted on [Vercel](https://vercel.com/)
