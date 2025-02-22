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

	// Get vote counts first if sorting by votes
	let voteCountMap = new Map();
	if (sort === "votes") {
		const { data: voteCounts, error: voteError } = await supabase.rpc('get_snippet_votes');
		if (voteError) {
			console.error("Error fetching vote counts:", voteError);
			throw voteError;
		}
		voteCountMap = new Map(voteCounts?.map(v => [v.snippet_id, v.upvotes - v.downvotes]) || []);
	} else {
		query = query.order("created_at", { ascending: false });
	}

	// Get all snippets with their total count
	const { data: allSnippets, count: totalCount, error: snippetsError } = await query;

	if (snippetsError) {
		console.error("Error fetching snippets:", snippetsError);
		throw snippetsError;
	}

	if (!allSnippets) {
		return {
			snippets: [],
			total: 0,
			hasMore: false,
		};
	}

	// Sort by votes if needed
	let sortedSnippets = allSnippets;
	if (sort === "votes") {
		sortedSnippets = allSnippets.sort((a, b) => {
			const voteCountA = voteCountMap.get(a.id) || 0;
			const voteCountB = voteCountMap.get(b.id) || 0;
			return voteCountB - voteCountA;
		});
	}

	// Apply pagination after sorting
	const paginatedData = sortedSnippets.slice(offset, offset + limit);

	const snippets = paginatedData.map((snippet) => ({
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
		total: totalCount || 0,
		hasMore: offset + limit < (totalCount || 0),
	};
}
