/*
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
{canReply && (
            <button onClick={() => setActiveComment({ id: comment.id, type: "replying" })}><Chat size={19} /></button>
          )}

          {currentUserId === comment.userId && (
            <>
              <button onClick={() => setActiveComment({ id: comment.id, type: "editing" })}><Pencil size={19} /></button>
              <button onClick={() => deleteComment(comment.id)}><Trash size={19} /></button>
            </>
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

*/
import { useState } from "react";
import { Chat, PencilSimple, Trash } from "phosphor-react";
import { useMemo } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import {useSession} from "next-auth/react"
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
  depth,
}) => {
	const {data: session} = useSession();
  const config = useMemo(
    () => genConfig({ seed: comment.userId || comment.username }),
    [comment.userId, comment.username]
  );
  const isReplying =
    activeComment?.id === comment.id && activeComment?.type === "replying";
  const isEditing =
    activeComment?.id === comment.id && activeComment?.type === "editing";
  const isNew =
    activeComment?.id === comment.id && activeComment?.type === "new";

  const [text, setText] = useState(comment.body);
  const [showReplies, setShowReplies] = useState(false);

  const canReply = depth < MAX_DEPTH;

  return (
    <div
      className="ml-4 mt-4 border-l border-base-300 pl-4"
      style={{ marginLeft: `${depth * 16}px` }}
      ref={isNew ? newCommentRef : null}
    >
      <div className="flex flex-col justify-between items-start">
        <div className="space-y-1 w-full">
          <div className="flex items-center mb-1">
            <Avatar
              className="inline-block mr-2"
              style={{ width: "24px", height: "24px" }}
              {...config}
            />
            <div className="text-sm font-semibold text-base-content">
              {comment.username, session?.user?.email}
            </div>
          </div>

          {!isEditing ? (
            <p className="text-sm text-base-content">{comment.body}</p>
          ) : (
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>

        <div className="flex gap-2 text-base-content/60">
          {canReply && (
            <button
              className="btn btn-xs btn-ghost"
              onClick={() =>
                setActiveComment({ id: comment.id, type: "replying" })
              }
              title="Reply"
            >
              <Chat size={16} /> Reply
            </button>
          )}
          {currentUserId === comment.userId && (
            <>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() =>
                  setActiveComment({ id: comment.id, type: "editing" })
                }
                title="Edit"
              >
                <PencilSimple size={16} /> Edit
              </button>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => deleteComment(comment.id)}
                title="Delete"
              >
                <Trash size={16} /> Remove
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <button
          className="btn btn-xs btn-primary mt-2"
          onClick={() => {
            updateComment(text, comment.id);
            setActiveComment(null);
          }}
        >
          Save
        </button>
      )}

      {isReplying && (
        <div className="mt-3 space-y-2">
          <textarea
            className="textarea textarea-bordered textarea-sm w-full"
            rows="2"
            placeholder="Write a reply..."
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
          <button
            className="btn btn-sm btn-primary"
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
        <div className="mt-3 ml-1">
          <button
            className="text-xs text-primary underline"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies
              ? "Hide replies"
              : `Show ${comment.replies.length} repl${comment.replies.length === 1 ? "y" : "ies"}`}
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
