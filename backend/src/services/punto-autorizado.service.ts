import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PuntoAutorizado } from '../entities/punto-autorizado.entity';
import { CreatePuntoAutorizadoDto } from '../dto/punto-autorizado.dto';

@Injectable()
export class PuntoAutorizadoService {
  constructor(
    @InjectRepository(PuntoAutorizado)
    private readonly puntoRepository: Repository<PuntoAutorizado>,
  ) {}

  findAll() {
    return this.puntoRepository.find({
      order: { id_punto: 'DESC' },
    });
  }

  async create(data: CreatePuntoAutorizadoDto) {
    const punto = this.puntoRepository.create({
      nombre: data.nombre,
      latitud: data.latitud,
      longitud: data.longitud,
      radio_metros: data.radio_metros,
      direccion_fija: data.direccion_fija,
      activo: data.activo ?? true,
    });

    return this.puntoRepository.save(punto);
  }

  async updateStatus(id: number, activo: boolean) {
    const punto = await this.puntoRepository.findOne({
      where: { id_punto: id },
    });

    if (!punto) {
      throw new BadRequestException('El punto autorizado no existe.');
    }

    punto.activo = activo;

    return this.puntoRepository.save(punto);
  }

  async delete(id: number) {
    const punto = await this.puntoRepository.findOne({
      where: { id_punto: id },
    });

    if (!punto) {
      throw new BadRequestException('El punto autorizado no existe.');
    }

    await this.puntoRepository.remove(punto);

    return {
      message: 'Punto autorizado eliminado correctamente.',
    };
  }

  async resolveLocation(latitud: number, longitud: number) {
    const punto = await this.obtenerPuntoAutorizadoCercano(latitud, longitud);

    if (!punto) {
      return {
        found: false,
        direccion: null,
        punto: null,
      };
    }

    return {
      found: true,
      direccion: punto.direccion_fija,
      punto: {
        id_punto: punto.id_punto,
        nombre: punto.nombre,
        direccion_fija: punto.direccion_fija,
        radio_metros: punto.radio_metros,
      },
    };
  }

  private async obtenerPuntoAutorizadoCercano(
    latitud: number,
    longitud: number,
  ) {
    const puntos = await this.puntoRepository.find({
      where: { activo: true },
    });

    return puntos.find((punto) => {
      const distancia = this.calcularDistanciaMetros(
        latitud,
        longitud,
        Number(punto.latitud),
        Number(punto.longitud),
      );

      return distancia <= punto.radio_metros;
    });
  }

  private calcularDistanciaMetros(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const radioTierra = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radioTierra * c;
  }
}
