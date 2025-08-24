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

/////   mock  data
export const mockCandidates = [
  {
    id: "1",
    full_name: "Alice Johnson",
    title: "Senior Backend Engineer",
    location: "Berlin, Germany",
    timezone: "CET",
    years_experience: "7",
    skills: "Node.js;Express;MongoDB;Docker;AWS",
    languages: "English;German",
    education_level: "Masters",
    degree_major: "Computer Science",
    availability_weeks: "4",
    willing_to_relocate: "Yes",
    work_preference: "Remote",
    notice_period_weeks: "2",
    desired_salary_usd: "90000",
    open_to_contract: "Yes",
    remote_experience_years: "5",
    visa_status: "EU Work Permit",
    citizenships: "Germany;USA",
    summary:
      "Seasoned backend engineer with expertise in distributed systems, microservices, and cloud-native applications.",
    tags: "backend;microservices;cloud",
    last_active: "2025-08-20",
    linkedin_url: "https://www.linkedin.com/in/alicejohnson",
  },
  {
    id: "2",
    full_name: "Brian Kipkoech",
    title: "Frontend Developer",
    location: "Nairobi, Kenya",
    timezone: "EAT",
    years_experience: "3",
    skills: "React;TypeScript;Tailwind;Next.js",
    languages: "English;Swahili",
    education_level: "Bachelors",
    degree_major: "Software Engineering",
    availability_weeks: "2",
    willing_to_relocate: "No",
    work_preference: "Hybrid",
    notice_period_weeks: "1",
    desired_salary_usd: "40000",
    open_to_contract: "Yes",
    remote_experience_years: "2",
    visa_status: "Citizen",
    citizenships: "Kenya",
    summary:
      "Frontend engineer focused on building scalable, user-friendly applications with modern frameworks.",
    tags: "frontend;react;ui/ux",
    last_active: "2025-08-18",
    linkedin_url: "https://www.linkedin.com/in/briankipkoech",
  },
  {
    id: "3",
    full_name: "Carlos Martinez",
    title: "Fullstack Developer",
    location: "Madrid, Spain",
    timezone: "CET",
    years_experience: "5",
    skills: "JavaScript;React;Node.js;PostgreSQL;GraphQL",
    languages: "Spanish;English",
    education_level: "Bachelors",
    degree_major: "Information Systems",
    availability_weeks: "6",
    willing_to_relocate: "Yes",
    work_preference: "Onsite",
    notice_period_weeks: "3",
    desired_salary_usd: "65000",
    open_to_contract: "No",
    remote_experience_years: "1",
    visa_status: "EU Citizen",
    citizenships: "Spain",
    summary:
      "Fullstack developer experienced in building end-to-end web applications with strong database and API design knowledge.",
    tags: "fullstack;graphql;database",
    last_active: "2025-08-15",
    linkedin_url: "https://www.linkedin.com/in/carlosmartinez",
  },
  {
    id: "4",
    full_name: "Carlos Martinez",
    title: "Fullstack Developer",
    location: "Madrid, Spain",
    timezone: "CET",
    years_experience: "5",
    skills: "JavaScript;React;Node.js;PostgreSQL;GraphQL",
    languages: "Spanish;English",
    education_level: "Bachelors",
    degree_major: "Information Systems",
    availability_weeks: "6",
    willing_to_relocate: "Yes",
    work_preference: "Onsite",
    notice_period_weeks: "3",
    desired_salary_usd: "65000",
    open_to_contract: "No",
    remote_experience_years: "1",
    visa_status: "EU Citizen",
    citizenships: "Spain",
    summary:
      "Fullstack developer experienced in building end-to-end web applications with strong database and API design knowledge.",
    tags: "fullstack;graphql;database",
    last_active: "2025-08-15",
    linkedin_url: "https://www.linkedin.com/in/carlosmartinez",
  },
  {
    id: "5",
    full_name: "Carlos Martinez",
    title: "Fullstack Developer",
    location: "Madrid, Spain",
    timezone: "CET",
    years_experience: "5",
    skills: "JavaScript;React;Node.js;PostgreSQL;GraphQL",
    languages: "Spanish;English",
    education_level: "Bachelors",
    degree_major: "Information Systems",
    availability_weeks: "6",
    willing_to_relocate: "Yes",
    work_preference: "Onsite",
    notice_period_weeks: "3",
    desired_salary_usd: "65000",
    open_to_contract: "No",
    remote_experience_years: "1",
    visa_status: "EU Citizen",
    citizenships: "Spain",
    summary:
      "Fullstack developer experienced in building end-to-end web applications with strong database and API design knowledge.",
    tags: "fullstack;graphql;database",
    last_active: "2025-08-15",
    linkedin_url: "https://www.linkedin.com/in/carlosmartinez",
  },
  {
    id: "6",
    full_name: "Carlos Martinez",
    title: "Fullstack Developer",
    location: "Madrid, Spain",
    timezone: "CET",
    years_experience: "5",
    skills: "JavaScript;React;Node.js;PostgreSQL;GraphQL",
    languages: "Spanish;English",
    education_level: "Bachelors",
    degree_major: "Information Systems",
    availability_weeks: "6",
    willing_to_relocate: "Yes",
    work_preference: "Onsite",
    notice_period_weeks: "3",
    desired_salary_usd: "65000",
    open_to_contract: "No",
    remote_experience_years: "1",
    visa_status: "EU Citizen",
    citizenships: "Spain",
    summary:
      "Fullstack developer experienced in building end-to-end web applications with strong database and API design knowledge.",
    tags: "fullstack;graphql;database",
    last_active: "2025-08-15",
    linkedin_url: "https://www.linkedin.com/in/carlosmartinez",
  },
];
