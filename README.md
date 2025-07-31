# Marathon Registration System

A modern web application for managing marathon event registrations built with Next.js, Supabase, and TypeScript.

## Features

- Personal Information Registration
- Marathon Details Selection
- Email Notifications
- WhatsApp Notifications
- QR Code Generation
- Payment Integration
- Responsive Design
- Background Music Player

## Tech Stack

- Next.js 15.1.2
- React 19
- TypeScript
- Supabase
- TailwindCSS
- Zustand for State Management
- Nodemailer for Email
- Twilio for WhatsApp
- QRCode.react for QR Generation

## Prerequisites

- Node.js 18+ 
- PNPM 9.15.4+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Apizfit17952/Runner-Registrations.git
cd Runner-Registrations
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/public` - Static assets
- `/store` - Zustand state management
- `/types` - TypeScript type definitions
- `/utils` - Helper functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
