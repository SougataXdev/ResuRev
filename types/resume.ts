
export interface ResumeRecord {
  id: string;
  createdAt?: number; 
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  resumePath: string;
  imagePath?: string | null;
  inputHash?: string;
  version?: string;
  status?: 'pending' | 'completed' | 'error';
  feedback?: any | null; 
  meta?: { fileName?: string };
}

export type ResumeKey = `resume:${string}`;

export const buildResumeKey = (id: string): ResumeKey => `resume:${id}` as ResumeKey;
