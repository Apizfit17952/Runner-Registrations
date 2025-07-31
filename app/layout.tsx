import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApizRace",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <MusicPlayer />
        {children}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #10B981',
              maxWidth: '420px',
              padding: '1rem',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
