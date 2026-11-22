import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../common/dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.service.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body);
  }
}
