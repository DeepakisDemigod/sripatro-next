"use client";

export const buildCommentTree = (comments) => {
  const map = {};
  const roots = [];

  comments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  comments.forEach((comment) => {
    if (comment.parentId) {
      map[comment.parentId]?.replies.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
};

import { useEffect, useState, useRef } from "react";
import {
  getComments,
  createComment,
  deleteComment,
  updateComment,
  voteComment,
} from "../api";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const Comments = ({ currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const newCommentRef = useRef(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const effectiveCurrentUserId =
    session?.user?.id || session?.user?.email || currentUserId || null;
  const [visibleRoots, setVisibleRoots] = useState(10);

  useEffect(() => {
    if (!pathname) return;
    getComments(pathname)
      .then((data) => setComments(data))
      .catch(() => setComments([]));
  }, [pathname]);

  const addComment = (text, parentId) => {
    createComment(text, parentId, pathname).then((comment) => {
      setComments((prev) => [...prev, comment]);
      setActiveComment({ id: comment.id, type: "new" });
      if (!parentId) setVisibleRoots((v) => v + 1);
    });
  };

  const deleteCommentById = (id) => {
    deleteComment(id).then(() => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isDeleted: true, body: "[deleted]" } : c
        )
      );
    });
  };

  const updateCommentById = (text, id) => {
    updateComment(text, id).then(() => {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, body: text } : c))
      );
    });
  };

  const handleVote = (id, value) => {
    voteComment(id, value).then((res) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                upvoteCount: res.upvoteCount,
                downvoteCount: res.downvoteCount,
                currentUserVote: res.currentUserVote,
              }
            : c
        )
      );
    });
  };

  useEffect(() => {
    if (activeComment?.type === "new") {
      newCommentRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveComment(null);
    }
  }, [comments]);

  const commentTree = buildCommentTree(comments);
  const roots = commentTree;
  const hasMore = roots.length > visibleRoots;
  const visible = roots.slice(0, visibleRoots);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="m-2">
        <h3 className="font-bold">Comments</h3>
      </div>
      <CommentForm submitLabel="write" handleSubmit={addComment} />

      {visible.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          currentUserId={effectiveCurrentUserId}
          addComment={addComment}
          deleteComment={deleteCommentById}
          updateComment={updateCommentById}
          onVote={handleVote}
          setActiveComment={setActiveComment}
          activeComment={activeComment}
          newCommentRef={newCommentRef}
          depth={0}
        />
      ))}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            className="btn btn-sm"
            onClick={() => setVisibleRoots((v) => v + 10)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default Comments;
