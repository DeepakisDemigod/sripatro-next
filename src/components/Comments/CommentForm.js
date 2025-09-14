"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar, { genConfig } from "react-nice-avatar";
import Link from "next/link";

export default function CommentForm({
  handleSubmit,
  submitLabel,
  hasCancelButton = false,
  initialText = "",
  handleCancel,
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const MAX_LENGTH = 800;

  const userSeed =
    session?.user?.id || session?.user?.email || session?.user?.name || "guest";
  const avatarConfig = useMemo(() => genConfig({ seed: userSeed }), [userSeed]);

  const isDisabled = !text.trim().length || loading;

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isDisabled) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!text.trim()) return;
    try {
      setLoading(true);
      const maybePromise = handleSubmit(text.trim());
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
      setText("");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="m-2">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-base-content/80">
                Sign in to join the discussion.
              </div>
              <Link href="/auth/signin" className="btn btn-primary btn-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="m-2" onSubmit={onSubmit}>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <Avatar style={{ width: 32, height: 32 }} {...avatarConfig} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <label className="label p-0">
                  <span className="label-text text-sm">Add a comment</span>
                </label>
                <span
                  className={`text-[11px] ${text.length > MAX_LENGTH - 20 ? "text-error" : "text-base-content/60"}`}
                >
                  {text.length}/{MAX_LENGTH}
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full text-sm min-h-[80px]"
                value={text}
                maxLength={MAX_LENGTH}
                placeholder="Share your thoughts…"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Comment"
              ></textarea>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={isDisabled}
                  type="submit"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  <span className={loading ? "ml-1" : ""}>
                    {submitLabel || "Post"}
                  </span>
                </button>
                {hasCancelButton && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
                {text.trim().length > 0 && (
                  <span className="ml-auto text-[11px] text-base-content/60">
                    Press Ctrl+Enter to post
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
