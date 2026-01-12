import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class FixIssueDto {
  fixed_in_version: {
    name: string;
  };
  notes?: string[];
}
// type statusMinimal = 'assigned' | 'dealed' | 'planned' | 'resolved' | 'closed'
type statusId = 50 | 60 | 55 | 80 | 90;

export class UpdateIssueDto {
  fixed_in_version?: {
    name: string;
  };
  target_version?: {
    name: string;
  };
  status?: {
    id: statusId;
  };
  notes?: string[];
}

export class AttachTagsDto {
  tags: { id: number }[];
}

class _VersionIssue {
  @IsString()
  @IsOptional()
  current?: string;
  @IsString()
  target: string;
  @IsString()
  @IsOptional()
  fixed?: string;
}

export class TagIssue {
  @IsNumber()
  id: number;
}

export class RelationShipIssue {
  @IsNumber()
  issue_id: number;
  @IsNumber()
  relationship_type: number;
  @IsBoolean()
  is_source: boolean;
}

export class CreateIssueDto {
  @IsString()
  summary: string;
  @IsString()
  description: string;
  @IsString()
  @IsOptional()
  steps?: string;
  @IsString()
  @IsOptional()
  additional_information?: string;
  @IsNumber()
  @Min(1)
  project_id: number;
  @IsNumber()
  @IsIn([10, 20, 50, 55, 60, 80, 90])
  status_id: number;
  @IsNumber()
  @Min(1)
  category_id: number;
  @IsNumber()
  @Min(1)
  @IsOptional()
  handler_id?: number;
  @IsNumber()
  @IsIn([10, 20, 30, 40, 50, 60])
  priority_id: number;
  @IsNumber()
  @IsIn([10, 20, 30, 40, 50, 60, 70, 80])
  severity_id: number;
  @IsNumber()
  @IsIn([10, 30, 50, 70, 90, 100])
  reproducibility_id: number;
  @ValidateNested()
  @Type(() => _VersionIssue)
  version: _VersionIssue;
  tags?: TagIssue[];
  relations?: RelationShipIssue[];
  files?: {
    name: string;
    content: string;
  }[];
}

// date_submitted => epoch
// last_updated => epoch

export class AttachNoteDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  notes: string[];
}
