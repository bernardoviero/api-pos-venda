import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const username = process.env.AUTH_USERNAME ?? 'admin';
    const password = process.env.AUTH_PASSWORD ?? 'admin';

    if (
      loginDto.username !== username ||
      loginDto.password !== password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: username, username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
