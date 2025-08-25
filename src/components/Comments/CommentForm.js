import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



export default function CommentForm({
  handleSubmit,
  submitLabel,
  hasCancelButton = false,
  initialText = "",
  handleCancel,
}) {
	const { data: session, status } = useSession();
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const isTextAreaDisabled = text.length === 0;

  const onSubmit = (event) => {
    event.preventDefault();

if (!session) {
      // Redirect to sign in if not logged in
      router.push("/auth/signin");
      return;
    }


    handleSubmit(text);
    setText("");
  };
  return (
    <form className="flex flex-col m-2" onSubmit={onSubmit}>
      <textarea
        className="bg-base-100 border border-base-300 rounded-lg p-2 text-sm outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button
        className="btn inline bg-red-600 text-white"
        disabled={!session && isTextAreaDisabled}
      >
        {submitLabel}
      </button>

      {hasCancelButton && (
        <button type="button" className="btn inline" onClick={handleCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
