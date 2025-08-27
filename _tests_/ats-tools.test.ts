  
import {
  filterCandidates,
  rankCandidates,
  aggregateStats,
} from "@/lib/data";
import type { Candidate, FilterPlan, RankingPlan } from "@/lib/types/types";

// Mock candidates data for testing
const mockCandidates: Candidate[] = [
  {
    id: "5",
    full_name: "Alex Johnson",
    title: "React Developer",
    location: "Cyprus",
    timezone: "Europe/Nicosia",
    years_experience: "3",
    skills: "React;JavaScript;CSS;HTML",
    languages: "English;Greek",
    education_level: "Bachelor's",
    degree_major: "Computer Science",
    availability_weeks: "2",
    willing_to_relocate: "Yes",
    work_preference: "Remote",
    notice_period_weeks: "2",
    desired_salary_usd: "65000",
    open_to_contract: "Yes",
    remote_experience_years: "2",
    visa_status: "No Sponsorship Required",
    citizenships: "Cyprus",
    summary: "Frontend developer with React expertise",
    tags: "frontend,react",
    last_active: "2025-01-15",
    linkedin_url: "https://linkedin.com/in/candidate5",
  },
  {
    id: "12",
    full_name: "Maria Constantinou",
    title: "Senior React Developer",
    location: "Cyprus",
    timezone: "Europe/Nicosia",
    years_experience: "7",
    skills: "React;TypeScript;Node.js;GraphQL",
    languages: "English;Greek",
    education_level: "Master's",
    degree_major: "Software Engineering",
    availability_weeks: "4",
    willing_to_relocate: "No",
    work_preference: "Hybrid",
    notice_period_weeks: "4",
    desired_salary_usd: "85000",
    open_to_contract: "No",
    remote_experience_years: "5",
    visa_status: "No Sponsorship Required",
    citizenships: "Cyprus",
    summary: "Senior React developer with full-stack experience",
    tags: "frontend,fullstack,react",
    last_active: "2025-01-20",
    linkedin_url: "https://linkedin.com/in/candidate12",
  },
];

describe("ATS Tools (DI tests)", () => {
  describe("filterCandidates", () => {
    it("should filter candidates by skills", () => {
      const filterPlan: FilterPlan = {
        include: {
          skills: ["React"],
        },
      };

      const result = filterCandidates(filterPlan, mockCandidates);
      expect(result).toHaveLength(2);
      expect(
        result.every((c) => c.skills.toLowerCase().includes("react"))
      ).toBe(true);
    });

    it("should filter candidates by location", () => {
      const filterPlan: FilterPlan = {
        include: {
          location: ["cyprus"],
        },
      };

      const result = filterCandidates(filterPlan, mockCandidates);
      expect(result).toHaveLength(2);
      expect(
        result.every((c) => c.location.toLowerCase().includes("cyprus"))
      ).toBe(true);
    });

    it("should filter candidates by experience range", () => {
      const filterPlan: FilterPlan = {
        include: {
          experience_min: 5,
        },
      };

      const result = filterCandidates(filterPlan, mockCandidates);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("12");
    });
  });

  describe("rankCandidates", () => {
    it("should rank React developers in Cyprus by experience descending - candidate #12 should appear above #5", () => {
      // First filter for React developers in Cyprus (inject data)
      const filterPlan: FilterPlan = {
        include: {
          skills: ["react"],
          location: ["cyprus"],
        },
      };

      const filtered = filterCandidates(filterPlan, mockCandidates);
      expect(filtered).toHaveLength(2);

      // Then rank by experience descending
      const rankingPlan: RankingPlan = {
        primary: "experience",
        order: "desc",
      };

      const candidateIds = filtered.map((c) => c.id);
      const ranked = rankCandidates(candidateIds, rankingPlan, mockCandidates);

      expect(ranked).toHaveLength(2);
      expect(ranked[0].id).toBe("12"); // Maria (7 years) should be first
      expect(ranked[1].id).toBe("5"); // Alex (3 years) should be second
    });

    it("should rank candidates by salary ascending", () => {
      const candidateIds = mockCandidates.map((c) => c.id);
      const rankingPlan: RankingPlan = {
        primary: "salary",
        order: "asc",
      };

      const result = rankCandidates(candidateIds, rankingPlan, mockCandidates);
      expect(result[0].id).toBe("5"); // Lower salary first
      expect(result[1].id).toBe("12");
    });
  });

  describe("aggregateStats", () => {
    it("should calculate correct statistics", () => {
      const candidateIds = mockCandidates.map((c) => c.id);
      const stats = aggregateStats(candidateIds, mockCandidates);

      expect(stats.count).toBe(2);
      expect(stats.avg_experience).toBe(5); // (3 + 7) / 2 = 5
      expect(stats.top_skills).toContain("React");
    });

    it("should handle empty candidate list", () => {
      const stats = aggregateStats([], mockCandidates);
      expect(stats.count).toBe(0);
      expect(stats.avg_experience).toBe(0);
      expect(stats.top_skills).toEqual([]);
    });
  });
});
