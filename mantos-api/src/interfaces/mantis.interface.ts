export interface CategoryMantis {
  id: number;
  name: string;
  project: {
    id: number;
    name: string;
  };
  default_handler?: {
    id: number;
    name: string;
    real_name?: string;
    email?: string;
  };
}

export interface VersionMantis {
  id: number;
  name: string;
  description: string;
  released: boolean;
  obsolete: boolean;
  timestamp: string;
}

export interface ProjectMantis {
  id: number;
  name: string;
  status: {
    id: number;
    name: string;
    label: string;
  };
  description: string;
  enabled: boolean;
  view_state: {
    id: number;
    name: string;
    label: string;
  };
  access_level: {
    id: number;
    name: string;
    label: string;
  };
  custom_fields: CustomFieldProject[];
  versions?: VersionMantis[];
  categories: CategoryMantis[];
  subProjects?: SubProject[];
}

export interface CustomFieldProject {
  id: number;
  name: string;
  type: string;
  default_value: string;
  possible_values: string;
  valid_regexp: string;
  length_min: number;
  length_max: number;
  access_level_r: {
    id: number;
    name: string;
    label: string;
  };
  access_level_rw: {
    id: number;
    name: string;
    label: string;
  };
  display_report: boolean;
  display_update: boolean;
  display_resolved: boolean;
  display_closed: boolean;
  require_report: boolean;
  require_update: boolean;
  require_resolved: boolean;
  require_closed: boolean;
}

export interface SubProject {
  id: number;
  name: string;
}

export interface IssueMantis {
  id: number;
  summary: string;
  description: string;
  steps_to_reproduce: string;
  project: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  version: {
    id: number;
    name: string;
  };
  fixed_in_version: {
    id: number;
    name: string;
  };
  target_version: {
    id: number;
    name: string;
  };
  reporter: {
    id: number;
    name: string;
  };
  handler: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
    label: string;
    color: string;
  };
  resolution: {
    id: number;
    name: string;
    label: string;
  };
  view_state: {
    id: number;
    name: string;
    label: string;
  };
  priority: {
    id: number;
    name: string;
    label: string;
  };
  severity: {
    id: number;
    name: string;
    label: string;
  };
  reproducibility: {
    id: number;
    name: string;
    label: string;
  };
  sticky: boolean;
  created_at: string;
  updated_at: string;
  notes: Note[];
  custom_fields: CustomFieldIssue[];
  tags?: Tag[];
  history: History[];
  attachments?: {
    id: number;
    reporter: {
      id: number;
      name: string;
    };
    created_at: string;
    filename: string;
    size: number;
    content_type: string;
  }[];
}

interface Note {
  id: number;
  reporter: {
    id: number;
    name: string;
  };
  text: string;
  view_state: {
    id: number;
    name: string;
    label: string;
  };
  attachments: any[];
  type: string;
  created_at: string;
  updated_at: string;
}

interface CustomFieldIssue {
  field: {
    id: number;
    name: string;
  };
  value: string;
}

interface Tag {
  id: string;
  name: string;
}

interface History {
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    name: string;
  };
  message?: string;
  field?: {
    name: string;
    label: string;
  };
  old_value?: any;
  new_value?: any;
  change?: string;
}

export interface FilterMantis {
  id: number;
  name: string;
  public: boolean;
  project: {
    id: number;
    name: string;
  };
  criteria: {
    project?: { id: number; name: string }[];
    fixed_in_version?: { id: number; name: string }[];
  };
  url: string;
}

interface Reporter {
  id: number;
  name: string;
}

export interface FileMantis {
  id: number;
  reporter: Reporter;
  created_at: string;
  filename: string;
  size: number;
  content_type: string;
  content: string; // Assuming content is a string, update it according to the actual content type
}

export interface AccessLevel {
  id: number;
  name: string;
  label: string;
}

export interface UserMantis {
  id: number;
  name: string;
  real_name: string;
  email: string;
  language: string;
  timezone: string;
  access_level: AccessLevel;
  projects: SubProject[];
}
