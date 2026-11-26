import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { CurrentUser } from '../common/decorators';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto, UpdateVacancyDto } from '../common/dto';

@ApiTags('vacancy')
@Controller('vacancies')
export class VacancyController {
  constructor(private service: VacancyService) {}
  @Get() list() { return this.service.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(Number(id)); }
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  create(@Body() body: CreateVacancyDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user); }
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company', 'admin')
  update(@Param('id') id: string, @Body() body: UpdateVacancyDto, @CurrentUser() user: AuthUser) { return this.service.update(Number(id), body, user); }
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company', 'admin')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.delete(Number(id), user); }
}
