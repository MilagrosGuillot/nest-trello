
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/components/Navbar/Navbar';

const geistSans = Geist({

})

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#261750] to-[#5d4988] text-white font-sans">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
