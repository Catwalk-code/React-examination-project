import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { CurrentUser } from '../common/decorators';
import { ResumeService } from './resume.service';

@ApiTags('resume')
@Controller(['resume', 'resumes'])
export class ResumeController {
  constructor(private service: ResumeService) {}
  @Get() list() { return this.service.list(); }
  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant')
  my(@CurrentUser() user: AuthUser) { return this.service.my(user); }
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant', 'company', 'admin')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.get(Number(id), user); }
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant')
  create(@Body() body: any, @CurrentUser() user: AuthUser) { return this.service.create(body, user); }
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthUser) { return this.service.update(Number(id), body, user); }
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant', 'admin')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.delete(Number(id), user); }
}
