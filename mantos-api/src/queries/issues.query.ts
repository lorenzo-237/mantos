export class IssuesFilters {
  target_version?: string;
  fixed_in_version?: string;
  version?: string;
  status?: number;
  category_id?: number;
  summary?: string;
  issue_id?: number;
}

export class IssuesQueries extends IssuesFilters {
  project_id?: number;
  page_size?: number;
  page?: number;
}
