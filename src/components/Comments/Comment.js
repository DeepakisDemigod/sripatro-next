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
import {
  Chat,
  PencilSimple,
  Trash,
  ArrowFatUp,
  ArrowFatDown,
} from "phosphor-react";
import { useMemo } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import { useSession } from "next-auth/react";
import Link from "next/link";
const MAX_DEPTH = 4;

function formatRelativeTime(iso) {
  try {
    const date = new Date(iso);
    const diff = (Date.now() - date.getTime()) / 1000; // seconds
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const divisions = [
      { amount: 60, unit: "second" },
      { amount: 60, unit: "minute" },
      { amount: 24, unit: "hour" },
      { amount: 7, unit: "day" },
      { amount: 4.34524, unit: "week" },
      { amount: 12, unit: "month" },
      { amount: Infinity, unit: "year" },
    ];
    let duration = Math.abs(diff);
    let unit = "second";
    let value = -Math.round(diff);
    let accumulated = 1;
    for (const d of divisions) {
      if (duration < d.amount) {
        unit = d.unit;
        value = -Math.round(diff / accumulated);
        break;
      }
      duration /= d.amount;
      accumulated *= d.amount;
    }
    return rtf.format(value, unit);
  } catch {
    return "";
  }
}

const Comment = ({
  comment,
  currentUserId,
  addComment,
  deleteComment,
  updateComment,
  onVote,
  setActiveComment,
  activeComment,
  newCommentRef,
  depth,
}) => {
  const { data: session } = useSession();
  const config = useMemo(
    () => genConfig({ seed: comment.userId || comment.username }),
    [comment.userId, comment.username]
  );
  const isReplying =
    !comment.isDeleted &&
    activeComment?.id === comment.id &&
    activeComment?.type === "replying";
  const isEditing =
    !comment.isDeleted &&
    activeComment?.id === comment.id &&
    activeComment?.type === "editing";
  const isNew =
    activeComment?.id === comment.id && activeComment?.type === "new";

  const [text, setText] = useState(comment.body);
  const [showReplies, setShowReplies] = useState(false);
  const isSignedIn = !!session?.user;
  const canReply = depth < MAX_DEPTH && !comment.isDeleted && isSignedIn;
  const sessionUserId = session?.user?.id || session?.user?.email;
  const sessionUserName = session?.user?.name || session?.user?.email;
  const canEdit =
    !comment.isDeleted &&
    (currentUserId === comment.userId ||
      (sessionUserId && comment.userId === sessionUserId) ||
      (sessionUserName && comment.username === sessionUserName));
  const createdAtTitle = comment.createdAt
    ? new Date(comment.createdAt).toLocaleString()
    : "";
  const rel = comment.createdAt ? formatRelativeTime(comment.createdAt) : "";
  const isEdited =
    comment.updatedAt &&
    comment.createdAt &&
    new Date(comment.updatedAt).getTime() -
      new Date(comment.createdAt).getTime() >
      1000;
  const netScore = (comment.upvoteCount ?? 0) - (comment.downvoteCount ?? 0);
  const netScoreClass =
    netScore > 0
      ? "text-green-600"
      : netScore < 0
        ? "text-red-600"
        : "text-base-content/60";

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
              {comment.username}
            </div>
            <div
              className="text-[11px] text-base-content/60 ml-2"
              title={createdAtTitle}
            >
              {rel}
              {isEdited ? " · edited" : ""}
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

        <div className="flex gap-2 items-center text-base-content/60">
          {!comment.isDeleted && (
            <div className="flex items-center gap-1">
              {isSignedIn && (
                <button
                  className={`btn btn-xs btn-ghost ${comment.currentUserVote === 1 ? "text-primary" : ""}`}
                  title="Upvote"
                  onClick={() =>
                    onVote?.(comment.id, comment.currentUserVote === 1 ? 0 : 1)
                  }
                >
                  <ArrowFatUp size={16} />
                </button>
              )}
              <span className={`text-xs font-semibold ${netScoreClass}`}>
                {netScore}
              </span>
              {isSignedIn && (
                <button
                  className={`btn btn-xs btn-ghost ${comment.currentUserVote === -1 ? "text-primary" : ""}`}
                  title="Downvote"
                  onClick={() =>
                    onVote?.(
                      comment.id,
                      comment.currentUserVote === -1 ? 0 : -1
                    )
                  }
                >
                  <ArrowFatDown size={16} />
                </button>
              )}
            </div>
          )}
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
          {!isSignedIn && !comment.isDeleted && depth < MAX_DEPTH && (
            <Link
              href="/auth/signin"
              className="btn btn-xs btn-ghost"
              title="Sign in to reply"
            >
              <Chat size={16} /> Reply
            </Link>
          )}
          {canEdit && (
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
                onVote={onVote}
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
