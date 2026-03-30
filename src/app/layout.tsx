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
      <body className="flex min-h-screen bg-[#F8FAFC]">
        <ClerkProvider>
          
          {/* Affiche la sidebar UNIQUEMENT si l'utilisateur est connecté */}
          <Show when="signed-in">
            <Sidebar />
          </Show>
          
          <main className="flex-1 min-h-screen w-full">
            {/* Si connecté : on ajoute la marge pour la sidebar */}
            <Show when="signed-in">
              <div className="md:ml-64">
                {children}
              </div>
            </Show>

            {/* Si déconnecté : on centre le formulaire de login en plein écran */}
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