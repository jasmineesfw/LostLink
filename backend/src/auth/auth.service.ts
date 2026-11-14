import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly schoolDomain = '@smktelkom-mlg.sch.id';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Registrasi pengguna
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    if (!email.endsWith(this.schoolDomain)) {
      throw new BadRequestException(
        'Gunakan email sekolah @smktelkom-mlg.sch.id',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nama: dto.nama.trim(),
        email,
        password: hashedPassword,
        role: 'SISWA',
      },
    });

    return {
      message: 'Registrasi berhasil',
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Login pengguna
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    if (!email.endsWith(this.schoolDomain)) {
      throw new UnauthorizedException('Email bukan email sekolah');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil',
      access_token: accessToken,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }
}
