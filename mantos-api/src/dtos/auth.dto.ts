import { IsBoolean, IsString } from 'class-validator';

export class LogInDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsBoolean()
  ldap: boolean;
}
