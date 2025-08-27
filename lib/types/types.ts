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

export interface FilterPlan {
  include?: {
    skills?: string[];
    location?: string[];
    experience_min?: number;
    experience_max?: number;
    work_preference?: string[];
    willing_to_relocate?: boolean;
    visa_status?: string[];
  };
  exclude?: {
    skills?: string[];
    location?: string[];
    visa_status?: string[];
  };
}

export interface RankingPlan {
  primary: "experience" | "salary" | "availability" | "skills_match";
  tie_breakers?: ("experience" | "salary" | "availability" | "skills_match")[];
  order: "asc" | "desc";
}

export interface TimelineStep {
  id: string;
  type: "thinking" | "filtering" | "ranking" | "speaking";
  title: string;
  data?: any;
  timestamp: Date;
  status: "pending" | "active" | "complete";
}

export interface MCPThinkResponse {
  filter: FilterPlan;
  rank: RankingPlan;
}

export interface SpeakPayload {
  query: string;
  candidates: Candidate[];
  stats: {
    count: number;
    avg_experience: number;
    top_skills: string[];
  };
}

export interface MCPWorkflowState {
  query: string;
  thinkResponse?: MCPThinkResponse;
  filteredCandidates?: Candidate[];
  rankedCandidates?: Candidate[];
  stats?: {
    count: number;
    avg_experience: number;
    top_skills: string[];
  };
  finalResponse?: string;
  speakPayload?: SpeakPayload;
}

 