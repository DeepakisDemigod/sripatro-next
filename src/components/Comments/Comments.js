/*"use client";

import { useEffect, useState } from "react";
import {
  getComments as getCommentsApi,
  createComment as createCommentApi,
  deleteComment as deleteCommentApi,
  updateComment as updateCommentApi,
} from "../api";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

export default function Comments({ currentUserId }) {
  const [backendComments, setBackendComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);

  const rootComments = backendComments.filter(
    (backendComments) => backendComments.parentId === null
  );
  console.log("backendComments: ", backendComments);

    const getReplies = (commentId) => {
    return backendComments
      .filter((backendComment) => backendComment.parentId === commentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  };

  const addComment = (text, parentId) => {
    createCommentApi(text, parentId).then((comment) => {
      setBackendComments([comment, ...backendComments]);
      setActiveComment(null);
    });
  };

  //   Delete Comments
  const deleteComment = (commentId) => {
    if (window.confirm("are you sure, comment will be deleted permanently!")) {
      deleteCommentApi(commentId).then(() => {
        const updatedBackendComments = backendComments.filter(
          (backendComment) => backendComment.id !== commentId
        );

        setBackendComments(updatedBackendComments);
      });
    }
  };

  // updateComment

  const updateComment = (text, commentId) => {
    updateCommentApi(text, commentId).then(() => {
      const updatedBackendComments = backendComments.map((backendComment) => {
        if (backendComment.id === commentId) {
          return { ...backendComment, body: text };
        }
        return backendComment;
      });
      setBackendComments(updatedBackendComments);
      setActiveComment(null);
    });
  };

  useEffect(() => {
    getCommentsApi().then((data) => {
      setBackendComments(data);
    });
  }, []);

  return (
    <div>
      <div className="m-2">
        <h3>Comments</h3>
        <div>write comment</div>
      </div>
      <CommentForm submitLabel="write" handleSubmit={addComment} />
      <div>
        {rootComments.map((rootComment) => (
          <Comment
            key={rootComment.id}
            comment={rootComment}
            replies={getReplies(rootComment.id)}
            currentUserId={currentUserId}
            deleteComment={deleteComment}
            updateComment={updateComment}
            activeComment={activeComment}
            setActiveComment={setActiveComment}
            addComment={addComment}
          />
        ))}
      </div>
    </div>
  );
}*/




"use client";


export const buildCommentTree = (comments) => {
  const map = {};
  const roots = [];

  comments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] };
  });

  comments.forEach(comment => {
    if (comment.parentId) {
      map[comment.parentId]?.replies.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
};


import { useEffect, useState, useRef } from "react";
import { getComments, createComment, deleteComment, updateComment } from "../api";
import Comment from "./Comment";

const Comments = ({ currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const newCommentRef = useRef(null);

  useEffect(() => {
    getComments().then(data => setComments(data));
  }, []);

  const addComment = (text, parentId) => {
    createComment(text, parentId).then(comment => {
      setComments(prev => [...prev, comment]);
      setActiveComment({ id: comment.id, type: "new" });
    });
  };

  const deleteCommentById = (id) => {
    deleteComment(id).then(() => {
      setComments(prev => prev.filter(c => c.id !== id));
    });
  };

  const updateCommentById = (text, id) => {
    updateComment(text).then(() => {
      setComments(prev =>
        prev.map(c => (c.id === id ? { ...c, body: text } : c))
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
      {commentTree.map(comment => (
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

