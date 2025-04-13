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
	const limit = 4;
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

	if (q) {
		query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
	}

	if (lang) {
		query = query.ilike("language", `%${lang}%`);
	}

	if (tags.length > 0) {
		query = query.contains("tags", tags);
	}

	type VoteCount = { snippet_id: number; upvotes: number; downvotes: number };
	type CodeSnippet = {
		id: number;
		title: string;
		description: string;
		code: string;
		language: string;
		tags: string[];
		code_votes: { vote: number }[];
		code_profiles: { email: string };
		created_at: string;
		updated_at: string;
		slug: string;
		user_id: string;
	};

	let voteCountMap = new Map<number, number>();
	if (sort === "votes") {
		const { data: voteCounts, error: voteError } = await supabase.rpc(
			"get_snippet_votes"
		);
		if (voteError) {
			console.error("Error fetching vote counts:", voteError);
			throw voteError;
		}
		console.log(voteCounts);
		voteCountMap = new Map(
			(voteCounts as VoteCount[])?.map((v) => [
				v.snippet_id,
				v.upvotes - v.downvotes,
			]) || []
		);
	} else {
		query = query.order("created_at", { ascending: false });
	}

	const {
		data: allSnippets,
		count: totalCount,
		error: snippetsError,
	} = await query;

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

	const typedSnippets = allSnippets as CodeSnippet[];
	let sortedSnippets = typedSnippets;
	if (sort === "votes") {
		sortedSnippets = typedSnippets.sort((a, b) => {
			const voteCountA = voteCountMap.get(a.id) || 0;
			const voteCountB = voteCountMap.get(b.id) || 0;
			return voteCountB - voteCountA;
		});
	}

	const paginatedData = sortedSnippets.slice(offset, offset + limit);

	const snippets = paginatedData.map((snippet) => ({
		...snippet,
		vote_count:
			snippet.code_votes?.reduce((acc, vote) => acc + vote.vote, 0) || 0,
		author: {
			name: snippet.code_profiles.email.split("@")[0],
			avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${snippet.code_profiles.email}`,
		},
		user_id: Number(snippet.user_id),
		slug: snippet.slug.toString(),
		updated_at: snippet.updated_at,
	}));

	return {
		snippets,
		total: totalCount || 0,
		hasMore: offset + limit < (totalCount || 0),
	};
}

