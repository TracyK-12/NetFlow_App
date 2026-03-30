
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Définir les routes publiques (sign-in et sign-up)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); // Force la redirection vers login si non connecté
  }
});

export const config = {
  matcher: [
    // Protège toutes les routes sauf les fichiers statiques (images, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};