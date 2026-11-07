
import { supabase } from "./supabase";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: Record<string, any>;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Could not fetch published articles:", error.message);
    throw new Error("Unable to load published articles.");
  }

  return (data ?? []) as Article[];
}

export async function getPublishedArticleBySlug(
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) {
    console.error("Could not fetch article:", error.message);
    throw new Error("Unable to load article.");
  }

  return (data ?? null) as Article | null;
}
