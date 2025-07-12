import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/lib/UserContext'; // ✅ import context
import Navbar from '../components/Navbar';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Consol',
  description: 'Notes-to-Memory App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white text-gray-900 h-screen overflow-hidden`}>
        <UserProvider> {/* ✅ Wrap entire app in provider */}
          <Navbar />
          <main className="h-full">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
