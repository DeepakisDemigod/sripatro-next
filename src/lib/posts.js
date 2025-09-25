import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
}

export function getAllPostsMeta() {
  const files = getPostSlugs();
  const posts = files.map((filename) => {
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug: data.slug || filename.replace(/\.md$/, ""),
      title: data.title || "Untitled",
      description: data.description || "",
      date: data.date || null,
      author: data.author || "Unknown",
      tags: data.tags || [],
    };
  });
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getPostBySlug(slug) {
  const target = [slug + ".md", slug].find((candidate) =>
    fs.existsSync(path.join(postsDirectory, candidate))
  );
  if (!target) return null;
  const fullPath = path.join(postsDirectory, target);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();
  return {
    slug: data.slug || slug,
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || null,
    author: data.author || "Unknown",
    tags: data.tags || [],
    contentHtml,
  };
}
