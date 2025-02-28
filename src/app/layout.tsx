import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SoulPrinting - Figuras 3D Personalizadas',
  description: 'Tienda de figuras 3D personalizadas. Crea tus propios diseños o elige entre nuestra colección.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
} 