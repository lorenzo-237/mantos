import { IsDateString, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProjectDto {
  @IsNumber()
  id: number;

  @IsString()
  version: string;
}

class AssemblyDto {
  @IsString()
  name: string;

  @IsString()
  extension: string;

  @IsString()
  path: string;

  @IsString()
  checksum: string;

  @IsDateString()
  date: string;

  @IsString()
  version: string;
}

export class NewAssemblyInfoDto {
  @ValidateNested()
  @Type(() => ProjectDto)
  project: ProjectDto;

  @ValidateNested({ each: true })
  @Type(() => AssemblyDto)
  assemblies: AssemblyDto[];
}
