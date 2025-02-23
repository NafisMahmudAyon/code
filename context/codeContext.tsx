"use client";

import { supabase } from "@/hooks/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { useToast } from "aspect-ui/Toast";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Types
interface Profile {
	id: number;
	user_id: string;
	email: string;
	created_at: string;
}

export interface Snippets {
	id?: number;
	title: string;
	description: string;
	language: string;
	tags: string[];
	code: string | undefined;
	slug?: string;
	created_at?: string;
	updated_at?: string;
	user_id?: string;
	group_id?: number | null;
}

export interface SnippetsWithVotes extends Snippets {
	upvotes: number;
	downvotes: number;
	upvote?: boolean;
	downvote?: boolean;
	comment_count?: number;
}

interface CodeContextType {
	snippets: Snippets[];
	setSnippets: (snippets: Snippets[]) => void;
	snippet: Snippets;
	setSnippet: (snippet: Snippets) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	profile: Profile | null;
	handleCreateSnippet: () => Promise<void>;
	updateSnippet: () => Promise<void>;
	toggleTheme: () => void;
	theme: 'light' | 'dark';
	latestSnippets: SnippetsWithVotes[];
	upVote: (id: number | undefined, downVote?: boolean) => Promise<void>;
	globalLatestSnippets: SnippetsWithVotes[];
	globalUpVote: (id: number | undefined, downVote?: boolean) => Promise<void>;
}

// Default values
const DEFAULT_SNIPPET: Snippets = {
	title: '',
	description: '',
	language: 'javascript',
	tags: [],
	code: '',
	slug: ''
};

// Context creation
const CodeContext = createContext<CodeContextType | null>(null);

