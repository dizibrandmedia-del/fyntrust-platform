import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ name: "Home", url: "/" }, ...items];
  const schema = generateBreadcrumbSchema(allItems);

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className={`flex items-center space-x-1.5 text-xs text-fyn-slate-muted ${className}`}>
        <Link href="/" className="hover:text-fyn-primary flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Home</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.url}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-fyn-slate truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-fyn-primary transition-colors truncate max-w-[150px]">
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
