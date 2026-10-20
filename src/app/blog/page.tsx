import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tax, Compliance & Business Advisory Blog | Fyntrust",
  description: "Stay ahead of regulatory changes with practical insights on GST, Income Tax, ROC compliance, and Virtual CFO management.",
};

export default async function BlogIndexPage() {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-16 py-12 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Insights & Analysis</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          Tax, Accounting & Statutory Compliance Knowledge
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Expert articles, regulatory updates, and actionable financial advice written by our senior
          Chartered Accountants and legal partners.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-fyn-slate-border shadow-sm hover:border-fyn-primary hover:shadow-xl transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-fyn-slate-muted">
                <Badge variant="accent" size="sm">
                  {blog.category}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-fyn-primary" />
                  <span>
                    {new Date(blog.publishedAt || new Date()).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors leading-snug">
                {blog.title}
              </h2>

              <p className="text-xs text-fyn-slate-muted leading-relaxed line-clamp-3">
                {blog.excerpt}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-fyn-primary">
              <span className="text-fyn-slate-muted font-normal text-[11px]">
                By {blog.authorName || "Fyntrust Editorial Desk"}
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Full Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
