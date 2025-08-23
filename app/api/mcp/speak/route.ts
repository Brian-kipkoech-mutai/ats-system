import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Candidate } from "@/lib/types/types";

// Initialize Gemini client
const API_KEY = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(request: NextRequest) {
  try {
    const { query, candidates, stats } = await request.json();

    if (!query || !candidates) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const prompt = `
You are ATS-Lite, a helpful AI assistant that helps recruiters find candidates. 

You should provide a friendly, professional summary of the search results. Include:
1. Brief acknowledgment of the query
2. Key statistics (count, average experience, top skills)
3. Highlight of top 2-3 candidates with their key strengths
4. Any notable insights about the candidate pool

Keep it concise but informative. Use a conversational, professional tone. If no candidates are found, provide helpful suggestions.

Query: "${query}"

Search Results:
- Found ${stats?.count || candidates.length} candidates
- Average experience: ${stats?.avg_experience || "N/A"} years
- Top skills: ${stats?.top_skills?.join(", ") || "Various skills"}

${
  candidates.length > 0
    ? `Top candidates:
${candidates
  .slice(0, 3)
  .map(
    (c: Candidate, i: number) =>
      `${i + 1}. ${c.full_name} - ${c.title} (${c.years_experience} years, ${
        c.location
      })
   Skills: ${c.skills.split(";").slice(0, 4).join(", ")}
   Salary: $${Number.parseInt(c.desired_salary_usd).toLocaleString()}`
  )
  .join("\n\n")}`
    : "No candidates found matching the criteria."
}
    `;

    const result = await model.generateContent(prompt);

    return NextResponse.json({ message: result.response.text() });
  } catch (error) {
    console.error("Speak API error:", error);

    const fallbackMessage =
      "I encountered an error while generating the response. Please try your search again.";

    return NextResponse.json({ message: fallbackMessage });
  }
}
