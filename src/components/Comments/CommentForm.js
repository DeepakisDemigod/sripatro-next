/*import { useState } from "react";

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
*/

import { useState } from "react";

export default function CommentForm({
  handleSubmit,
  submitLabel,
  hasCancelButton = false,
  initialText = "",
  handleCancel,
}) {
  const [text, setText] = useState(initialText);
  const isTextAreaDisabled = text.trim().length === 0;

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 mt-2">
      <textarea
        className="bg-base-100 border border-base-300 rounded text-xs p-2 w-full"
        placeholder="Write your comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="btn bg-red-600 text-base-800 rounded"
          disabled={isTextAreaDisabled}
        >
          {submitLabel}
        </button>

        {hasCancelButton && (
          <button
            type="button"
            className="btn bg-red-600 text-base-800 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
