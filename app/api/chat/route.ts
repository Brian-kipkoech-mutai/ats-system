// import { google } from "@ai-sdk/google";
// import { streamText } from "ai";
// import { type NextRequest } from "next/server";
// import type { Candidate } from "@/lib/types/types";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: NextRequest) {
//   try {
//     const { query, candidates, stats } = await req.json();

//     if (!query || !candidates) {
//       return new Response(JSON.stringify({ error: "Missing required data" }), {
//         status: 400,
//       });
//     }

//     // Build recruiter-style prompt
//     const prompt = `
// You are ATS-Lite, a helpful AI assistant that helps recruiters find candidates.

// You should provide a friendly, professional summary of the search results. Include:
// 1. Brief acknowledgment of the query
// 2. Key statistics (count, average experience, top skills)
// 3. Highlight of top 2-3 candidates with their key strengths
// 4. Any notable insights about the candidate pool

// Keep it concise but informative. Use a conversational, professional tone. If no candidates are found, provide helpful suggestions.

// Query: "${query}"

// Search Results:
// - Found ${stats?.count || candidates.length} candidates
// - Average experience: ${stats?.avg_experience || "N/A"} years
// - Top skills: ${stats?.top_skills?.join(", ") || "Various skills"}

// ${
//   candidates.length > 0
//     ? `Top candidates:
// ${candidates
//   .slice(0, 3)
//   .map(
//     (c: Candidate, i: number) =>
//       `${i + 1}. ${c.full_name} - ${c.title} (${c.years_experience} years, ${
//         c.location
//       })
//    Skills: ${c.skills.split(";").slice(0, 4).join(", ")}
//    Salary: $${Number.parseInt(c.desired_salary_usd).toLocaleString()}`
//   )
//   .join("\n\n")}`
//     : "No candidates found matching the criteria."
// }
//     `;

//     // Use Gemini streaming
//     const result = streamText({
//       model: google("gemini-2.5-flash"),
//       prompt,
//     });

//     return result.toUIMessageStreamResponse(); // streams response back to client
//   } catch (error) {
//     console.error("Gemini ATS API error:", error);
//     return new Response(
//       JSON.stringify({
//         message:
//           "I encountered an error while generating the response. Please try your search again.",
//       }),
//       { status: 500 }
//     );
//   }
// }

 import { google } from "@ai-sdk/google";
 import { streamText, UIMessage, convertToModelMessages } from "ai";

 // Allow streaming responses up to 30 seconds
 export const maxDuration = 30;

 export async function POST(req: Request) {
   try {
     const { messages }: { messages: UIMessage[] } = await req.json();

     if (!messages || messages.length === 0) {
       return new Response(JSON.stringify({ error: "No messages provided" }), {
         status: 400,
         headers: { "Content-Type": "application/json" },
       });
     }

     const result = streamText({
       model: google("gemini-2.5-flash"),
       messages: convertToModelMessages(messages),
     });

     return result.toUIMessageStreamResponse();
   } catch (error: any) {
     console.error("Gemini API error:", error);

     return new Response(
       JSON.stringify({
         error: "Failed to fetch response from Gemini",
         details: error.message || error.toString(),
       }),
       {
         status: 500,
         headers: { "Content-Type": "application/json" },
       }
     );
   }
 }
