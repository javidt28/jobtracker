import { NextRequest, NextResponse } from "next/server";

const HTML_MAX_BYTES = 2 * 1024 * 1024; // 2MB – no artificial cap on description

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function extractMeta(html: string): {
  title?: string;
  description?: string;
  siteName?: string;
  location?: string;
} {
  const result: Record<string, string | undefined> = {};
  const ogTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);
  if (ogTitle) result.title = decodeHtmlEntities(ogTitle[1].trim());

  const ogDesc =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i) ??
    html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+property=["']og:description["']/i);
  if (ogDesc) result.description = decodeHtmlEntities(ogDesc[1].trim());

  const ogSite =
    html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:site_name["']/i);
  if (ogSite) result.siteName = decodeHtmlEntities(ogSite[1].trim());

  if (!result.title) {
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleTag) result.title = decodeHtmlEntities(titleTag[1].trim());
  }
  if (!result.description) {
    const metaDesc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ??
      html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i);
    if (metaDesc) result.description = decodeHtmlEntities(metaDesc[1].trim());
  }

  const locMeta =
    html.match(/<meta[^>]+property=["'](?:og:locale|job:location)["'][^>]+content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+name=["'](?:location|geo\.region)["'][^>]+content=["']([^"']*)["']/i);
  if (locMeta) result.location = decodeHtmlEntities(locMeta[1].trim());

  return result as { title?: string; description?: string; siteName?: string; location?: string };
}

type JobPostingLd = {
  "@type"?: string;
  title?: string;
  description?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: string | { addressLocality?: string; addressRegion?: string; addressCountry?: string }; addressLocality?: string };
  baseSalary?: {
    value?: { minValue?: number; maxValue?: number; unitText?: string };
    minValue?: number;
    maxValue?: number;
  };
};

function extractJsonLdJobPosting(html: string): Partial<{
  title: string;
  description: string;
  company: string;
  location: string;
  salary_min: number;
  salary_max: number;
}> {
  const result: Partial<{
    title: string;
    description: string;
    company: string;
    location: string;
    salary_min: number;
    salary_max: number;
  }> = {};
  const scriptMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scriptMatches) {
    try {
      const raw = match[1].trim();
      const json = JSON.parse(raw) as { "@graph"?: JobPostingLd[]; "@type"?: string } & JobPostingLd;
      const items: JobPostingLd[] = Array.isArray(json["@graph"])
        ? json["@graph"].filter((i) => i["@type"] === "JobPosting")
        : json["@type"] === "JobPosting"
          ? [json as JobPostingLd]
          : [];
      for (const job of items) {
        if (job.title) result.title = decodeHtmlEntities(String(job.title).trim());
        if (job.description) result.description = decodeHtmlEntities(String(job.description).trim());
        if (job.hiringOrganization?.name) result.company = decodeHtmlEntities(String(job.hiringOrganization.name).trim());
        const loc = job.jobLocation;
        if (loc) {
          if (typeof loc.address === "string") result.location = decodeHtmlEntities(loc.address.trim());
          else if (loc.address && typeof loc.address === "object") {
            const parts = [
              loc.address.addressLocality,
              loc.address.addressRegion,
              loc.address.addressCountry,
            ].filter(Boolean);
            if (parts.length) result.location = decodeHtmlEntities(parts.join(", "));
          } else if (loc.addressLocality) result.location = decodeHtmlEntities(String(loc.addressLocality).trim());
        }
        const sal = job.baseSalary;
        if (sal?.value) {
          const v = sal.value;
          if (typeof v.minValue === "number") result.salary_min = v.minValue;
          if (typeof v.maxValue === "number") result.salary_max = v.maxValue;
        } else if (sal && (typeof sal.minValue === "number" || typeof sal.maxValue === "number")) {
          if (typeof sal.minValue === "number") result.salary_min = sal.minValue;
          if (typeof sal.maxValue === "number") result.salary_max = sal.maxValue;
        }
        break;
      }
    } catch {
      // skip invalid JSON
    }
  }
  return result;
}

function inferSourceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("indeed.com")) return "Indeed";
    if (host.includes("greenhouse.io")) return "Greenhouse";
    if (host.includes("lever.co")) return "Lever";
    if (host.includes("workday.com")) return "Workday";
    if (host.includes("jobs.lever.co")) return "Lever";
    if (host.includes("boards.greenhouse.io")) return "Greenhouse";
    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = typeof body?.url === "string" ? body.url.trim() : "";
    if (!raw) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json({ error: "URL must be http or https" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.status}` },
        { status: 422 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL did not return HTML" },
        { status: 422 }
      );
    }

    const html = await res.text();
    if (html.length > HTML_MAX_BYTES) {
      return NextResponse.json(
        { error: "Page too large to process" },
        { status: 422 }
      );
    }

    const meta = extractMeta(html);
    const jsonLd = extractJsonLdJobPosting(html);
    const source = meta.siteName || inferSourceFromUrl(url.toString());

    const title = jsonLd.title || meta.title;
    const description = jsonLd.description || meta.description;
    const company = jsonLd.company || meta.siteName;
    const location = jsonLd.location || meta.location;

    return NextResponse.json({
      title: title || undefined,
      description: description || undefined,
      company: company || undefined,
      source: source || undefined,
      location: location || undefined,
      salary_min: jsonLd.salary_min ?? undefined,
      salary_max: jsonLd.salary_max ?? undefined,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out" }, { status: 408 });
      }
    }
    return NextResponse.json(
      { error: "Could not extract from URL" },
      { status: 500 }
    );
  }
}
