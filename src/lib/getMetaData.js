import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIRS = [
  path.join(process.cwd(), "src", "posts"),
  path.join(process.cwd(), "content", "posts"),
];

export function getAllPostFiles() {
  const all = [];
  for (const dir of POSTS_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({ file: f, dir }));
    all.push(...files);
  }
  return all; // array of {file, dir}
}

function readFileMaybe(absPath) {
  try {
    return fs.readFileSync(absPath, "utf8");
  } catch {
    return null;
  }
}

export function getPostRaw(slug) {
  // First try direct filename match in any directory
  for (const { file, dir } of getAllPostFiles()) {
    const base = file.replace(/\.md$/, "");
    if (base === slug) {
      return readFileMaybe(path.join(dir, file));
    }
  }
  // Fallback: scan all files and match frontmatter slug
  for (const { file, dir } of getAllPostFiles()) {
    const abs = path.join(dir, file);
    const raw = readFileMaybe(abs);
    if (!raw) continue;
    try {
      const { data } = matter(raw);
      if (data.slug === slug) return raw;
    } catch {}
  }
  return null;
}

export function parsePost(fileContent) {
  if (!fileContent) return null;
  const { data, content } = matter(fileContent);
  return { meta: normalizeMeta(data), content };
}

function normalizeMeta(meta) {
  return {
    slug: meta.slug || "",
    locale: meta.locale || "en",
    title: meta.title || "Untitled",
    excerpt: meta.excerpt || "",
    coverImage: meta.coverImage || null,
    createdAt: meta.createdAt ? new Date(meta.createdAt).toISOString() : null,
    updatedAt: meta.updatedAt ? new Date(meta.updatedAt).toISOString() : null,
    published: meta.published !== false,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    author: meta.author || "Unknown",
  };
}

export function getAllPosts({ locale } = {}) {
  const entries = getAllPostFiles();
  const posts = entries
    .map(({ file, dir }) => {
      const raw = readFileMaybe(path.join(dir, file));
      if (!raw) return null;
      const { data, content } = matter(raw);
      const meta = normalizeMeta(data);
      if (!meta.slug) {
        // derive slug from filename if not provided
        meta.slug = file.replace(/\.md$/, "");
      }
      if (locale && meta.locale !== locale) return null;
      if (!meta.published) return null;
      return { meta, content };
    })
    .filter(Boolean);

  // newest first if createdAt available
  return posts.sort((a, b) =>
    (b.meta.createdAt || "").localeCompare(a.meta.createdAt || "")
  );
}

export function getPostBySlug(slug) {
  const raw = getPostRaw(slug);
  if (!raw) return null;
  return parsePost(raw);
}
