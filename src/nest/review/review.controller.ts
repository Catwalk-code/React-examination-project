import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { CurrentUser } from '../common/decorators';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../common/dto';

@ApiTags('review')
@Controller(['review', 'reviews'])
export class ReviewController {
  constructor(private service: ReviewService) {}
  @Get() list() { return this.service.list(); }
  @Get('company/:companyId') findByCompany(@Param('companyId') companyId: string) { return this.service.findByCompany(Number(companyId)); }
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant')
  create(@Body() body: CreateReviewDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user); }
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('applicant', 'admin')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.delete(Number(id), user); }
}
