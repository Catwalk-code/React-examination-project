import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('users')
export class UserCompanyController {
  constructor(private service: UserService) {}

  @Get()
  companies() { return this.service.companies(); }
}
