import type { Metadata } from "next";
import { ClerkProvider, Show } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: "NetFlow",
  description: "Suivi des missions de freelances",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#F8FAFC]">
        <ClerkProvider>
          <Show when="signed-in">
            <Sidebar />
          </Show>

          <main className="w-full min-h-screen">
            <Show when="signed-in">
              <div className="md:pl-64">
                {children}
              </div>
            </Show>

            <Show when="signed-out">
              <div className="flex items-center justify-center min-h-screen w-full">
                {children}
              </div>
            </Show>
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}