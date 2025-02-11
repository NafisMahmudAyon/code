"use client";

import { supabase } from "@/hooks/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface CodeContextType {
	snippets: Snippets[]
	setSnippets: (snippets: Snippets[]) => void
	snippet: Snippets
	setSnippet: (snippet: Snippets) => void
	loading: boolean
	setLoading: (loading: boolean) => void
	profile: Profile | null
	handleCreateSnippet: () => Promise<void>
	updateSnippet: () => Promise<void>
	toggleTheme: () => void
	theme: 'light' | 'dark'
	latestSnippets: Snippets[],
	upVote: (id:number, downVote:boolean) => Promise<void>
}

interface Profile {
	id: number
	user_id: string
	email: string
	created_at: string
}

export interface Snippets {
	id?: number
	title: string
	description: string
	language: string
	tags: string[]
	code: string | undefined
	slug?: string
	created_at?: string
	updated_at?: string
	user_id?: string
	group_id?: number | null
}

export interface SnippetsWithVotes extends Snippets {
	upvotes: number;
	downvotes: number;
	upvote?: boolean;
	downvote?: boolean;
}


export const CodeContext = createContext<CodeContextType | null>(null)

export const CodeProvider = ({ children }: { children: React.ReactNode }) => {
	const [snippets, setSnippets] = useState<Snippets[]>([])
	const [latestSnippets, setLatestSnippets] = useState<Snippets[]>([])
	const [snippet, setSnippet] = useState<Snippets>({
		title: '',
		description: '',
		language: 'javascript',
		tags: [],
		code: ``,
		slug: ''
	})
	const [loading, setLoading] = useState<boolean>(true)
	const [profile, setProfile] = useState<Profile | null>(null)
	const { user } = useUser()
	const router = useRouter()
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Theme switcher function
	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
	};

	useEffect(() => {
		// Check if running in the client
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (savedTheme) {
				setTheme(savedTheme);
			}
		}
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const root = document.documentElement;
			root.classList.remove('light', 'dark');
			root.classList.add(theme);
			localStorage.setItem('theme', theme);
		}
	}, [theme]);


	useEffect(() => {
		setLoading(true)
		if (!user) {
			return
		}
		const fetchProfile = async () => {
			const { data, error } = await supabase.from('code_profiles').select('*').eq('user_id', user.id)
			if (error) {
				console.log(error)
			}
			if (data) {
				if (data.length === 0) {
					const { data, error } = await supabase.from('code_profiles').insert([{
						user_id: user.id,
						email: user.emailAddresses[0].emailAddress
					}])
					if (error) {
						console.log(error)
					}
					if (data) {
						setProfile(data[0])
					}
				} else {
					setProfile(data[0])
				}
			}
		}
		if (user) {
			fetchProfile()
			setLoading(false)
		}
	}, [user])

	const handleCreateSnippet = async () => {
		if (!user) {
			return
		}
		if (snippet.title === '' || snippet.language === '' || snippet.code === '') {
			return
		}
		if (!profile) {
			return
		}
		const { data, error } = await supabase.from('code_code_snippets').insert([{
			user_id: profile.id,
			title: snippet.title,
			description: snippet.description,
			language: snippet.language,
			tags: snippet.tags,
			code: snippet.code
		}]).select('slug').single();
		console.log(data)
		if (error) {
			console.log(error)
		}
		if (data) {
			console.log(data)
			router.push(`/snippets/${data.slug}`)
		}
	}

	const updateSnippet = async () => {
		if (snippet.title === '' || snippet.language === '' || snippet.code === '') {
			return
		}
		const { data, error } = await supabase.from('code_code_snippets').update([{
			title: snippet.title,
			description: snippet.description,
			language: snippet.language,
			tags: snippet.tags,
			code: snippet.code
		}]).eq('slug', snippet.slug);
		console.log(data)
		if (error) {
			console.log(error)
		}
		if (data) {
			console.log(data)
		}
	}

	const fetchLatestSnippets = async () => {
		// Fetch snippets
		const { data: snippets, error: snippetsError } = await supabase
			.from('code_code_snippets')
			.select('*')
			.eq('user_id', profile.id)
			.order('created_at', { ascending: false })
			.limit(6);

		if (snippetsError) {
			console.log(snippetsError);
			return;
		}

		// Fetch vote counts using the SQL function
		const { data: votesData, error: votesError } = await supabase.rpc('get_snippet_votes');

		if (votesError) {
			console.log(votesError);
			return;
		}

		// Fetch user-specific votes (whether the user has upvoted/downvoted)
		const { data: userVotes, error: userVotesError } = await supabase
			.from('code_votes')
			.select('snippet_id, vote')
			.eq('user_id', profile.id);

		if (userVotesError) {
			console.log(userVotesError);
			return;
		}

		// Map votes to snippets
		const snippetsWithVotes = snippets.map(snippet => {
			const voteData = votesData?.find(v => v.snippet_id === snippet.id) || { upvotes: 0, downvotes: 0 };

			// Find if the logged-in user has voted for this snippet
			const userVote = userVotes?.find(v => v.snippet_id === snippet.id);

			return {
				...snippet,
				upvotes: voteData.upvotes,
				downvotes: voteData.downvotes,
				upvote: userVote?.vote === 1,  // True if user upvoted
				downvote: userVote?.vote === -1, // True if user downvoted
			};
		});

		setLatestSnippets(snippetsWithVotes);
	};

	useEffect(() => {
		if (profile) {
			fetchLatestSnippets()
		}
	}, [profile])
	
	const upVote = async (id: number, downVote = false) => {
		if (!id || !profile) return;

		try {
			// Check if the user has already voted
			const { data: checkVote, error: checkVoteError } = await supabase
				.from("code_votes")
				.select("*")
				.eq("snippet_id", id)
				.eq("user_id", profile.id);

			if (checkVoteError) {
				console.log(checkVoteError);
				return;
			}

			let refreshNeeded = false;

			if (checkVote.length === 0) {
				// First-time voting
				const voteValue = downVote ? -1 : 1;

				const { data, error } = await supabase
					.from("code_votes")
					.insert([
						{
							snippet_id: id,
							user_id: profile.id,
							vote: voteValue, // 1 for upvote, -1 for downvote
						},
					])
					.single();

				if (error) {
					console.log(error);
				} else {
					console.log("Vote added:", data);
					refreshNeeded = true;
				}
			} else {
				// User has already voted, toggle vote
				const voteId = checkVote[0].id;
				const currentVote = checkVote[0].vote;

				let newVote;
				if (currentVote === 1) {
					newVote = downVote ? -1 : 0; // If clicking downvote, switch to -1, else remove vote
				} else if (currentVote === -1) {
					newVote = downVote ? 0 : 1; // If clicking upvote, switch to 1, else remove vote
				} else {
					newVote = downVote ? -1 : 1; // Handle unexpected cases (failsafe)
				}

				if (newVote === 0) {
					// Remove vote
					const { error } = await supabase
						.from("code_votes")
						.delete()
						.eq("id", voteId);

					if (error) {
						console.log(error);
					} else {
						console.log("Vote removed");
						refreshNeeded = true;
					}
				} else {
					// Update vote
					const { data, error } = await supabase
						.from("code_votes")
						.update({ vote: newVote })
						.eq("id", voteId)
						.single();

					if (error) {
						console.log(error);
					} else {
						console.log("Vote updated:", data);
						refreshNeeded = true;
					}
				}
			}

			// Refresh snippets only if an update was made
			if (refreshNeeded) {
				await fetchLatestSnippets();
			}
		} catch (error) {
			console.error("Error updating vote:", error);
		}
	};



	return (
		<CodeContext.Provider value={{
			snippets, setSnippets,
			snippet, setSnippet,
			loading, setLoading,
			profile,
			handleCreateSnippet,
			updateSnippet,
			toggleTheme,
			theme,
			latestSnippets,
			upVote
		}}>
			{children}
		</CodeContext.Provider>
	)
}

export const useCode = () => {
	const context = useContext(CodeContext)
	if (context === null) {
		throw new Error("useCode must be used within a CodeProvider")
	}
	return context
}