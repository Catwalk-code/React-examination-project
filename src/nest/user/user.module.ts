import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserCompanyController } from './user-company.controller';

@Module({ controllers: [UserController, UserCompanyController], providers: [UserService, UserRepository] })
export class UserModule {}
