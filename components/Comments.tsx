"use client";

import { supabase } from "@/hooks/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { useToast } from "aspect-ui/Toast";
import { memo, useCallback, useEffect, useState } from "react";

interface Comment {
  id: number;
  snippet_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    email: string;
  };
  replies?: Comment[];
}

interface CommentsProps {
  snippetSlug: string;
}

export default function Comments({ snippetSlug }: CommentsProps) {
  const [snippetId, setSnippetId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  // const [replyTo, setReplyTo] = useState<number | null>(null);
  // const [replyContent, setReplyContent] = useState("");
  const { user } = useUser();
  const { addToast } = useToast();

  const fetchComments = async () => {
    const { data: commentsData, error } = await supabase
      .from("code_comments")
      .select(`
        *,
        code_profiles (email)
      `)
      .eq("snippet_id", snippetId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    // Organize comments into a threaded structure
    const threadedComments = commentsData.reduce((acc: Comment[], comment: Comment) => {
      if (!comment.parent_comment_id) {
        // This is a top-level comment
        comment.replies = commentsData.filter(
          (reply: Comment) => reply.parent_comment_id === comment.id
        );
        acc.push(comment);
      }
      return acc;
    }, []);

    setComments(threadedComments);
  };

  const fetchSnippetId = async () => {
    const { data: snippet, error } = await supabase
      .from("code_code_snippets")
      .select("id")
      .eq("slug", snippetSlug)
      .single();

    if (error) {
      console.error("Error fetching snippet:", error);
      return;
    }

    setSnippetId(snippet.id);
  };

  useEffect(() => {
    fetchSnippetId();
  }, [snippetSlug]);

  useEffect(() => {
    if (snippetId) {
      fetchComments();
    }
  }, [snippetId]);

  const handleSubmitComment = async (parentId: number | null = null, content?: string) => {
    const commentContent = content || newComment;
    if (!user || !commentContent.trim() || !snippetId) {
      addToast({
        message: "Please sign in to comment",
        type: "error",
      });
      return;
    }

    try {
      // First get the profile id for the current user
      const { data: profileData, error: profileError } = await supabase
        .from("code_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error: commentError } = await supabase.from("code_comments").insert([
        {
          snippet_id: snippetId,
          user_id: profileData.id,
          parent_comment_id: parentId,
          content: commentContent,
        },
      ]);

      if (commentError) throw commentError;

      setNewComment("");
      // setReplyTo(null);
      fetchComments();

      addToast({
        message: "Comment added successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      addToast({
        message: "Error adding comment",
        type: "error",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [localReplyContent, setLocalReplyContent] = useState("");

    const handleReply = useCallback(() => {
      handleSubmitComment(comment.id, localReplyContent);
      setLocalReplyContent("");
      setIsReplying(false);
    }, [comment.id, localReplyContent]);

    return (
      <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.email}`}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {comment.author?.email.split("@")[0]}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
          {comment.parent_comment_id === null && <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            Reply
          </button>}
          {isReplying && (
            <div className="mt-2">
              <textarea
                value={localReplyContent}
                onChange={(e) => setLocalReplyContent(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Write a reply..."
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setLocalReplyContent("");
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  CommentItem.displayName = 'CommentItem';

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Comments</h2>
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Write a comment..."
          rows={4}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => handleSubmitComment(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}