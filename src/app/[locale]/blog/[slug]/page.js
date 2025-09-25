import Header from "@/components/Header";
import Markdown from "markdown-to-jsx";
import { getAllPosts, getPostBySlug } from "@/lib/getMetaData";

export async function generateStaticParams({ params }) {
  // params.locale provided at build, fallback to en
  const locale = params?.locale || "en";
  const posts = getAllPosts({ locale });
  return posts.map((p) => ({ slug: p.meta.slug }));
}

export default function BlogPost({ params }) {
  const { slug, locale } = params;
  const post = getPostBySlug(slug);
  if (!post || post.meta.locale !== locale) {
    // You could return notFound() here
    return <div className="px-4 py-20 text-center">Post not found.</div>;
  }

  const { meta, content } = post;

  return (
    <div>
      <Header />
      <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-2 text-3xl font-extrabold">{meta.title}</h1>
        <div className="text-xs text-base-content/50 mb-6 flex flex-wrap gap-3 items-center">
          {meta.createdAt && (
            <span>{new Date(meta.createdAt).toLocaleDateString(locale)}</span>
          )}
          {meta.tags && meta.tags.length > 0 && (
            <span className="flex flex-wrap gap-2">
              {meta.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-base-200 text-[10px] tracking-wide uppercase"
                >
                  {t}
                </span>
              ))}
            </span>
          )}
        </div>
        <Markdown
          options={{
            forceBlock: true,
            overrides: {
              table: { props: { className: "table table-zebra w-full my-6" } },
              code: {
                props: { className: "bg-base-200 px-1 py-0.5 rounded text-sm" },
              },
            },
          }}
        >
          {content}
        </Markdown>
      </article>
    </div>
  );
}
