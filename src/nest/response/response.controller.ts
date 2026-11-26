import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { CurrentUser } from '../common/decorators';
import { ResponseService } from './response.service';
import { CreateResponseDto, UpdateResponseDto } from '../common/dto';

@ApiTags('response')
@Controller(['response', 'applications'])
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResponseController {
  constructor(private service: ResponseService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('applicant', 'company')
  create(@Body() body: CreateResponseDto, @CurrentUser() user: AuthUser) {
    return body.type === 'resume_invite'
      ? this.service.invite(body, user)
      : this.service.create(body, user);
  }
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('applicant')
  my(@CurrentUser() user: AuthUser) { return this.service.my(user); }
  @Get()
  @UseGuards(RolesGuard)
  @Roles('applicant', 'company', 'admin')
  list(@CurrentUser() user: AuthUser) { return this.service.list(user); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateResponseDto, @CurrentUser() user: AuthUser) { return this.service.update(Number(id), body, user); }
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) { return this.service.delete(Number(id)); }
}
