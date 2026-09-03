import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}
const genAI = new GoogleGenerativeAI(apiKey);

const COMPANY_INFO = `
BSL Construction — Company Information

About:
BSL Construction is a London-based construction company specialising in renovation works and a wide range of building services. Over 15 years of hands-on experience, trusted by homeowners, landlords, and developers. We proudly serve areas across London (based in West London).

Contact:
Phone: 07378 412002
Email: info@bsl-construction.co.uk
Free in-home consultation available — fill out the contact form or call to schedule.

Pages:
Home: /
About: /about
Services: /services
Projects: /projects
Contact: /contact

Our process:
1. Consultation & Site Visit — understanding your goals and assessing the site.
2. Planning & Quotation — a detailed quote and timeline with full transparency, no vague promises.
3. Build & Project Management — experienced team manages every trade, keeps site safe and on schedule, regular client updates.
4. Completion & Aftercare — full walkthrough, sign-off only when client is 100% satisfied. All work comes with a 12-month guarantee.

What sets us apart:
Excellence in Delivery, Planning, Communication, and Results. We don't just build structures — we build long-term relationships based on trust and communication.

--- SERVICES WE OFFER ---

1. Construction & Refurbishment (core service)
- New Builds
- House Extensions
- Basement Conversions
- Loft Conversions
- Property Refurbishments
- Full Home Renovations

2. Mechanical Services
- Plumbing
- Heating
- Boilers
- Heat Pumps
- Underfloor Heating
- Unvented Cylinders
- Water Regulations
- RPZ Valve Testing

3. Commercial Maintenance
- Hotel Maintenance
- Planned Maintenance
- Reactive Maintenance
- Emergency Call-Outs
- Property Management
- Commercial Buildings

4. Air Conditioning
- Installation
- Servicing
- Repairs
- Domestic & Commercial

5. Gas Services
- Gas Safe registered work
- Boiler Installation & Servicing
- LPG
- Landlord Gas Safety Certificates (CP12)

6. Electrical Services
- Installations
- Rewiring
- Consumer Units
- EICR (Electrical Installation Condition Report)
- EIC (Electrical Installation Certificate)
- Fault Finding

7. Kitchens & Bathrooms
- Full kitchen and bathroom renovations

8. Roofing
- New Roofs
- Roof Repairs
- Flat Roofs

9. Landscaping
- Driveways
- Patios
- Fencing
- Garden Design

--- KEY SELLING POINTS ---
- Residential & Commercial Services
- Hotel Maintenance Contracts
- Qualified Professional Team
- Dedicated Site Supervisor
- Gas Safe Registered
- Vaillant Installer
- Worcester Bosch Installer
- Air Conditioning Specialists
- Complete Building Services
- Fully Insured

Note: BSL Construction handles emergency call-outs for maintenance and repair work, but does not currently advertise a dedicated 24/7 emergency callout line. For urgent matters, direct users to call 07378 412002 or use the contact form.
We cover all areas in London — ask the client for their location.
We handle all electrical and plumbing work.
`;

type PrimitiveRecord = Record<string, unknown>;

type Project = {
  title?: string;
  category?: string;
  location?: string;
  completedAt?: string;
  shortDescription?: string;
};

type Service = {
  title?: string;
  shortDescription?: string;
  description?: string;
};

type BlogPost = {
  title?: string;
  publishedAt?: string;
  excerpt?: string;
  shortDescription?: string;
};

type ProjectsApiResponse = { projects?: Project[] };
type ServicesApiResponse = { services?: Service[] };
type BlogsApiResponse = { posts?: BlogPost[] };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
};

type GeminiHistoryItem = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

function isObject(value: unknown): value is PrimitiveRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toProjectsResponse(data: unknown): ProjectsApiResponse {
  if (!isObject(data)) return {};
  const projectsRaw = data.projects;
  if (!Array.isArray(projectsRaw)) return {};

  const projects: Project[] = projectsRaw.map((item) => {
    if (!isObject(item)) return {};
    return {
      title: asString(item.title),
      category: asString(item.category),
      location: asString(item.location),
      completedAt: asString(item.completedAt),
      shortDescription: asString(item.shortDescription),
    };
  });

  return { projects };
}

function toServicesResponse(data: unknown): ServicesApiResponse {
  if (!isObject(data)) return {};
  const servicesRaw = data.services;
  if (!Array.isArray(servicesRaw)) return {};

  const services: Service[] = servicesRaw.map((item) => {
    if (!isObject(item)) return {};
    return {
      title: asString(item.title),
      shortDescription: asString(item.shortDescription),
      description: asString(item.description),
    };
  });

  return { services };
}

