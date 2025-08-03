import { useState } from "react";

export default function CommentForm({
  handleSubmit,
  submitLabel,
  hasCancelButton = false,
  initialText = "",
  handleCancel,
}) {
  const [text, setText] = useState(initialText);
  const isTextAreaDisabled = text.length === 0;

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit(text);
    setText("");
  };
  return (
    <form className="flex flex-col m-2" onSubmit={onSubmit}>
      <textarea
        className="bg-base-100 border border-base-300 rounded p-2 text-sm ouline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button
        className="btn inline bg-red-600 text-white"
        disabled={isTextAreaDisabled}
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
