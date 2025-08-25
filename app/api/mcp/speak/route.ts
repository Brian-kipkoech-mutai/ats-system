 import { google } from "@ai-sdk/google";
 import { streamText, UIMessage, convertToModelMessages } from "ai";
 import type { Candidate } from "@/lib/types/types";

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

     const lastMessage = messages[messages.length - 1];
     if (
       lastMessage.role === "user" &&
       Array.isArray(lastMessage.parts) &&
       lastMessage.parts[0]?.type === "text"
     ) {
       const jsonText = lastMessage.parts[0].text;
       let speakPayload;
       try {
         speakPayload = JSON.parse(jsonText);
       } catch {
         return new Response(
           JSON.stringify({ error: "Invalid JSON in message" }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }

       const { candidates, stats } = speakPayload;

       const systemPrompt = `
You are ATS-Lite, a helpful AI assistant that helps recruiters find candidates. 

You should provide a friendly, professional summary of the search results. Include:
1. Brief acknowledgment of the query
2. Key statistics (count, average experience, top skills)
3. Highlight of top 2-3 candidates with their key strengths and their LinkedIn profiles
4. Any notable insights about the candidate pool


Keep it concise but informative. Use a conversational, professional tone. If no candidates are found, provide helpful suggestions.

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
   Salary: $${Number.parseInt(c.desired_salary_usd).toLocaleString()}
   LinkedIn profile link: ${c.linkedin_url}
   `
  )
  .join("\n\n")}`
    : "No candidates found matching the criteria."
}
`;

       const result = streamText({
         model: google("gemini-2.5-flash"),
         messages: [
           { role: "system", content: systemPrompt },
           ...convertToModelMessages(messages),
         ],
       });

       return result.toUIMessageStreamResponse();
     }

     return new Response(
       JSON.stringify({ error: "No valid user message found" }),
       { status: 400, headers: { "Content-Type": "application/json" } }
     );
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