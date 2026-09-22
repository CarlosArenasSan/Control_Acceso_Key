import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import type { Response } from 'express';
import { Repository } from 'typeorm';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { RegistroAccesoService } from '../services/registro-acceso.service';
import { AdminGuard } from '../guards/admin.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { EmpleadoGuard } from '../guards/empleado.guard';
import {
  CreateRegistroAccesoDto,
  CreateRegistroManualDto,
} from '../dto/registro-acceso.dto';
import 'multer';

@Controller('registro-acceso')
export class RegistroAccesoRoute {
  constructor(
    private readonly registroService: RegistroAccesoService,
    @InjectRepository(RegistroAcceso)
    private readonly registroRepository: Repository<RegistroAcceso>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmpleadoGuard)
  @UseInterceptors(
    FileInterceptor('fotografia', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Formato de imagen no permitido. Usa JPG, PNG o WEBP.',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateRegistroAccesoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.registroService.createRegistro(user, body, file);
  }

  @Get(':id/foto')
  @UseGuards(AdminGuard)
  async getFoto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const registro = await this.registroRepository
      .createQueryBuilder('registro')
      .addSelect('registro.fotografia')
      .where('registro.id_registro = :id', { id })
      .getOne();

    if (!registro?.fotografia) {
      return res.status(404).send('Sin fotografía');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-store');

    return res.send(registro.fotografia);
  }

  @Get('manual/hoy')
  @UseGuards(AdminGuard)
  getRegistrosManualesDeHoy() {
    return this.registroService.getRegistrosManualesDeHoy();
  }

  @Post('manual')
  @UseGuards(AdminGuard)
  createManual(@Body() body: CreateRegistroManualDto) {
    return this.registroService.createRegistroManual(body);
  }
}
