import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '../../components/Navbar/Navbar';

const geistSans = Geist({
  subsets: ['latin'],  // agregá el subset requerido
  preload: true,
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
