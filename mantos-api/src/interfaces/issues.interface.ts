import { TagPrisma } from './tags.interface';

export interface IssueAPI {
  id: number;
  summary: string;
  description: string;
  project: string;
  category: string;
  version: string;
  target_version: string;
  fixed_in_version: string;
  status: {
    name: string;
    label: string;
    color: string;
  };
  files: { id: number; content_type: string; size: number; filename: string }[];
  tags: string[];
}

export interface UserPrisma {
  id: number;
  username: string;
  realname: string;
  email: string;
}

export interface BugText {
  id: number;
  description: string;
  steps_to_reproduce: string;
  additional_information: string;
}

export interface CategoryPrisma {
  id: number;
  project_id: number;
  user_id: number;
  name: string;
  status: number;
}

export interface SourceRelationship {
  id: number;
  relationship_type: number;
  destination: {
    id: number;
    summary: string;
    status: number;
  };
}
export interface DestinationRelationship {
  id: number;
  relationship_type: number;
  source: {
    id: number;
    summary: string;
    status: number;
  };
}
export interface IssuePrisma {
  id: number;
  project_id: number;
  reporter_id: number;
  reporter: UserPrisma;
  handler_id: number;
  handler: UserPrisma;
  duplicate_id: number;
  priority: number;
  severity: number;
  reproducibility: number;
  status: number;
  resolution: number;
  projection: number;
  eta: number;
  bug_text_id: number;
  bugText: BugText;
  os: string;
  os_build: string;
  platform: string;
  version: string;
  fixed_in_version: string;
  build: string;
  profile_id: number;
  view_state: number;
  summary: string;
  sponsorship_total: number;
  sticky: number;
  target_version: string;
  category?: CategoryPrisma;
  category_id: number;
  date_submitted: number;
  due_date: number;
  last_updated: number;
  sequence: number;
  tags: { tag: TagPrisma }[];
  source_relations?: SourceRelationship[];
  destination_relations?: DestinationRelationship[];
}

export interface DetailElement {
  id: number;
  name: string;
}

export interface IssueSimple {
  id: number;
  version: string;
  target_version: string;
  fixed_in_version: string;
  summary: string;
  resolution: DetailElement;
  last_updated: Date;
  category: DetailElement;
  status: DetailElement;
  priority: DetailElement;
  severity: DetailElement;
  reproductibility: DetailElement;
  handler: UserPrisma;
  reporter: UserPrisma;
  bug_text: BugText;
  tags: TagPrisma[];
  source_relations?: SourceRelationship[];
  destination_relations?: DestinationRelationship[];
}
// status :
// 80 = resolved
// 60 = dealed
// 50 = assigned