// Provider component
export const CodeProvider = ({ children }: { children: React.ReactNode }) => {
	const { addToast, ToastContainer } = useToast()
	const [snippets, setSnippets] = useState<Snippets[]>([]);
	const [latestSnippets, setLatestSnippets] = useState<SnippetsWithVotes[]>([]);
	const [globalLatestSnippets, setGlobalLatestSnippets] = useState<SnippetsWithVotes[]>([]);
	const [snippet, setSnippet] = useState<Snippets>(DEFAULT_SNIPPET);
	const [loading, setLoading] = useState<boolean>(true);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	const { user } = useUser();
	const router = useRouter();

	// Theme management
	const toggleTheme = useCallback(() => {
		console.log("first")
		setTheme(prevTheme => {
			const newTheme = prevTheme === 'light' ? 'dark' : 'light';
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', newTheme);
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(newTheme);
			}
			return newTheme;
		});
	}, []);

	// Initialize theme from localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (savedTheme) {
				setTheme(savedTheme);
				document.documentElement.classList.add(savedTheme);
			}
		}
	}, []);

	// Profile management
	const createProfile = useCallback(async () => {
		if (!user) return null;

		const { data, error } = await supabase
			.from('code_profiles')
			.insert([{
				user_id: user.id,
				email: user.emailAddresses[0].emailAddress
			}])
			.select()
			.single();

		if (error) throw error;
		return data;
	}, [user]);

	const fetchProfile = useCallback(async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase
				.from('code_profiles')
				.select('*')
				.eq('user_id', user.id);

			if (error) throw error;

			if (data.length === 0) {
				const newProfile = await createProfile();
				setProfile(newProfile);
			} else {
				setProfile(data[0]);
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
		} finally {
			setLoading(false);
		}
	}, [user, createProfile]);

	useEffect(() => {
		if (user) {
			fetchProfile();
		}
	}, [user, fetchProfile]);

	// Snippet management
	// const fetchLatestSnippets = useCallback(async () => {
	// 	if (!profile) return;

	// 	try {
	// 		const [snippetsResponse, votesResponse, userVotesResponse] = await Promise.all([
	// 			supabase
	// 				.from('code_code_snippets')
	// 				.select('*')
	// 				.eq('user_id', profile.id)
	// 				.order('created_at', { ascending: false })
	// 				.limit(6),
	// 			supabase.rpc('get_snippet_votes'),
	// 			supabase
	// 				.from('code_votes')
	// 				.select('snippet_id, vote')
	// 				.eq('user_id', profile.id)
	// 		]);

	// 		if (snippetsResponse.error) throw snippetsResponse.error;
	// 		if (votesResponse.error) throw votesResponse.error;
	// 		if (userVotesResponse.error) throw userVotesResponse.error;

	// 		const snippetsWithVotes = snippetsResponse.data.map(snippet => {
	// 			const voteData = votesResponse.data?.find(v => v.snippet_id === snippet.id) ||
	// 				{ upvotes: 0, downvotes: 0 };
	// 			const userVote = userVotesResponse.data?.find(v => v.snippet_id === snippet.id);

	// 			return {
	// 				...snippet,
	// 				upvotes: voteData.upvotes,
	// 				downvotes: voteData.downvotes,
	// 				upvote: userVote?.vote === 1,
	// 				downvote: userVote?.vote === -1,
	// 			};
	// 		});

	// 		setLatestSnippets(snippetsWithVotes);
	// 	} catch (error) {
	// 		console.error('Error fetching latest snippets:', error);
	// 	}
	// }, [profile]);
	const fetchLatestSnippets = useCallback(async () => {
		try {
			const [snippetsResponse, votesResponse, userVotesResponse] = await Promise.all([
				supabase
					.from('code_code_snippets')
					.select('*')
					.order('created_at', { ascending: false })
					.limit(6),
				supabase.rpc('get_snippet_votes'),
				profile
					? supabase
						.from('code_votes')
						.select('snippet_id, vote')
						.eq('user_id', profile.id)
					: { data: [], error: null },
			]);

			if (snippetsResponse.error) throw snippetsResponse.error;
			if (votesResponse.error) throw votesResponse.error;
			if (userVotesResponse.error) throw userVotesResponse.error;

			const snippetsWithVotes = snippetsResponse.data.map(snippet => {
				const voteData = votesResponse.data?.find(v => v.snippet_id === snippet.id) || {
					upvotes: 0,
					downvotes: 0,
				};

				const userVote = profile
					? userVotesResponse.data?.find(v => v.snippet_id === snippet.id)
					: null;

				return {
					...snippet,
					upvotes: voteData.upvotes, // Always show upvotes count
					downvotes: voteData.downvotes, // Always show downvotes count
					upvote: profile ? userVote?.vote === 1 : false, // If unknown user, false
					downvote: profile ? userVote?.vote === -1 : false, // If unknown user, false
				};
			});

			setLatestSnippets(snippetsWithVotes);
		} catch (error) {
			console.error('Error fetching latest snippets:', error);
		}
	}, [profile]);

	useEffect(() => {
		if (profile) {
			fetchLatestSnippets();
		}
	}, [profile, fetchLatestSnippets]);

	const handleCreateSnippet = useCallback(async () => {
		if (!user || !profile || !snippet.title || !snippet.language || !snippet.code) {
			return;
		}

		try {
			const { data, error } = await supabase
				.from('code_code_snippets')
				.insert([{
					user_id: profile.id,
					title: snippet.title,
					description: snippet.description,
					language: snippet.language,
					tags: snippet.tags,
					code: snippet.code
				}])
				.select('slug')
				.single();

			if (error) throw error;
			if (data) {
				router.push(`/snippets/${data.slug}`);
			}
		} catch (error) {
			console.error('Error creating snippet:', error);
		}
	}, [user, profile, snippet, router]);

	const updateSnippet = useCallback(async () => {
		if (!snippet.title || !snippet.language || !snippet.code || !snippet.slug) {
			return;
		}

		try {
			const { error } = await supabase
				.from('code_code_snippets')
				.update({
					title: snippet.title,
					description: snippet.description,
					language: snippet.language,
					tags: snippet.tags,
					code: snippet.code
				})
				.eq('slug', snippet.slug);

			if (error) throw error;
		} catch (error) {
			console.error('Error updating snippet:', error);
		}
	}, [snippet]);

	const upVote = useCallback(async (id: number | undefined, downVote = false) => {
		if (!id || !profile) {
			addToast({
				className: "",
				message: 'This is a toast with an action',
				messageClassName: "",
				type: 'info',
				action: {
					label: 'Undo',
					onClick: () => console.log('Undo clicked'),
					buttonClassName: ""
				}
			})
			return;
		}

		try {
			const { data: checkVote, error: checkVoteError } = await supabase
				.from("code_votes")
				.select("*")
				.eq("snippet_id", id)
				.eq("user_id", profile.id);

			if (checkVoteError) throw checkVoteError;

			if (checkVote.length === 0) {
				const voteValue = downVote ? -1 : 1;
				await supabase
					.from("code_votes")
					.insert([{
						snippet_id: id,
						user_id: profile.id,
						vote: voteValue,
					}]);
			} else {
				const currentVote = checkVote[0].vote;
				const newVote = calculateNewVote(currentVote, downVote);

				if (newVote === 0) {
					await supabase
						.from("code_votes")
						.delete()
						.eq("id", checkVote[0].id);
				} else {
					await supabase
						.from("code_votes")
						.update({ vote: newVote })
						.eq("id", checkVote[0].id);
				}
			}

			await fetchLatestSnippets();
			addToast({
				className: "",
				message: 'This is a toast with an action',
				messageClassName: "",
				type: 'error',
				action: {
					label: 'Undo',
					onClick: () => console.log('Undo clicked'),
					buttonClassName: ""
				}
			})
		} catch (error) {
			console.error("Error updating vote:", error);
		}
	}, [profile, fetchLatestSnippets]);
	const fetchGlobalLatestSnippets = useCallback(async () => {
		try {
			const [snippetsResponse, votesResponse, userVotesResponse] = await Promise.all([
				supabase
					.from('code_code_snippets')
					.select('*')
					.order('created_at', { ascending: false })
					.limit(3),
				supabase.rpc('get_snippet_votes'),
				profile
					? supabase
						.from('code_votes')
						.select('snippet_id, vote')
						.eq('user_id', profile.id)
					: { data: [], error: null },
			]);

			if (snippetsResponse.error) throw snippetsResponse.error;
			if (votesResponse.error) throw votesResponse.error;
			if (userVotesResponse.error) throw userVotesResponse.error;

			const snippetsWithVotes = snippetsResponse.data.map(snippet => {
				const voteData = votesResponse.data?.find(v => v.snippet_id === snippet.id) || {
					upvotes: 0,
					downvotes: 0,
				};

				const userVote = profile
					? userVotesResponse.data?.find(v => v.snippet_id === snippet.id)
					: null;

				return {
					...snippet,
					upvotes: voteData.upvotes, // Always show upvotes count
					downvotes: voteData.downvotes, // Always show downvotes count
					upvote: profile ? userVote?.vote === 1 : false, // If unknown user, false
					downvote: profile ? userVote?.vote === -1 : false, // If unknown user, false
				};
			});
console.log(snippetsWithVotes)
			setGlobalLatestSnippets(snippetsWithVotes);
		} catch (error) {
			console.error('Error fetching latest snippets:', error);
		}
	}, [profile]);


	useEffect(() => {
		fetchGlobalLatestSnippets();
	}, [fetchGlobalLatestSnippets]);

	const calculateNewVote = (currentVote: number, downVote: boolean): number => {
		if (currentVote === 1) {
			return downVote ? -1 : 0;
		}
		if (currentVote === -1) {
			return downVote ? 0 : 1;
		}
		return downVote ? -1 : 1;
	};
	const globalUpVote = useCallback(async (id: number | undefined, downVote = false) => {
		if (!id || !profile) {
			addToast({
				className: "",
				message: 'global not user',
				messageClassName: "",
				type: 'info',
				action: {
					label: 'Undo',
					onClick: () => console.log('Undo clicked'),
					buttonClassName: ""
				}
			})
			return;
		}

		try {
			const { data: checkVote, error: checkVoteError } = await supabase
				.from("code_votes")
				.select("*")
				.eq("snippet_id", id)
				.eq("user_id", profile.id);

			if (checkVoteError) throw checkVoteError;

			if (checkVote.length === 0) {
				const voteValue = downVote ? -1 : 1;
				await supabase
					.from("code_votes")
					.insert([{
						snippet_id: id,
						user_id: profile.id,
						vote: voteValue,
					}]);
			} else {
				const currentVote = checkVote[0].vote;
				const newVote = calculateNewVote(currentVote, downVote);

				if (newVote === 0) {
					await supabase
						.from("code_votes")
						.delete()
						.eq("id", checkVote[0].id);
				} else {
					await supabase
						.from("code_votes")
						.update({ vote: newVote })
						.eq("id", checkVote[0].id);
				}
			}

			await fetchGlobalLatestSnippets();
			addToast({
				className: "",
				message: 'global user',
				messageClassName: "",
				type: 'error',
				action: {
					label: 'Undo',
					onClick: () => console.log('Undo clicked'),
					buttonClassName: ""
				}
			})
		} catch (error) {
			console.error("Error updating vote:", error);
		}
	}, [profile, fetchGlobalLatestSnippets]);

	const contextValue: CodeContextType = {
		snippets,
		setSnippets,
		snippet,
		setSnippet,
		loading,
		setLoading,
		profile,
		handleCreateSnippet,
		updateSnippet,
		toggleTheme,
		theme,
		latestSnippets,
		globalLatestSnippets,
		globalUpVote,
		upVote
	};

	return (
		<CodeContext.Provider value={contextValue}>
			{children}
			<ToastContainer />
		</CodeContext.Provider>
	);
};

// Custom hook
export const useCode = () => {
	const context = useContext(CodeContext);
	if (!context) {
		throw new Error("useCode must be used within a CodeProvider");
	}
	return context;
};