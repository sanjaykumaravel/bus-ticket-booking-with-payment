# 🚌 Bus Ticket Booking Website

A modern, full-featured bus ticket booking platform built with Next.js 15, TypeScript, and Tailwind CSS. Book bus tickets with ease, manage bookings, and process payments securely.

## ✨ Features

- 🔍 **Smart Search** - Search buses by origin, destination, date, and number of passengers
- 💺 **Seat Selection** - Interactive seat map with real-time availability
- 🔐 **Authentication** - Secure user registration and login with JWT
- 💳 **Payment Integration** - Multiple payment methods (Credit Card, Debit Card, UPI)
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 📋 **Booking Management** - View and cancel your bookings
- 🎨 **Modern UI** - Beautiful interface with Shadcn UI components

## 🚀 Quick Start

### Prerequisites

Make sure you have one of these installed:
- **Node.js** v18 or higher (recommended: v20+)
- **Bun** (faster alternative to npm)
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-folder-name>
```

### 2. Install Dependencies

Using **Bun** (recommended - faster):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### 3. Environment Setup

The project comes with a `.env` file pre-configured. If you need to set up a new database:

```env
TURSO_CONNECTION_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

**Note:** The current `.env` file has working credentials. Only change if you want to use your own database.

### 4. Run Development Server

Using **Bun**:
```bash
bun run dev
```

Or using **npm**:
```bash
npm run dev
```

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) to see your application running!

## 📁 Project Structure

```
bus-booking-website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   │   └── login/         # Login page
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Auth endpoints
│   │   ├── booking/           # Booking page
│   │   ├── confirmation/      # Booking confirmation
│   │   ├── my-bookings/       # User bookings page
│   │   ├── payment/           # Payment page
│   │   ├── search/            # Search results page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn UI components
│   │   └── *.tsx              # Custom components
│   ├── db/                    # Database configuration
│   │   └── schema.ts          # Database schema
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts            # Client auth utilities
│   │   ├── auth-server.ts     # Server auth utilities
│   │   └── busData.ts         # Bus data helpers
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
├── .env                       # Environment variables
├── drizzle.config.ts         # Drizzle ORM config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## 🎯 Key Features & Usage

### 1. Homepage
- Search for buses by selecting origin, destination, date, and passengers
- Browse popular routes with quick access
- View key features (Safe Travel, On-Time Guarantee, Best Prices)

### 2. Search Results
- View available buses with details (operator, timing, seats, price)
- Filter buses by departure time and price range
- Select seats from interactive seat map
- Amenities display (AC, WiFi, Charging, etc.)

### 3. Booking Flow
1. Select bus and seats
2. Enter passenger details
3. Review booking summary
4. Complete payment
5. Get confirmation with booking details

### 4. My Bookings
- View all your bookings
- Check booking status
- Cancel bookings if needed

## 🛠️ Technologies Used

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI + Radix UI
- **Database:** Turso (LibSQL)
- **ORM:** Drizzle
- **Authentication:** JWT (jsonwebtoken)
- **Payment:** Stripe integration ready
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod

## 🗄️ Database Schema

The project uses Turso (LibSQL) with the following tables:
- `users` - User accounts
- `bookings` - Bus bookings
- `passengers` - Passenger details
- `buses` - Bus information
- `routes` - Bus routes

## 🔐 Authentication

- **JWT-based authentication** with secure token storage
- **Client-safe auth utilities** (`src/lib/auth.ts`) for frontend
- **Server-only auth functions** (`src/lib/auth-server.ts`) for API routes
- Token stored in localStorage with automatic validation

## 🎨 UI/UX Highlights

- **Responsive design** - Mobile-first approach
- **Smooth animations** - Framer Motion & CSS animations
- **Loading states** - Skeleton loaders and spinners
- **Toast notifications** - User feedback with Sonner
- **Accessible** - ARIA labels and keyboard navigation

## 📝 Available Scripts

```bash
# Development
bun run dev          # Start dev server with Turbopack
npm run dev

# Production
bun run build        # Build for production
npm run build

bun run start        # Start production server
npm run start

# Linting
bun run lint         # Run ESLint
npm run lint
```

## 🐛 Troubleshooting

### Module Resolution Errors
If you see errors about missing modules, try:
```bash
rm -rf node_modules
rm -rf .next
bun install  # or npm install
bun run dev  # or npm run dev
```

### Port Already in Use
If port 3000 is busy:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
bun run dev -- --port 3001
```

### Database Connection Issues
- Verify `.env` file exists with correct credentials
- Check Turso dashboard for database status
- Ensure `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are set

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS
- Google Cloud

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review server logs in the terminal
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

---

**Happy Booking! 🚌✨**