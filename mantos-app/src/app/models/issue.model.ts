export interface Issue {
  id: number;
  summary: string;
  description: string;
  project: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  severity: {
    id: number;
    name: string;
  };
  reporter: {
    id: number;
    name: string;
  };
  handler?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  tags: Tag[];
  notes: Note[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  text: string;
  reporter: {
    id: number;
    name: string;
  };
  created_at: string;
  view_state: {
    id: number;
    name: string;
  };
}

export interface CreateIssueRequest {
  summary: string;
  description: string;
  project: { id: number };
  category: { id: number };
  priority?: { id: number };
  severity?: { id: number };
  additional_information?: string;
}
