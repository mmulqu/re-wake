import { authMiddleware } from "@clerk/nextjs/server";
import { syncUserWithDatabase } from "./app/lib/auth";

// Load environment variables
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

if (!publishableKey || !secretKey) {
  throw new Error('Missing Clerk environment variables');
}

export default authMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: ["/api/generate"],
  afterAuth: async (auth, req, evt) => {
    if (auth.userId) {
      await syncUserWithDatabase();
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};