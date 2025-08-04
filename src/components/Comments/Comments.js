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
} from "../api";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

const Comments = ({ currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const newCommentRef = useRef(null);

  useEffect(() => {
    getComments().then((data) => setComments(data));
  }, []);

  const addComment = (text, parentId) => {
    createComment(text, parentId).then((comment) => {
      setComments((prev) => [...prev, comment]);
      setActiveComment({ id: comment.id, type: "new" });
    });
  };

  const deleteCommentById = (id) => {
    deleteComment(id).then(() => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const updateCommentById = (text, id) => {
    updateComment(text).then(() => {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, body: text } : c))
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

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="m-2">
        <h3 className="font-bold">Comments</h3>
      </div>
      <CommentForm submitLabel="write" handleSubmit={addComment} />

      {commentTree.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          addComment={addComment}
          deleteComment={deleteCommentById}
          updateComment={updateCommentById}
          setActiveComment={setActiveComment}
          activeComment={activeComment}
          newCommentRef={newCommentRef}
          depth={0}
        />
      ))}
    </div>
  );
};

export default Comments;
