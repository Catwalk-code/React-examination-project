import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators';
import { JwtAuthGuard, Roles, RolesGuard, AuthUser } from '../common/auth';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ApplicantProfileDto } from '../common/dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: AuthUser) { return this.service.profile(user); }

  @Post('applicant-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant')
  applicantProfile(@CurrentUser() user: AuthUser, @Body() body: ApplicantProfileDto) { return this.service.createApplicantProfile(user, body); }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() { return this.service.list(); }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: CreateUserDto) { return this.service.create(body); }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  get(@Param('id') id: string) { return this.service.get(Number(id)); }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.service.update(Number(id), body, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) { return this.service.delete(Number(id)); }
}
