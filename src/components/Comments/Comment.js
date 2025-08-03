/*import Image from "next/image";
import CommentForm from "./CommentForm";



import { useMemo } from "react";
import Avatar, { genConfig } from "react-nice-avatar";


export default function Comment({
  comment,
  replies,
  currentUserId,
  deleteComment,
  updateComment,
  addComment,
  activeComment,
  setActiveComment,
  parentId = null,
}) {
  // console.log(replies);
const config = useMemo(
  () => genConfig({ seed: comment.userId || comment.username, sex: "woman" }),
  [comment.userId, comment.username]
);



  const fiveMinutes = 300000;
  const timePassed = new Date() - new Date(comment.createdAt) > fiveMinutes;
  const canReply = Boolean(currentUserId);
  const canEdit = currentUserId === comment.userId && !timePassed;
  const canDelete = currentUserId === comment.userId && !timePassed;
  const createdAt = new Date(comment.createdAt).toLocaleString();
  const isReplying =
    activeComment &&
    activeComment.type === "replying" &&
    activeComment.id === comment.id;
  const isEditing =
    activeComment &&
    activeComment.type === "editing" &&
    activeComment.id === comment.id;
  const replyId = parentId ? parentId : comment.id;

  return (
    <div className="border border-base-300 rounded bg-base-100 p-2 m-2">
      <div className="flex  gap-2">
        <div>

          <Avatar className="w-10 h-10" {...config} />
        </div>
        <div className="flex-[0.8]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-thin text-base-800">
              {comment.username}
            </div>
            <div className="text-xs text-base-400">{createdAt}</div>
          </div>

          {!isEditing && (
            <div className="text-xs font-thin text-base-900 overflow-scroll">
              {comment.body}
            </div>
          )}

          {isEditing && (
            <CommentForm
              submitLabel="Edit"
              hasCancelButton
              initialText={comment.body}
              handleSubmit={(text) => updateComment(text, comment.id)}
              handleCancel={() => setActiveComment(null)}
            />
          )}

          <div>
            {canReply && (
              <button
                className="btn"
                onClick={() => {
                  setActiveComment({ id: comment.id, type: "replying" });
                }}
              >
                Reply
              </button>
            )}

            {canEdit && (
              <button
                className="btn"
                onClick={() => {
                  setActiveComment({ id: comment.id, type: "editing" });
                }}
              >
                Edit
              </button>
            )}

            {canDelete && (
              <button className="btn" onClick={() => deleteComment(comment.id)}>
                Delete
              </button>
            )}
          </div>

          {isReplying && (
            <CommentForm
              submitLabel="Reply"
              handleSubmit={(text) => addComment(text, replyId)}
            />
          )}
          {replies.length > 0 && (
            <div className="ml-10">
              {replies.map((reply) => (
                <Comment
                  comment={reply}
                  key={reply.id}
		      replies={replies.filter((r) => r.parentId === reply.id)} // ✅ infinite nesting
                  currentUserId={currentUserId}
                  deleteComment={deleteComment}
                  updateComment={updateComment}
                  addComment={addComment}
                  activeComment={activeComment}
                  setActiveComment={setActiveComment}
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}*/


import { useState } from "react";
import {Chat, Pencil, Trash} from "phosphor-react"
const MAX_DEPTH = 4;

const Comment = ({
  comment,
  currentUserId,
  addComment,
  deleteComment,
  updateComment,
  setActiveComment,
  activeComment,
  newCommentRef,
  depth
}) => {
  const isReplying = activeComment?.id === comment.id && activeComment?.type === "replying";
  const isEditing = activeComment?.id === comment.id && activeComment?.type === "editing";
  const isNew = activeComment?.id === comment.id && activeComment?.type === "new";

  const [text, setText] = useState(comment.body);
  const [showReplies, setShowReplies] = useState(false);

  const canReply = depth < MAX_DEPTH;

  return (
    <div
      className="border-l-2 pl-4 mt-4 relative"
      style={{ marginLeft: `${depth * 20}px` }}
      ref={isNew ? newCommentRef : null}
    >
      <div className="flex justify-between">
        <div>
          <p className="font-bold">{comment.username}</p>
          {!isEditing ? (
            <p>{comment.body}</p>
          ) : (
            <textarea
              className="border p-1 mt-1 w-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>
        <div className="flex gap-2 text-sm">
          {currentUserId === comment.userId && (
            <>
              <button onClick={() => setActiveComment({ id: comment.id, type: "editing" })}><Pencil size={19} /></button>
              <button onClick={() => deleteComment(comment.id)}><Trash size={19} /></button>
            </>
          )}
          {canReply && (
            <button onClick={() => setActiveComment({ id: comment.id, type: "replying" })}><Chat size={19} /></button>
          )}
        </div>
      </div>

      {isEditing && (
        <button
          className="text-blue-600 mt-1"
          onClick={() => {
            updateComment(text, comment.id);
            setActiveComment(null);
          }}
        >
          <Pencil size={19} />
        </button>
      )}

      {isReplying && (
        <div className="mt-2">
          <textarea
            className="border p-1 w-full"
            rows="2"
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
          <button
            className="text-blue-600 mt-1"
            onClick={() => {
              addComment(text, comment.id);
              setText("");
              setActiveComment(null);
            }}
          >
            Post Reply
          </button>
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="border-l-2 border-gray-300 ml-2 pl-3 py-2 text-sm font-medium hover:text-blue-500 transition">
          <button
            className="text-xs text-gray-500 underline"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide replies" : `Show ${comment.replies.length} replies`}
          </button>

          {showReplies &&
            comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                addComment={addComment}
                deleteComment={deleteComment}
                updateComment={updateComment}
                setActiveComment={setActiveComment}
                activeComment={activeComment}
                newCommentRef={newCommentRef}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default Comment;



