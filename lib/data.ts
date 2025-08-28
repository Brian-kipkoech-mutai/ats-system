 export interface FilterPlan {
   include?: {
     skills?: string[];
     title?: string[];
     location?: string[];
     timezone?: string[];
     experience_min?: number;
     experience_max?: number;
     work_preference?: string[];
     willing_to_relocate?: boolean;
     visa_status?: string[];
     languages?: string[];
     education_level?: string[];
     degree_major?: string[];
     availability_weeks_min?: number;
     availability_weeks_max?: number;
     notice_period_weeks?: number;
     notice_period_weeks_max?: number;
     desired_salary_usd_min?: number;
     desired_salary_usd_max?: number;
     open_to_contract?: boolean;
     remote_experience_min?: number;
     citizenships?: string[];
     summary_keywords?: string[];
     tags?: string[];
     last_active_within_days?: number;
     roles?: string[];
   };
   exclude?: {
     skills?: string[];
     location?: string[];
     title?: string[];
     visa_status?: string[];
     languages?: string[];
     education_level?: string[];
     degree_major?: string[];
     citizenships?: string[];
     tags?: string[];
     summary_keywords?: string[];
   };
 }

 export interface RankingPlan {
   primary: "experience" | "salary" | "availability" | "skills_match";
   tie_breakers?: ("experience" | "salary" | "availability" | "skills_match")[];
   order: "asc" | "desc";
 }

 export interface Candidate {
   id: string;
   full_name: string;
   title: string;
   location: string;
   timezone: string;
   years_experience: string;
   skills: string;
   languages: string;
   education_level: string;
   degree_major: string;
   availability_weeks: string;
   willing_to_relocate: string;
   work_preference: string;
   notice_period_weeks: string;
   desired_salary_usd: string;
   open_to_contract: string;
   remote_experience_years: string;
   visa_status: string;
   citizenships: string;
   summary: string;
   tags: string;
   last_active: string;
   linkedin_url: string;
 }

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
       // Skills filter
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

       // Title filter
       if (plan.include.title?.length) {
         const hasTitle = plan.include.title.some((title) =>
           candidate.title.toLowerCase().includes(title.toLowerCase())
         );
         if (!hasTitle) return false;
       }

       // Location filter
       if (plan.include.location?.length) {
         const hasLocation = plan.include.location.some((loc) =>
           candidate.location.toLowerCase().includes(loc.toLowerCase())
         );
         if (!hasLocation) return false;
       }

       // Timezone filter
       if (plan.include.timezone?.length) {
         const hasTimezone = plan.include.timezone.some((tz) =>
           candidate.timezone.toLowerCase().includes(tz.toLowerCase())
         );
         if (!hasTimezone) return false;
       }

       // Experience range filter
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

       // Work preference filter
       if (plan.include.work_preference?.length) {
         const hasWorkPref = plan.include.work_preference.some((pref) =>
           candidate.work_preference.toLowerCase().includes(pref.toLowerCase())
         );
         if (!hasWorkPref) return false;
       }

       // Willing to relocate filter
       if (plan.include.willing_to_relocate !== undefined) {
         const isWilling =
           candidate.willing_to_relocate.toLowerCase() === "yes";
         if (plan.include.willing_to_relocate !== isWilling) return false;
       }

       // Visa status filter
       if (plan.include.visa_status?.length) {
         const hasVisaStatus = plan.include.visa_status.some((status) =>
           candidate.visa_status.toLowerCase().includes(status.toLowerCase())
         );
         if (!hasVisaStatus) return false;
       }

       // Languages filter
       if (plan.include.languages?.length) {
         const candidateLanguages = candidate.languages
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasLanguage = plan.include.languages.some((lang) =>
           candidateLanguages.some((cl) => cl.includes(lang.toLowerCase()))
         );
         if (!hasLanguage) return false;
       }

       // Education level filter
       if (plan.include.education_level?.length) {
         const hasEducationLevel = plan.include.education_level.some((level) =>
           candidate.education_level.toLowerCase().includes(level.toLowerCase())
         );
         if (!hasEducationLevel) return false;
       }

       // Degree major filter
       if (plan.include.degree_major?.length) {
         const hasDegreeMajor = plan.include.degree_major.some((major) =>
           candidate.degree_major.toLowerCase().includes(major.toLowerCase())
         );
         if (!hasDegreeMajor) return false;
       }

       // Availability weeks filter
       const availabilityWeeks =
         Number.parseInt(candidate.availability_weeks) || 0;
       if (
         plan.include.availability_weeks_min &&
         availabilityWeeks < plan.include.availability_weeks_min
       )
         return false;
       if (
         plan.include.availability_weeks_max &&
         availabilityWeeks > plan.include.availability_weeks_max
       )
         return false;

       // Notice period filter
       const noticePeriodWeeks =
         Number.parseInt(candidate.notice_period_weeks) || 0;
       if (
         plan.include.notice_period_weeks &&
         noticePeriodWeeks !== plan.include.notice_period_weeks
       )
         return false;
       if (
         plan.include.notice_period_weeks_max &&
         noticePeriodWeeks > plan.include.notice_period_weeks_max
       )
         return false;

       // Desired salary filter
       const desiredSalary = Number.parseInt(candidate.desired_salary_usd) || 0;
       if (
         plan.include.desired_salary_usd_min &&
         desiredSalary < plan.include.desired_salary_usd_min
       )
         return false;
       if (
         plan.include.desired_salary_usd_max &&
         desiredSalary > plan.include.desired_salary_usd_max
       )
         return false;

       // Open to contract filter
       if (plan.include.open_to_contract !== undefined) {
         const isOpenToContract =
           candidate.open_to_contract.toLowerCase() === "yes";
         if (plan.include.open_to_contract !== isOpenToContract) return false;
       }

       // Remote experience filter
       const remoteExperience =
         Number.parseInt(candidate.remote_experience_years) || 0;
       if (
         plan.include.remote_experience_min &&
         remoteExperience < plan.include.remote_experience_min
       )
         return false;

       // Citizenships filter
       if (plan.include.citizenships?.length) {
         const candidateCitizenships = candidate.citizenships
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasCitizenship = plan.include.citizenships.some((citizenship) =>
           candidateCitizenships.some((cc) =>
             cc.includes(citizenship.toLowerCase())
           )
         );
         if (!hasCitizenship) return false;
       }

       // Summary keywords filter
       if (plan.include.summary_keywords?.length) {
         const hasKeyword = plan.include.summary_keywords.some((keyword) =>
           candidate.summary.toLowerCase().includes(keyword.toLowerCase())
         );
         if (!hasKeyword) return false;
       }

       // Tags filter
       if (plan.include.tags?.length) {
         const candidateTags = candidate.tags
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasTag = plan.include.tags.some((tag) =>
           candidateTags.some((ct) => ct.includes(tag.toLowerCase()))
         );
         if (!hasTag) return false;
       }

       // Last active within days filter
       if (plan.include.last_active_within_days) {
         const lastActiveDate = new Date(candidate.last_active);
         const currentDate = new Date();
         const daysSinceLastActive = Math.floor(
           (currentDate.getTime() - lastActiveDate.getTime()) /
             (1000 * 60 * 60 * 24)
         );
         if (daysSinceLastActive > plan.include.last_active_within_days)
           return false;
       }

       // Roles filter (maps to skills)
       if (plan.include.roles?.length) {
         const candidateSkills = candidate.skills
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());

         // Map roles to default technology lists
         const roleSkillsMap: Record<string, string[]> = {
           frontend: [
             "react",
             "vue",
             "angular",
             "javascript",
             "typescript",
             "next.js",
           ],
           backend: [
             "node.js",
             "spring",
             "java",
             "c#",
             "go",
             "rust",
             "python",
             "kafka",
             "rabbitmq",
           ],
           devops: ["aws", "gcp", "azure", "kubernetes", "docker", "terraform"],
           "full-stack": [
             "react",
             "vue",
             "angular",
             "node.js",
             "spring",
             "python",
           ],
           mobile: ["react native", "flutter", "ios", "android"],
           "data scientist": [
             "python",
             "sql",
             "mongodb",
             "kafka",
             "machine learning",
           ],
           qa: ["selenium", "cypress", "jest", "testing"],
         };

         const hasRole = plan.include.roles.some((role) => {
           const roleSkills = roleSkillsMap[role.toLowerCase()] || [];
           return roleSkills.some((skill) =>
             candidateSkills.includes(skill.toLowerCase())
           );
         });

         if (!hasRole) return false;
       }
     }

     // Apply exclude filters
     if (plan.exclude) {
       // Skills exclude filter
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

       // Location exclude filter
       if (plan.exclude.location?.length) {
         const hasExcludedLocation = plan.exclude.location.some((loc) =>
           candidate.location.toLowerCase().includes(loc.toLowerCase())
         );
         if (hasExcludedLocation) return false;
       }

       // Title exclude filter
       if (plan.exclude.title?.length) {
         const hasExcludedTitle = plan.exclude.title.some((title) =>
           candidate.title.toLowerCase().includes(title.toLowerCase())
         );
         if (hasExcludedTitle) return false;
       }

       // Visa status exclude filter
       if (plan.exclude.visa_status?.length) {
         const hasExcludedVisaStatus = plan.exclude.visa_status.some((status) =>
           candidate.visa_status.toLowerCase().includes(status.toLowerCase())
         );
         if (hasExcludedVisaStatus) return false;
       }

       // Languages exclude filter
       if (plan.exclude.languages?.length) {
         const candidateLanguages = candidate.languages
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasExcludedLanguage = plan.exclude.languages.some((lang) =>
           candidateLanguages.some((cl) => cl.includes(lang.toLowerCase()))
         );
         if (hasExcludedLanguage) return false;
       }

       // Education level exclude filter
       if (plan.exclude.education_level?.length) {
         const hasExcludedEducationLevel = plan.exclude.education_level.some(
           (level) =>
             candidate.education_level
               .toLowerCase()
               .includes(level.toLowerCase())
         );
         if (hasExcludedEducationLevel) return false;
       }

       // Degree major exclude filter
       if (plan.exclude.degree_major?.length) {
         const hasExcludedDegreeMajor = plan.exclude.degree_major.some(
           (major) =>
             candidate.degree_major.toLowerCase().includes(major.toLowerCase())
         );
         if (hasExcludedDegreeMajor) return false;
       }

       // Citizenships exclude filter
       if (plan.exclude.citizenships?.length) {
         const candidateCitizenships = candidate.citizenships
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasExcludedCitizenship = plan.exclude.citizenships.some(
           (citizenship) =>
             candidateCitizenships.some((cc) =>
               cc.includes(citizenship.toLowerCase())
             )
         );
         if (hasExcludedCitizenship) return false;
       }

       // Tags exclude filter
       if (plan.exclude.tags?.length) {
         const candidateTags = candidate.tags
           .toLowerCase()
           .split(";")
           .map((s) => s.trim());
         const hasExcludedTag = plan.exclude.tags.some((tag) =>
           candidateTags.some((ct) => ct.includes(tag.toLowerCase()))
         );
         if (hasExcludedTag) return false;
       }

       // Summary keywords exclude filter
       if (plan.exclude.summary_keywords?.length) {
         const hasExcludedKeyword = plan.exclude.summary_keywords.some(
           (keyword) =>
             candidate.summary.toLowerCase().includes(keyword.toLowerCase())
         );
         if (hasExcludedKeyword) return false;
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