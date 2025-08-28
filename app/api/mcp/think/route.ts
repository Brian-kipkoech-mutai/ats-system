import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

/**
 * Production-ready Next.js API route that:
 * - Uses a strict, expanded prompt to ask Gemini for a ThinkResponse JSON
 * - Validates the response with Zod (full schema covering CSV headers)
 * - Falls back to a safe default when validation fails
 *
 * Drop this file in /app/api/think/route.ts (or pages/api/think.ts for pages router)
 * and set process.env.GOOGLE_GENERATIVE_AI_API_KEY.
 */

// ----------------------
// Zod schemas (extended)
// ----------------------
const FilterIncludeSchema = z
  .object({
    skills: z.array(z.string()).optional(),
    title: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
    timezone: z.array(z.string()).optional(),
    experience_min: z.number().optional(),
    experience_max: z.number().optional(),
    work_preference: z.array(z.enum(["Remote", "Hybrid", "Onsite"])).optional(),
    willing_to_relocate: z.boolean().optional(),
    visa_status: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    education_level: z.array(z.string()).optional(),
    degree_major: z.array(z.string()).optional(),
    availability_weeks_max: z.number().optional(),
    availability_weeks_min: z.number().optional(),
    notice_period_weeks: z.number().optional(),
    notice_period_weeks_max: z.number().optional(),
    desired_salary_usd_min: z.number().optional(),
    desired_salary_usd_max: z.number().optional(),
    open_to_contract: z.boolean().optional(),
    remote_experience_min: z.number().optional(),
    citizenships: z.array(z.string()).optional(),
    summary_keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    last_active_within_days: z.number().optional(),
    roles: z.array(z.string()).optional(), // e.g., Frontend, Backend, DevOps...
  })
  .optional();

const FilterExcludeSchema = z
  .object({
    skills: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
    title: z.array(z.string()).optional(),
    visa_status: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    education_level: z.array(z.string()).optional(),
    degree_major: z.array(z.string()).optional(),
    citizenships: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    summary_keywords: z.array(z.string()).optional(),
  })
  .optional();

const FilterPlanSchema = z.object({
  include: FilterIncludeSchema,
  exclude: FilterExcludeSchema,
});

const RankingPlanSchema = z.object({
  primary: z.enum(["experience", "salary", "availability", "skills_match"]),
  tie_breakers: z
    .array(z.enum(["experience", "salary", "availability", "skills_match"]))
    .optional(),
  order: z.enum(["asc", "desc"]),
});

const ThinkResponseSchema = z.object({
  filter: FilterPlanSchema,
  rank: RankingPlanSchema,
});

