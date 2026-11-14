import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReportDto {
  jenis: string;
  nama: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  status?: string;
}

export type UpdateReportDto = Partial<CreateReportDto>;

interface CurrentUser {
  id: number;
  email: string;
  role: 'SISWA' | 'PETUGAS' | 'ADMIN';
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: CreateReportDto,
    foto: string | undefined,
    user: CurrentUser,
  ) {
    const report = await this.prisma.report.create({
      data: {
        jenis: data.jenis,
        nama: data.nama,
        kategori: data.kategori,
        lokasi: data.lokasi,
        deskripsi: data.deskripsi,
        foto,
        status: data.status,
        userId: user.id,
      },
    });

    return {
      message: 'Laporan berhasil dibuat',
      data: report,
    };
  }

  async update(
    id: number,
    data: UpdateReportDto,
    foto: string | undefined,
    user: CurrentUser,
  ) {
    const existingReport = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    // Siswa hanya boleh mengedit laporan miliknya sendiri
    if (
      user.role === 'SISWA' &&
      existingReport.userId !== user.id
    ) {
      throw new ForbiddenException(
        'Kamu hanya bisa mengedit laporan milikmu sendiri',
      );
    }

    const report = await this.prisma.report.update({
      where: { id },
      data: {
        ...data,
        ...(foto ? { foto } : {}),
      },
    });

    return {
      message: 'Laporan berhasil diperbarui',
      data: report,
    };
  }

  async remove(id: number, user: CurrentUser) {
    const existingReport = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    // Siswa hanya boleh menghapus laporan miliknya sendiri
    if (
      user.role === 'SISWA' &&
      existingReport.userId !== user.id
    ) {
      throw new ForbiddenException(
        'Kamu hanya bisa menghapus laporan milikmu sendiri',
      );
    }

    const report = await this.prisma.report.delete({
      where: { id },
    });

    return {
      message: 'Laporan berhasil dihapus',
      data: report,
    };
  }
}
