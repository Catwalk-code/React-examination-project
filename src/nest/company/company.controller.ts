import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { CurrentUser } from '../common/decorators';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from '../common/dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private service: CompanyService) {}
  @Get() list() { return this.service.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(Number(id)); }
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company', 'admin')
  update(@Param('id') id: string, @Body() body: UpdateCompanyDto, @CurrentUser() user: AuthUser) { return this.service.update(Number(id), body, user); }
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) { return this.service.delete(Number(id)); }
}
