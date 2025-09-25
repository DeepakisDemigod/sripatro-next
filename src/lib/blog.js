import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

export function getPostLocales() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory());
}

export function getPosts(locale = 'en') {
  const localeDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) return [];
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const fullPath = path.join(localeDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      if (data.published === false) return null;
      const slug = data.slug || file.replace(/\.md$/, '');
      return {
        slug,
        ...data,
        content,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug, locale = 'en') {
  const localeDir = path.join(CONTENT_DIR, locale);
  const target = ['.md'].map((ext) => path.join(localeDir, slug + ext)).find((p) => fs.existsSync(p));
  if (!target) return null;
  const fileContents = fs.readFileSync(target, 'utf8');
  const { data, content } = matter(fileContents);
  return { slug, ...data, content };
}

export async function renderMarkdown(markdown) {
  const processed = await remark().use(gfm).use(html).process(markdown);
  return processed.toString();
}
