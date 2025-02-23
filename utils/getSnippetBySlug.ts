import { supabase } from '@/hooks/supabaseClient';

type SnippetField = keyof typeof snippetFields;

const snippetFields = {
  id: true,
  user_id: true,
  title: true,
  description: true,
  language: true,
  tags: true,
  code: true,
  group_id: true,
  slug: true,
  created_at: true,
  updated_at: true
} as const;

type GetSnippetOptions = {
  fields?: SnippetField[];
};

export async function getSnippetBySlug(slug: string, options: GetSnippetOptions = {}) {
  try {
    const { fields = Object.keys(snippetFields) as SnippetField[] } = options;
    
    const query = supabase
      .from('code_code_snippets')
      .select(fields.join(','))
      .eq('slug', slug)
      .single();

    const { data: snippet, error } = await query;

    if (error) {
      throw error;
    }

    return { snippet, error: null };
  } catch (error) {
    console.error('Error fetching snippet:', error);
    return { snippet: null, error };
  }
}