"use client";
import { supabase } from "@/hooks/supabaseClient";
import { SearchParams, SearchResponse } from "./Types";

export async function searchSnippets({
	q = "",
	lang = "",
	sort = "newest",
	tags = [],
	page = 1,
}: SearchParams): Promise<SearchResponse> {
	const limit = 4; // Number of items per page
	const offset = (page - 1) * limit;

	let query = supabase.from("code_code_snippets").select(
		`
      *,
      code_votes (vote),
      code_profiles!code_code_snippets_user_id_fkey (
        email
      )
    `,
		{ count: "exact" }
	);

	// Apply search filter
	if (q) {
		query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
	}

	// Apply language filter
	if (lang) {
		query = query.ilike("language", `%${lang}%`);
	}

	// Apply tags filter
	if (tags.length > 0) {
		query = query.contains("tags", tags);
	}

	// Apply sorting
	if (sort === "votes") {
		query = query.order("vote_count", { ascending: false });
	} else {
		query = query.order("created_at", { ascending: false });
	}

	// Apply pagination
	query = query.range(offset, offset + limit - 1);

	const { data, count, error } = await query;

	if (error) {
		console.error("Supabase query error:", error);
		throw error;
	}

	if (!data) {
		return {
			snippets: [],
			total: 0,
			hasMore: false,
		};
	}

	const snippets = data.map((snippet) => ({
		...snippet,
		vote_count:
			snippet.code_votes?.reduce((acc, vote) => acc + vote.vote, 0) || 0,
		author: {
			name: snippet.code_profiles.email.split("@")[0], // Use email as name
			avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${snippet.code_profiles.email}`, // Generate avatar from email
		},
	}));

	return {
		snippets,
		total: count || 0,
		hasMore: offset + limit < (count || 0),
	};
}
