 import type { Candidate, FilterPlan, RankingPlan } from "./types/types";

 // This will hold our candidates data
 let candidatesData: Candidate[] = [];

 export async function loadCandidatesData(): Promise<Candidate[]> {
   if (candidatesData.length > 0) {
     return candidatesData;
   }

   try {
     const response = await fetch(
       "https://ozhlzg48cixm37f6.public.blob.vercel-storage.com/candidates.csv"
     );
     const csvText = await response.text();

     const lines = csvText.trim().split("\n");
     const headers = lines[0].split(",");

     candidatesData = lines.slice(1).map((line) => {
       const values = parseCSVLine(line);
       const candidate: any = {};

       headers.forEach((header, i) => {
         candidate[header.trim()] = values[i]?.trim() || "";
       });

       return candidate as Candidate;
     });

     return candidatesData;
   } catch (error) {
     console.error("Failed to load candidates data:", error);
     return [];
   }
 }

 function parseCSVLine(line: string): string[] {
   const result = [];
   let current = "";
   let inQuotes = false;

   for (let i = 0; i < line.length; i++) {
     const char = line[i];

     if (char === '"') {
       inQuotes = !inQuotes;
     } else if (char === "," && !inQuotes) {
       result.push(current);
       current = "";
     } else {
       current += char;
     }
   }

   result.push(current);
   return result;
 }

 export function getCandidatesData(): Candidate[] {
   return candidatesData;
 }

 /**
  * Filter candidates based on a filter plan.
  * @param plan Filter plan
  * @param candidates Optional injected candidates list (for testing)
  */
 export function filterCandidates(
   plan: FilterPlan,
   candidates: Candidate[] = getCandidatesData()
 ): Candidate[] {
   return candidates.filter((candidate) => {
     // Apply include filters
     if (plan.include) {
       if (plan.include.skills?.length) {
         const candidateSkills = candidate.skills
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasRequiredSkill = plan.include.skills.some((skill) =>
           candidateSkills.some((cs) => cs.includes(skill.toLowerCase()))
         );
         if (!hasRequiredSkill) return false;
       }

       if (plan.include.location?.length) {
         const hasLocation = plan.include.location.some((loc) =>
           candidate.location.toLowerCase().includes(loc.toLowerCase())
         );
         if (!hasLocation) return false;
       }

       const experience = Number.parseInt(candidate.years_experience) || 0;
       if (
         plan.include.experience_min &&
         experience < plan.include.experience_min
       )
         return false;
       if (
         plan.include.experience_max &&
         experience > plan.include.experience_max
       )
         return false;

       if (plan.include.work_preference?.length) {
         const hasWorkPref = plan.include.work_preference.some((pref) =>
           candidate.work_preference.toLowerCase().includes(pref.toLowerCase())
         );
         if (!hasWorkPref) return false;
       }

       if (plan.include.willing_to_relocate !== undefined) {
         const isWilling =
           candidate.willing_to_relocate.toLowerCase() === "yes";
         if (plan.include.willing_to_relocate !== isWilling) return false;
       }

       if (plan.include.visa_status?.length) {
         const hasVisaStatus = plan.include.visa_status.some((status) =>
           candidate.visa_status.toLowerCase().includes(status.toLowerCase())
         );
         if (!hasVisaStatus) return false;
       }
     }

     // Apply exclude filters
     if (plan.exclude) {
       if (plan.exclude.skills?.length) {
         const candidateSkills = candidate.skills
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasExcludedSkill = plan.exclude.skills.some((skill) =>
           candidateSkills.some((cs) => cs.includes(skill.toLowerCase()))
         );
         if (hasExcludedSkill) return false;
       }

       if (plan.exclude.location?.length) {
         const hasExcludedLocation = plan.exclude.location.some((loc) =>
           candidate.location.toLowerCase().includes(loc.toLowerCase())
         );
         if (hasExcludedLocation) return false;
       }

       if (plan.exclude.visa_status?.length) {
         const hasExcludedVisaStatus = plan.exclude.visa_status.some((status) =>
           candidate.visa_status.toLowerCase().includes(status.toLowerCase())
         );
         if (hasExcludedVisaStatus) return false;
       }
     }

     return true;
   });
 }

 /**
  * Rank candidates by scoring logic
  */
 export function rankCandidates(
   candidateIds: string[],
   plan: RankingPlan,
   candidates: Candidate[] = getCandidatesData()
 ): Candidate[] {
   const filteredCandidates = candidates.filter((c) =>
     candidateIds.includes(c.id)
   );

   const scoredCandidates = filteredCandidates.map((candidate) => ({
     candidate,
     scores: calculateCandidateScores(candidate, plan),
   }));

   scoredCandidates.sort((a, b) => {
     const primaryDiff =
       plan.order === "desc"
         ? b.scores[plan.primary] - a.scores[plan.primary]
         : a.scores[plan.primary] - b.scores[plan.primary];

     if (primaryDiff !== 0) return primaryDiff;

     if (plan.tie_breakers) {
       for (const tieBreaker of plan.tie_breakers) {
         const tieDiff =
           plan.order === "desc"
             ? b.scores[tieBreaker] - a.scores[tieBreaker]
             : a.scores[tieBreaker] - b.scores[tieBreaker];

         if (tieDiff !== 0) return tieDiff;
       }
     }

     return 0;
   });

   return scoredCandidates.map((sc) => sc.candidate);
 }

 function calculateCandidateScores(
   candidate: Candidate,
   plan: RankingPlan
 ): Record<string, number> {
   const scores: Record<string, number> = {};

   scores.experience = Number.parseInt(candidate.years_experience) || 0;

   const salary = Number.parseInt(candidate.desired_salary_usd) || 0;
   scores.salary = Math.min(salary / 1000, 500);

   const availabilityWeeks =
     Number.parseInt(candidate.availability_weeks) || 52;
   scores.availability = Math.max(0, 52 - availabilityWeeks);

   const skillCount = candidate.skills
     .split(";")
     .filter((s) => s.trim()).length;
   scores.skills_match = skillCount;

   return scores;
 }

 /**
  * Aggregate stats for candidates
  */
 export function aggregateStats(
   candidateIds: string[],
   candidates: Candidate[] = getCandidatesData()
 ): {
   count: number;
   avg_experience: number;
   top_skills: string[];
 } {
   const filteredCandidates = candidates.filter((c) =>
     candidateIds.includes(c.id)
   );

   if (filteredCandidates.length === 0) {
     return { count: 0, avg_experience: 0, top_skills: [] };
   }

   const totalExperience = filteredCandidates.reduce((sum, candidate) => {
     return sum + (Number.parseInt(candidate.years_experience) || 0);
   }, 0);

   const avgExperience =
     Math.round((totalExperience / filteredCandidates.length) * 10) / 10;

   const skillCounts: Record<string, number> = {};
   filteredCandidates.forEach((candidate) => {
     candidate.skills
       .split(";")
       .map((s) => s.trim())
       .filter((s) => s)
       .forEach((skill) => {
         skillCounts[skill] = (skillCounts[skill] || 0) + 1;
       });
   });

   const topSkills = Object.entries(skillCounts)
     .sort(([, a], [, b]) => b - a)
     .slice(0, 5)
     .map(([skill]) => skill);

   return {
     count: filteredCandidates.length,
     avg_experience: avgExperience,
     top_skills: topSkills,
   };
 }
