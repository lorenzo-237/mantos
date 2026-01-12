import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class NewPackageDto {
  @IsString()
  version: string;
  @IsString()
  html: string;
  @IsNumber()
  project_id: number;
}

export class UpdatePackageDto {
  @IsString()
  clientChangelog: string;
  @IsBoolean()
  obsolete: boolean;
}