// ----------------------
// Init Gemini client
// ----------------------
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY as string;
if (!API_KEY) {
  console.warn(
    "GOOGLE_GENERATIVE_AI_API_KEY not set. The API call will fail without it."
  );
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ----------------------
// CSV headers reference (for prompt)
// ----------------------
const csvHeaders = `id,full_name,title,location,timezone,years_experience,skills,languages,education_level,degree_major,availability_weeks,willing_to_relocate,work_preference,notice_period_weeks,desired_salary_usd,open_to_contract,remote_experience_years,visa_status,citizenships,summary,tags,last_active,linkedin_url`;

// ----------------------
// Improved prompt (strict; uses all CSV headers)
// ----------------------
function buildPrompt(query: string) {
  return `
You are an ATS (Applicant Tracking System) assistant.  Given a natural-language recruiter query, you MUST respond ONLY with a single JSON object that exactly follows the "ThinkResponse" schema described below. NO explanations, NO surrounding text, NO markdown fences — ONLY the JSON.

--- SCHEMA DEFINITIONS (use these fields ONLY) ---

FilterPlan:
{
  "include": {
    "skills": string[],
    "title": string[],
    "location": string[],
    "timezone": string[],
    "experience_min": number,
    "experience_max": number,
    "work_preference": ("Remote"|"Hybrid"|"Onsite")[],
    "willing_to_relocate": boolean,
    "visa_status": string[],
    "languages": string[],
    "education_level": string[],
    "degree_major": string[],
    "availability_weeks_max": number,
    "availability_weeks_min": number,
    "notice_period_weeks": number,
    "notice_period_weeks_max": number,
    "desired_salary_usd_min": number,
    "desired_salary_usd_max": number,
    "open_to_contract": boolean,
    "remote_experience_min": number,
    "citizenships": string[],
    "summary_keywords": string[],
    "tags": string[],
    "last_active_within_days": number,
    "roles": string[]
  },
  "exclude": {
    "skills": string[],
    "location": string[],
    "title": string[],
    "visa_status": string[],
    "languages": string[],
    "education_level": string[],
    "degree_major": string[],
    "citizenships": string[],
    "tags": string[],
    "summary_keywords": string[]
  }
}

RankingPlan:
{
  "primary": "experience" | "salary" | "availability" | "skills_match",
  "tie_breakers": ("experience" | "salary" | "availability" | "skills_match")[],
  "order": "asc" | "desc"
}

ThinkResponse:
{
  "filter": FilterPlan,
  "rank": RankingPlan
}

--- DATASET HEADERS (for reference) ---
${csvHeaders}

--- IMPORTANT RULES & PARSING SEMANTICS ---
1. Output MUST be valid JSON that conforms to the ThinkResponse schema. If you cannot parse a constraint, omit that field rather than invent one.
2. Skills: if the query mentions specific technologies (e.g., "React", "Java"), include ONLY those exact skills. If query mentions a general role (e.g., "backend"), map to the default technology list defined below.
3. title/location: treat as case-insensitive partial/sub-string matches. Use arrays for multiple values.
4. Numbers & ranges:
   - "5+ years" => experience_min: 5
   - "between 3 and 5 years" => experience_min: 3, experience_max: 5
   - "under 80k" or "below $80k" => desired_salary_usd_max: 80000
   - "80–120k" -> desired_salary_usd_min: 80000, desired_salary_usd_max: 120000
   - Recognize "k" / "K" suffix (e.g., "80k" = 80000)
   - If the query uses months for availability or notice, convert months -> weeks by multiplying by 4 and round up.
5. Salary currency: assume USD. If another currency is mentioned, do NOT attempt external conversion — parse numeric as USD unless user instructs conversion.
6. Notice period & availability:
   - "immediate" => availability_weeks_max: 0
   - "available in 2 weeks" => availability_weeks_max: 2
   - "notice period 1 month" => notice_period_weeks or notice_period_weeks_max: 4
7. Visa mapping:
   - "no visa required" / "does not need sponsorship" => visa_status: ["Citizen","Permanent Resident","Work Visa"]
   - "needs visa" / "requires sponsorship" => visa_status: ["Needs Sponsorship"]
8. Last active: "active in last 30 days" => last_active_within_days: 30
9. Remote experience: parse "2 years remote" -> remote_experience_min: 2
10. Roles → skill mapping (apply only when no explicit technologies appear):
   - Frontend: ["React","Vue","Angular","JavaScript","TypeScript","Next.js"]
   - Backend: ["Node.js","Spring","Java","C#","Go","Rust","Python","Kafka","RabbitMQ"]
   - DevOps: ["AWS","GCP","Azure","Kubernetes","Docker","Terraform"]
   - Full-Stack: ["React","Vue","Angular","Node.js","Spring","Python"]
   - Mobile: ["React Native","Flutter","iOS","Android"]
   - Data Scientist: ["Python","SQL","MongoDB","Kafka","Machine Learning"]
   - QA: ["Selenium","Cypress","Jest","Testing"]
11. Matching semantics summary:
   - skills & languages: exact match strings
   - title/location/summary_keywords/tags: case-insensitive partial match
12. Ranking decisions:
   - primary must be one of allowed enums. If user doesn't say, default to {"primary":"experience","order":"desc"}.
   - tie_breakers optional; include only allowed enums.
13. Do NOT include/return CSV-only fields like id, full_name, linkedin_url as filter criteria.
14. If contradictory constraints appear, prefer the more specific numeric constraint.
15. If the user mentions "contract" or "open to contract", set open_to_contract: true.
16. Output must not include extra keys beyond the schema.

--- EXAMPLES (exact JSON ONLY) ---
(Examples omitted here for brevity; follow the rules above when generating)

--- NOW: analyze the query below and return JSON ONLY that follows ThinkResponse schema ---
Query: "${query}"
`;
}

 
 
// ----------------------
// Helper: clean model output (comprehensive cleaning for Gemini responses)
// ----------------------
function cleanModelOutput(raw: string): string {
  let cleaned = raw.trim();
  
  // 1. Remove all non-printable characters that can break JSON parsing
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // 2. Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();
  
  // 3. Extract JSON from the response by finding the first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // 4. Remove any trailing commas or invalid characters after the JSON
  cleaned = cleaned.replace(/,\s*\]?\s*\}\s*[^}\]]*$/, '}');
  cleaned = cleaned.replace(/,\s*\}\s*[^}\]]*$/, '}');
  
  // 5. Final cleanup: remove any remaining trailing content after JSON
  cleaned = cleaned.replace(/\s*[^\}]*$/, '');
  
  return cleaned.trim();
}

// ----------------------
// POST handler
// ----------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body?.query;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const prompt = buildPrompt(query);

    // Call Gemini
    const result = await model.generateContent(prompt);
    // The SDK returns an object with `.response.text()` in our earlier usage pattern.
    // Keep the same access but defensively handle both .response.text() and .responseText
    let rawText: string;
    try {
      rawText = (await result.response.text()).toString();
    } catch {
      // fallback if SDK shape differs

      rawText = (result as any)?.responseText || JSON.stringify(result);
    }

    const cleaned = cleanModelOutput(rawText);
    console.log("Raw response from Gemini:", cleaned);

    let parsed: z.infer<typeof ThinkResponseSchema> | null = null;
    try {
      const json = JSON.parse(cleaned);
      parsed = ThinkResponseSchema.parse(json);
    } catch (err) {
      console.error("Failed to parse/validate Gemini response:", err);
    }

    if (!parsed) {
      // Safe fallback (valid shape)
      const fallback = {
        filter: { include: {} },
        rank: { primary: "experience" as const, order: "desc" as const },
      };
      return NextResponse.json(fallback);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Think API error:", error);
    const fallback = {
      filter: { include: {} },
      rank: { primary: "experience" as const, order: "desc" as const },
    };
    return NextResponse.json(fallback);
  }
}
