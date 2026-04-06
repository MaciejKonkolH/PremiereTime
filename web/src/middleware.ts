import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/cron-updater(.*)']);

export default clerkMiddleware(async (auth, request) => {
  console.log("Middleware checking route:", request.nextUrl.pathname);
  if (!isPublicRoute(request)) {
    console.log("Protecting route...");
    await auth.protect();
    console.log("Route protected, proceeding.");
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
