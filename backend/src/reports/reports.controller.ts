import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { ReportsService } from './reports.service';
import type { CreateReportDto, UpdateReportDto } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Req } from '@nestjs/common';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: 'SISWA' | 'PETUGAS' | 'ADMIN';
  };
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Menampilkan semua laporan
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  // Membuat laporan (semua role harus login)
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @Body() data: CreateReportDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const foto = file ? `/uploads/${file.filename}` : undefined;

    return this.reportsService.create(data, foto, req.user);
  }

  // Mengedit laporan (Siswa hanya miliknya sendiri, Admin semua laporan)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SISWA', 'PETUGAS', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReportDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const foto = file ? `/uploads/${file.filename}` : undefined;

    return this.reportsService.update(id, data, foto, req.user);
  }

  // Menghapus laporan (Siswa hanya miliknya sendiri, Admin semua laporan)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SISWA', 'ADMIN')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reportsService.remove(id, req.user);
  }
}
