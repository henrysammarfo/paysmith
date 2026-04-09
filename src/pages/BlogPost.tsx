import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { blogPosts } from "./Blog";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  // Simple markdown-like rendering for the content
  const renderContent = (content: string) => {
    return content
      .trim()
      .split("\n\n")
      .map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-2xl font-semibold mt-8 mb-4">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xl font-semibold mt-6 mb-3">
              {trimmed.replace("### ", "")}
            </h3>
          );
        }
        if (trimmed.startsWith("```")) {
          const code = trimmed.replace(/```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i} className="bg-secondary/50 border border-border rounded-xl p-4 text-sm font-mono overflow-x-auto my-4">
              <code>{code}</code>
            </pre>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- "));
          return (
            <ul key={i} className="space-y-2 my-4">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^- /, "")) }} />
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\./.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => /^\d+\./.test(l.trim()));
          return (
            <ol key={i} className="space-y-2 my-4 list-decimal list-inside">
              {items.map((item, j) => (
                <li key={j} className="text-muted-foreground">
                  <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s*/, "")) }} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="text-muted-foreground leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <article className="max-w-3xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} /> All posts
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-3 py-1">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> {post.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">{post.title}</h1>

        <div className="prose-custom">{renderContent(post.content)}</div>
      </article>
      <Footer />
    </div>
  );
};

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-secondary/50 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
}

export default BlogPost;
