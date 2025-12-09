export enum UserRole {
  SEEKER = 'SEEKER',
  RECRUITER = 'RECRUITER'
}

export enum AppMode {
  JOB_SEARCH = 'JOB_SEARCH',
  DASHBOARD = 'DASHBOARD',
  INTERVIEW = 'INTERVIEW',
  RESUME_AUDIT = 'RESUME_AUDIT',
  JOB_ARCHITECT = 'JOB_ARCHITECT',
  CANDIDATE_SCREEN = 'CANDIDATE_SCREEN'
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  postedAt: Date;
  tags: string[];
}

export interface AnalysisResult {
  score?: number;
  summary: string;
  recommendations: string[];
  missingKeywords?: string[];
  interviewQuestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Live API Types
export interface Blob {
  data: string;
  mimeType: string;
}

export const INTERVIEW_INSTRUCTION = `
You are an experienced, professional, yet approachable hiring manager conducting a screening interview for JOBEE. 
Your goal is to assess the candidate's soft skills, problem-solving abilities, and general fit.
Keep your responses concise (under 2 sentences usually) to keep the conversation flowing naturally like a real call.
Start by introducing yourself as Alex from JOBEE and ask the candidate to introduce themselves.
`;