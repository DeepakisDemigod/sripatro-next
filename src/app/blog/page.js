import { getAllPosts } from "@/lib/getMetaData";
import Link from "next/link";

export const metadata = { title: "All Blog Posts | SriPatro" };

export default function GlobalBlogIndex() {
  // Get all posts regardless of locale then group
  const posts = getAllPosts();
  const grouped = posts.reduce((acc, p) => {
    const loc = p.meta.locale || "en";
    acc[loc] = acc[loc] || [];
    acc[loc].push(p.meta);
    return acc;
  }, {});

  const locales = Object.keys(grouped).sort();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-10">
        All Blog Posts
      </h1>
      {locales.length === 0 && (
        <p className="text-base-content/60">No posts yet.</p>
      )}
      <div className="space-y-12">
        {locales.map((locale) => (
          <section key={locale}>
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide text-base-content/70">
              {locale}
            </h2>
            <ul className="space-y-5">
              {grouped[locale].map((post) => (
                <li
                  key={post.slug}
                  className="border border-base-300 rounded-lg p-4 bg-base-100/70 hover:border-primary transition-colors"
                >
                  <Link href={`/${locale}/blog/${post.slug}`} className="block">
                    <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-base-content/60 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 items-center text-[11px] text-base-content/50">
                      {post.createdAt && (
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {post.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-base-200 text-base-content/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