function toBlogsResponse(data: unknown): BlogsApiResponse {
  if (!isObject(data)) return {};
  const postsRaw = data.posts;
  if (!Array.isArray(postsRaw)) return {};

  const posts: BlogPost[] = postsRaw.map((item) => {
    if (!isObject(item)) return {};
    return {
      title: asString(item.title),
      publishedAt: asString(item.publishedAt),
      excerpt: asString(item.excerpt),
      shortDescription: asString(item.shortDescription),
    };
  });

  return { posts };
}

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const h = await headers();
  const host = h.get("host");
  if (!host) {
    throw new Error("Unable to determine host from request headers.");
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function safeFetchJson<T>(url: string, parser: (data: unknown) => T): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    return parser(data);
  } catch {
    return null;
  }
}

async function getSiteContext(): Promise<string> {
  const base = await getBaseUrl();

  const [projectsData, servicesData, blogData] = await Promise.all([
    safeFetchJson(`${base}/api/projects`, toProjectsResponse),
    safeFetchJson(`${base}/api/services`, toServicesResponse),
    safeFetchJson(`${base}/api/blogs`, toBlogsResponse),
  ]);

  const projects = projectsData?.projects ?? [];
  const services = servicesData?.services ?? [];
  const posts = blogData?.posts ?? [];

  const projectsText = projects
    .map(
      (p) =>
        `- "${p.title ?? "Untitled"}" (${p.category ?? "category n/a"}, ${
          p.location ?? "location n/a"
        }, completed ${p.completedAt ?? "n/a"}): ${p.shortDescription ?? ""}`
    )
    .join("\n");

  const servicesText = services
    .map((s) => `- "${s.title ?? "Untitled"}": ${s.shortDescription ?? s.description ?? ""}`)
    .join("\n");

  const blogText = posts
    .map(
      (b) =>
        `- "${b.title ?? "Untitled"}" (${b.publishedAt ?? "date n/a"}): ${
          b.excerpt ?? b.shortDescription ?? ""
        }`
    )
    .join("\n");

  return `${COMPANY_INFO}

--- SERVICES ---
${servicesText || "No services listed."}

--- PROJECTS ---
${projectsText || "No projects listed."}

--- BLOG POSTS ---
${blogText || "No blog posts listed."}`;
}

const SYSTEM_INSTRUCTION_TEMPLATE = (siteContext: string) => `You are a Q&A assistant embedded on the BSL Construction website.

ONLY answer using the information below — about BSL Construction's company info, services, projects, and blog posts.
Do not answer general knowledge questions, questions about other companies, or anything unrelated to this website.
If someone asks about a blog post topic, summarize from the excerpt provided; don't invent details not given.
If the answer isn't in the information provided, say you don't have that information and suggest they call 07378 412002 or use the contact form at /contact.
Keep answers short and specific.

--- SITE INFORMATION ---
${siteContext}
--- END SITE INFORMATION ---`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(err: unknown): boolean {
  if (!isObject(err)) return false;
  const status = err.status;
  return status === 429 || status === 503;
}

async function sendWithRetry(
  siteContext: string,
  history: GeminiHistoryItem[],
  latest: string
): Promise<string> {
  const models = ["gemini-3.6-flash", "gemini-3.5-flash-lite"]; // primary, then fallback
  const maxRetriesPerModel = 2;

  for (const modelName of models) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION_TEMPLATE(siteContext),
    });

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(latest);
        return result.response.text();
      } catch (err: unknown) {
        const retryable = isRetryableGeminiError(err);
        const isLastAttempt = attempt === maxRetriesPerModel;

        if (!retryable) {
          throw err;
        }

        if (isLastAttempt) {
          break; // try next model
        }

        await sleep(500 * 2 ** attempt);
      }
    }
  }

  throw new Error("All models unavailable after retries.");
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isObject(value)) return false;
  const role = value.role;
  const content = value.content;
  return (role === "user" || role === "assistant") && typeof content === "string";
}

function toChatRequestBody(value: unknown): ChatRequestBody | null {
  if (!isObject(value)) return null;
  const messages = value.messages;
  if (!Array.isArray(messages)) return null;
  if (!messages.every(isChatMessage)) return null;
  return { messages };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody: unknown = await req.json();
    const body = toChatRequestBody(rawBody);

    if (!body || body.messages.length === 0) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const siteContext = await getSiteContext();

    const history: GeminiHistoryItem[] = body.messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const latest = body.messages[body.messages.length - 1]?.content;
    if (!latest) {
      return NextResponse.json({ error: "Missing latest message content." }, { status: 400 });
    }

    const reply = await sendWithRetry(siteContext, history, latest);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        error:
          "Our chat assistant is temporarily busy. Please try again in a moment, or call 07378 412002.",
      },
      { status: 503 }
    );
  }
}