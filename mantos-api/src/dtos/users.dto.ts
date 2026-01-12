import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  token: string;
}

export class VerifyTokenDto {
  @IsString()
  mantisToken: string;
}

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  theme: string;
}
