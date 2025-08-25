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
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY as string;
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
Given a natural language query, respond ONLY with a JSON object containing filter and ranking plans.

CSV Headers: ${csvHeaders}

Role-to-Technology Mapping Rules:
- For specific technologies mentioned (e.g., "Java", "React"), include ONLY those exact skills
- For general roles WITHOUT specific technologies, use these mappings:
  • Frontend: React, Vue, Angular, JavaScript, TypeScript, Next.js
  • Backend: Node.js, Spring, Java, C#, Go, Rust, Python, Kafka, RabbitMQ
  • DevOps: AWS, GCP, Azure, Kubernetes, Docker, Terraform
  • Full-Stack: React, Vue, Angular, Node.js, Spring, Python
  • Mobile: React Native, Flutter, iOS, Android
  • Data Scientist: Python, SQL, MongoDB, Kafka, Machine Learning
  • QA: Selenium, Cypress, Jest, Testing

Visa Status Interpretation:
- "no visa required", "does not need sponsorship" → include visa_status: ["Citizen", "Permanent Resident", "Work Visa"]
- "needs visa", "requires sponsorship" → include visa_status: ["Needs Sponsorship"]

Filter Plan Rules:
- If query mentions specific technologies, use ONLY those (e.g., "Java dev" → skills: ["Java"])
- If query mentions general roles without specific tech, use the mapping above
- include: criteria candidates MUST match
- skills: array of exact technology names from CSV
- location: array of location keywords (case-insensitive partial match)
- experience_min/max: years of experience range
- work_preference: ["Remote", "Hybrid", "Onsite"]
- willing_to_relocate: boolean
- visa_status: ["Citizen", "Permanent Resident", "Work Visa", "Needs Sponsorship"]

Ranking Plan Rules:
- primary: main sorting criteria ("experience", "salary", "availability", "skills_match")
- tie_breakers: additional criteria for breaking ties
- order: "asc" (lowest first) or "desc" (highest first)

Examples:
Query: "java backend dev with 5+ years experience"
Response: {
  "filter": { 
    "include": { 
      "skills": ["Java"],
      "experience_min": 5
    } 
  },
  "rank": { "primary": "experience", "order": "desc" }
}

Query: "backend engineers"  // No specific tech mentioned
Response: {
  "filter": { 
    "include": { 
      "skills": ["Node.js", "Spring", "Java", "C#", "Go", "Rust", "Python", "Kafka", "RabbitMQ"]
    } 
  },
  "rank": { "primary": "experience", "order": "desc" }
}

Query: "spring java developers"
Response: {
  "filter": { 
    "include": { 
      "skills": ["Spring", "Java"]
    } 
  },
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
