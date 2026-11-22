import { Module } from '@nestjs/common';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancyRepository } from './vacancy.repository';

@Module({ controllers: [VacancyController], providers: [VacancyService, VacancyRepository] })
export class VacancyModule {}
