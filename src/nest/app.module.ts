import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { ResumeModule } from './resume/resume.module';
import { ResponseModule } from './response/response.module';
import { CompanyModule } from './company/company.module';
import { ReviewModule } from './review/review.module';
import { HealthModule } from './health/health.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { MongoLoggerService } from './common/mongo-logger.service';

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
  providers: [
    MongoLoggerService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
