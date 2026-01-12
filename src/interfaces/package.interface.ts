export interface Package {
  id: number;
  projectId: number;
  version: string;
  htmlHeader: string;
  clientChangelog: string;
  createdAt: Date;
  updatedAt: Date;
  obsolete: boolean;
}
