export interface Project {
  id: number;
  name: string;
  status: {
    id: number;
    name: string;
  };
  enabled: boolean;
  view_state: {
    id: number;
    name: string;
  };
  description: string;
}

export interface ProjectVersion {
  id: number;
  name: string;
  description: string;
  released: boolean;
  obsolete: boolean;
  timestamp: string;
}
