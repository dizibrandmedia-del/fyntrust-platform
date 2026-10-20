import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, User, ArrowLeft, Share2, PhoneCall } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
  });

  if (!blog) return { title: "Article Not Found | Fyntrust" };

  return {
    title: `${blog.metaTitle || blog.title} | Fyntrust`,
    description: blog.metaDescription || blog.excerpt,
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
  });

  if (!blog) {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-8 max-w-4xl mx-auto space-y-10 font-body">
      {/* Back Link */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-fyn-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-fyn-slate-border pb-8">
        <Badge variant="primary">{blog.category}</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-fyn-slate-muted pt-2">
          <div className="flex items-center gap-1.5 font-medium text-fyn-slate">
            <User className="w-4 h-4 text-fyn-primary" />
            <span>Author: {blog.authorName || "Fyntrust CA Advisory Desk"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-fyn-primary" />
            <span>
              Published on{" "}
              {new Date(blog.publishedAt || new Date()).toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <article className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-fyn-slate space-y-6">
        {blog.content.split("\n\n").map((paragraph, idx) => {
          if (paragraph.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-xl font-bold font-heading text-fyn-slate pt-4">
                {paragraph.replace("### ", "")}
              </h3>
            );
          }
          if (paragraph.startsWith("- ")) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-fyn-slate-muted">
                {paragraph.split("\n").map((line, liIdx) => (
                  <li key={liIdx}>{line.replace("- ", "")}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={idx} className="text-xs sm:text-sm text-fyn-slate leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </article>

      {/* Advisory Callout */}
      <div className="p-8 rounded-3xl bg-[#01574F] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-heading">Need Personalized Guidance on This Topic?</h3>
          <p className="text-xs text-white/80">Connect with our senior Chartered Accountants and tax consultants.</p>
        </div>
        <Link href="/contact">
          <Button variant="accent" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
            Talk to an Expert
          </Button>
        </Link>
      </div>
    </div>
  );
}
