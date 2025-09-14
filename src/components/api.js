export const getComments = async (path) => {
  const res = await fetch(`/api/comments?path=${encodeURIComponent(path)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load comments");
  const data = await res.json();
  return data.comments || [];
};

export const createComment = async (text, parentId = null, path) => {
  const res = await fetch(`/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ page: path, parentId, body: text }),
  });
  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {}
    const err = new Error(payload?.error || "Failed to create comment");
    err.status = res.status;
    err.data = payload;
    throw err;
  }
  const data = await res.json();
  return data;
};

export const updateComment = async (text, id) => {
  const res = await fetch(`/api/comments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ body: text }),
  });
  if (!res.ok) throw new Error("Failed to update comment");
  return await res.json();
};

export const deleteComment = async (id) => {
  const res = await fetch(`/api/comments/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return await res.json();
};

export const voteComment = async (id, value) => {
  const res = await fetch(`/api/comments/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Failed to vote");
  return await res.json();
};
