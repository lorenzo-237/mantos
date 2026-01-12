import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class NewVersionDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsBoolean()
  released: boolean;
  @IsBoolean()
  obsolete: boolean;
}

export class UpdateVersionDto {
  @IsBoolean()
  @IsOptional()
  released: boolean;
  @IsNumber()
  @IsOptional()
  timestamp: number;
  @IsBoolean()
  @IsOptional()
  obsolete: boolean;
}

export class NewProjectDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
}
