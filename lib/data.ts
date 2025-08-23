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

    candidatesData = lines.slice(1).map((line, index) => {
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

export function filterCandidates(plan: FilterPlan): Candidate[] {
  const candidates = getCandidatesData();

  return candidates.filter((candidate) => {
    // Apply include filters
    if (plan.include) {
      // Skills filter
      if (plan.include.skills && plan.include.skills.length > 0) {
        const candidateSkills = candidate.skills
          .toLowerCase()
          .split(";")
          .map((s) => s.trim());
        const hasRequiredSkill = plan.include.skills.some((skill) =>
          candidateSkills.some((cs) => cs.includes(skill.toLowerCase()))
        );
        if (!hasRequiredSkill) return false;
      }

      // Location filter
      if (plan.include.location && plan.include.location.length > 0) {
        const hasLocation = plan.include.location.some((loc) =>
          candidate.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!hasLocation) return false;
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
      if (
        plan.include.work_preference &&
        plan.include.work_preference.length > 0
      ) {
        const hasWorkPref = plan.include.work_preference.some((pref) =>
          candidate.work_preference.toLowerCase().includes(pref.toLowerCase())
        );
        if (!hasWorkPref) return false;
      }

      // Willing to relocate filter
      if (plan.include.willing_to_relocate !== undefined) {
        const isWilling = candidate.willing_to_relocate.toLowerCase() === "yes";
        if (plan.include.willing_to_relocate !== isWilling) return false;
      }

      // Visa status filter
      if (plan.include.visa_status && plan.include.visa_status.length > 0) {
        const hasVisaStatus = plan.include.visa_status.some((status) =>
          candidate.visa_status.toLowerCase().includes(status.toLowerCase())
        );
        if (!hasVisaStatus) return false;
      }
    }

    // Apply exclude filters
    if (plan.exclude) {
      // Exclude skills
      if (plan.exclude.skills && plan.exclude.skills.length > 0) {
        const candidateSkills = candidate.skills
          .toLowerCase()
          .split(";")
          .map((s) => s.trim());
        const hasExcludedSkill = plan.exclude.skills.some((skill) =>
          candidateSkills.some((cs) => cs.includes(skill.toLowerCase()))
        );
        if (hasExcludedSkill) return false;
      }

      // Exclude locations
      if (plan.exclude.location && plan.exclude.location.length > 0) {
        const hasExcludedLocation = plan.exclude.location.some((loc) =>
          candidate.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (hasExcludedLocation) return false;
      }

      // Exclude visa status
      if (plan.exclude.visa_status && plan.exclude.visa_status.length > 0) {
        const hasExcludedVisaStatus = plan.exclude.visa_status.some((status) =>
          candidate.visa_status.toLowerCase().includes(status.toLowerCase())
        );
        if (hasExcludedVisaStatus) return false;
      }
    }

    return true;
  });
}

export function rankCandidates(
  candidateIds: string[],
  plan: RankingPlan
): Candidate[] {
  const candidates = getCandidatesData();
  const filteredCandidates = candidates.filter((c) =>
    candidateIds.includes(c.id)
  );

  const scoredCandidates = filteredCandidates.map((candidate) => ({
    candidate,
    scores: calculateCandidateScores(candidate, plan),
  }));

  // Sort by primary  criteria first, then tie breakers
  scoredCandidates.sort((a, b) => {
    // Primary sort
    const primaryDiff =
      plan.order === "desc"
        ? b.scores[plan.primary] - a.scores[plan.primary]
        : a.scores[plan.primary] - b.scores[plan.primary];

    if (primaryDiff !== 0) return primaryDiff;

    // Tie breakers
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

  // Experience score (years)
  scores.experience = Number.parseInt(candidate.years_experience) || 0;

  // Salary score (normalized to 0-100 scale)
  const salary = Number.parseInt(candidate.desired_salary_usd) || 0;
  scores.salary = Math.min(salary / 1000, 500); // Cap at 500k for scoring

  // Availability score (inverse of weeks, so lower weeks = higher score)
  const availabilityWeeks = Number.parseInt(candidate.availability_weeks) || 52;
  scores.availability = Math.max(0, 52 - availabilityWeeks);

  // Skills match score (number of skills as proxy)
  const skillCount = candidate.skills.split(";").filter((s) => s.trim()).length;
  scores.skills_match = skillCount;

  return scores;
}

export function aggregateStats(candidateIds: string[]): {
  count: number;
  avg_experience: number;
  top_skills: string[];
} {
  const candidates = getCandidatesData();
  const filteredCandidates = candidates.filter((c) =>
    candidateIds.includes(c.id)
  );

  if (filteredCandidates.length === 0) {
    return {
      count: 0,
      avg_experience: 0,
      top_skills: [],
    };
  }

  // Calculate average experience
  const totalExperience = filteredCandidates.reduce((sum, candidate) => {
    return sum + (Number.parseInt(candidate.years_experience) || 0);
  }, 0);
  const avgExperience =
    Math.round((totalExperience / filteredCandidates.length) * 10) / 10;

  // Calculate top skills
  const skillCounts: Record<string, number> = {};
  filteredCandidates.forEach((candidate) => {
    const skills = candidate.skills
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s);
    skills.forEach((skill) => {
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
