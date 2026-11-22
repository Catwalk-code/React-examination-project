import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { ResumeModule } from './resume/resume.module';
import { ResponseModule } from './response/response.module';
import { CompanyModule } from './company/company.module';
import { ReviewModule } from './review/review.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    VacancyModule,
    ResumeModule,
    ResponseModule,
    CompanyModule,
    ReviewModule,
    HealthModule,
  ],
})
export class AppModule {}
