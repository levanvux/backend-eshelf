import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(`Attempt to register with existing email: ${dto.email}`);
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      avatar: dto.avatar ?? 'http://localhost:9000/avatars/default.jpg',
    });

    this.logger.info(`New user registered: ${dto.email} (ID: ${user.id})`);
    return { message: 'Tạo tài khoản thành công', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(
        `Failed login attempt with non-existent email: ${dto.email}`,
      );
      throw new UnauthorizedException('User không tồn tại');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      this.logger.warn(
        `Failed login attempt with incorrect password for email: ${dto.email}`,
      );
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    this.logger.info(`User logged in: ${dto.email} (ID: ${user.id})`);
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    };
  }
}
