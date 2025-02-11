import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/api/(.*)", "/code/(.*)"]);

export default clerkMiddleware(async (auth, request) => {
	// Add CORS headers to the response
	const response = NextResponse.next();

	// Set CORS headers
	response.headers.set("Access-Control-Allow-Origin", "*"); // Adjust to your needs (e.g., specific domain)
	response.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS"
	);
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);
	response.headers.set("Access-Control-Allow-Credentials", "true");

	// If preflight request (OPTIONS), return early with a 200 response
	if (request.method === "OPTIONS") {
		return new NextResponse(null, {
			status: 200,
			headers: response.headers,
		});
	}

	// Protect all routes except public ones
	if (!isPublicRoute(request)) {
		await auth.protect();
	}

	return response;
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
