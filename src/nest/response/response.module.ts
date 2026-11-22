import { Module } from '@nestjs/common';
import { ResponseController } from './response.controller';
import { ResponseService } from './response.service';
import { ResponseRepository } from './response.repository';

@Module({ controllers: [ResponseController], providers: [ResponseService, ResponseRepository] })
export class ResponseModule {}
