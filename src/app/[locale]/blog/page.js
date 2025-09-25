import Header from "@/components/Header";
import { getAllPosts } from "@/lib/getMetaData";
import BlogSubscribeForm from '@/components/BlogSubscribeForm';

export const metadata = {
  title: "Blog | SriPatro",
};

export default function BlogIndex({ params }) {
  const locale = params.locale || "en";
  const posts = getAllPosts({ locale }).map((p) => ({
    slug: p.meta.slug,
    title: p.meta.title,
    date: p.meta.createdAt,
    excerpt: p.meta.excerpt,
    tags: p.meta.tags,
  }));

  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8">
          SriPatro Blog
        </h1>
        {posts.length === 0 && (
          <p className="text-base-content/60">No posts yet.</p>
        )}
        <div className="my-8">
          <BlogSubscribeForm locale={locale} />
        </div>
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="group border-b border-base-200 pb-6">
              <a href={`/${locale}/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.date && (
                  <p className="text-xs mt-1 text-base-content/50">
                    {new Date(post.date).toLocaleDateString(locale, {
                      dateStyle: "medium",
                    })}
                  </p>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-sm text-base-content/70 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span key={t} className="badge badge-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
