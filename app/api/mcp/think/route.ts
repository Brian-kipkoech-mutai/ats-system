import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

//  Schema definitions
const FilterPlanSchema = z.object({
  include: z
    .object({
      skills: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
      experience_min: z.number().optional(),
      experience_max: z.number().optional(),
      work_preference: z.array(z.string()).optional(),
      willing_to_relocate: z.boolean().optional(),
      visa_status: z.array(z.string()).optional(),
    })
    .optional(),
  exclude: z
    .object({
      skills: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
      visa_status: z.array(z.string()).optional(),
    })
    .optional(),
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

// Init Gemini (im  using this llm becouse its free 😏 )
const API_KEY = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const csvHeaders = `id,full_name,title,location,timezone,years_experience,skills,languages,education_level,degree_major,availability_weeks,willing_to_relocate,work_preference,notice_period_weeks,desired_salary_usd,open_to_contract,remote_experience_years,visa_status,citizenships,summary,tags,last_active,linkedin_url`;

    const prompt = `
You are an ATS (Applicant Tracking System) that helps recruiters find candidates. 

Given a natural language query, respond ONLY with a JSON object containing filter and ranking plans that follow this schema.

CSV Headers: ${csvHeaders}

Filter Plan Rules:
- include: criteria candidates MUST match
- exclude: criteria candidates must NOT match
- skills: array of skill keywords (case-insensitive, partial match)
- location: array of location keywords (case-insensitive, partial match)
- experience_min/max: years of experience range
- work_preference: ["Remote", "Hybrid", "Onsite"]
- willing_to_relocate: boolean
- visa_status: ["No Sponsorship Required", "Needs Sponsorship", "Has Work Permit"]

Ranking Plan Rules:
- primary: main sorting criteria
- tie_breakers: additional criteria for ties
- order: "asc" (lowest first) or "desc" (highest first)
- Available criteria: "experience", "salary", "availability", "skills_match"

Examples:
Query: "Backend engineers in Germany, most experience first"
Response: {
  "filter": { "include": { "skills": ["backend","server","api"], "location": ["germany"] }},
  "rank": { "primary": "experience", "order": "desc" }
}

Query: "Frontend developers willing to relocate, lowest salary first"
Response: {
  "filter": { "include": { "skills": ["frontend","react","vue","angular"], "willing_to_relocate": true }},
  "rank": { "primary": "salary", "order": "asc" }
}

Query: "Remote React developers with 5+ years experience"
Response: {
  "filter": { "include": { "skills": ["react"], "work_preference": ["remote"], "experience_min": 5 }},
  "rank": { "primary": "experience", "order": "desc" }
}

Now analyze this query and return JSON only.
Query: "${query}"
`;

    //  Ask Gemini
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    let cleaned = rawText.trim();

    // remove ```json or ``` if present
    cleaned = cleaned
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
    let object;
    try {
      console.log("Raw response from Gemini:", cleaned);
      object = ThinkResponseSchema.parse(JSON.parse(cleaned));
    } catch (err) {
      console.error("Schema validation failed:", err, "Raw:", cleaned);
      object = {
        filter: { include: {} },
        rank: { primary: "experience", order: "desc" },
      };
    }

    return NextResponse.json(object);
  } catch (error) {
    console.error("Think API error:", error);

    const fallbackResponse = {
      filter: { include: {} },
      rank: { primary: "experience" as const, order: "desc" as const },
    };

    return NextResponse.json(fallbackResponse);
  }
}
