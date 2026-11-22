import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

  @IsEnum(['applicant', 'company', 'seeker'] as const)
  role!: 'applicant' | 'company' | 'seeker';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password!: string;
}

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryTo?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRemote?: boolean;
}

export class UpdateVacancyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryTo?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  desiredPosition?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  keySkills?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  workExperience?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'false' ? false : value === 'true' ? true : value)
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateResumeDto extends CreateResumeDto {}

export class CreateResponseDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vacancyId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  resumeId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;
}

export class UpdateResponseDto {
  @IsString()
  @IsIn(['viewed', 'interview', 'rejected', 'hired', 'withdrawn'])
  status!: 'viewed' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  comment?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text?: string;
}

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

  @IsEnum(['applicant', 'company', 'admin'] as const)
  role!: 'applicant' | 'company' | 'admin';
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsEnum(['applicant', 'company', 'admin'] as const)
  role?: 'applicant' | 'company' | 'admin';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}

export class ApplicantProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}
