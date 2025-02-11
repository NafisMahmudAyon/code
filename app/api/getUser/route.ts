import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
	// Extract userId from query parameters
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		// Fetch user details from Clerk
		const client = await clerkClient();
		const user = await client.users.getUser(userId);

		console.log(user)

		return NextResponse.json({
			id: user.id,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.emailAddresses[0]?.emailAddress, // Get primary email
			image: user.imageUrl,
			publicMetadata: user.publicMetadata, // Optional metadata
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}
}
