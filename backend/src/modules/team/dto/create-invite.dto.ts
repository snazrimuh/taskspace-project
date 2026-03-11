import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class CreateInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}
