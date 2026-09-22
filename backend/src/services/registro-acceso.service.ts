import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { PuntoAutorizado } from '../entities/punto-autorizado.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { JwtPayload } from '../guards/jwt-auth.guard';
import {
  CreateRegistroAccesoDto,
  CreateRegistroManualDto,
  TipoDireccionManualDto,
  TipoRegistroDto,
} from '../dto/registro-acceso.dto';
import { JornadaResuelta, resolverJornadaPorFecha } from '../utils/jornada';
import { SolicitudHoraExtraService } from './solicitud-hora-extra.service';

type TipoRegistro = 'entrada' | 'salida' | 'salida_comida' | 'regreso_comida';
type EstatusRegistro =
  | 'a_tiempo'
  | 'retardo'
  | 'fuera_de_rango'
  | 'antes_de_tiempo';

const VENTANA_DIAS_LABORABLES = 90;

interface MySqlError {
  code?: string;
}

interface GoogleGeocodeResponse {
  results?: Array<{ formatted_address?: string }>;
}

@Injectable()
export class RegistroAccesoService {
  constructor(
    @InjectRepository(RegistroAcceso)
    private readonly registroRepository: Repository<RegistroAcceso>,
    @InjectRepository(PuntoAutorizado)
    private readonly puntoRepository: Repository<PuntoAutorizado>,
    @InjectRepository(FechaEspecial)
    private readonly fechaEspecialRepository: Repository<FechaEspecial>,
    private readonly solicitudHoraExtraService: SolicitudHoraExtraService,
  ) {}

  async createRegistro(
    user: JwtPayload,
    body: CreateRegistroAccesoDto,
    file?: Express.Multer.File,
  ) {
    const idEmpleado = user.id;
    const tipoRegistro = body.tipo_registro as TipoRegistro;
    const fechaRegistro = new Date();

    const jornada = await this.resolverJornada(fechaRegistro);

    this.validarRegistroSegunJornada(jornada, tipoRegistro);

    await this.validarFlujoDelDia(idEmpleado, tipoRegistro);

    await this.validarRegistroUnicoDelDia(idEmpleado, tipoRegistro);

    const minutosExtensionSalida = await this.obtenerMinutosExtensionSalida(
      jornada,
      idEmpleado,
      fechaRegistro,
    );

    const estatusRegistro = this.obtenerEstatusRegistro(
      tipoRegistro,
      fechaRegistro,
      jornada,
      minutosExtensionSalida,
    );

    if (
      tipoRegistro === 'salida' &&
      minutosExtensionSalida > 0 &&
      estatusRegistro === 'antes_de_tiempo'
    ) {
      throw new BadRequestException(
        'Tienes horas extra aprobadas para hoy. Debes cumplirlas antes de registrar tu salida.',
      );
    }

    const requiereFoto =
      body.tipo_registro === TipoRegistroDto.ENTRADA ||
      body.tipo_registro === TipoRegistroDto.SALIDA;

    if (requiereFoto && !file) {
      throw new BadRequestException(
        'Debes tomar una fotografía para continuar.',
      );
    }

    const latitud = Number(body.latitud);
    const longitud = Number(body.longitud);

    if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
      throw new BadRequestException('La ubicación recibida no es válida.');
    }

    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      throw new BadRequestException(
        'Las coordenadas recibidas no son válidas.',
      );
    }

    const puntoCercano = await this.obtenerPuntoAutorizadoCercano(
      latitud,
      longitud,
    );

    let latitudFinal = latitud;
    let longitudFinal = longitud;
    let direccion: string | null = null;

    if (puntoCercano) {
      latitudFinal = Number(puntoCercano.latitud);
      longitudFinal = Number(puntoCercano.longitud);
      direccion = puntoCercano.direccion_fija;
    } else {
      direccion = await this.obtenerDireccionGoogle(latitud, longitud);
    }

    const registro = this.registroRepository.create({
      tipo_registro: tipoRegistro,
      estatus_registro: estatusRegistro,
      latitud: latitudFinal,
      longitud: longitudFinal,
      direccion,
      fotografia: file?.buffer ?? null,
      id_empleado: idEmpleado,
      fecha_y_hora: fechaRegistro,
    });

    try {
      await this.registroRepository.save(registro);
    } catch (error) {
      console.error('ERROR AL GUARDAR REGISTRO:', error);

      const mysqlError = error as MySqlError;

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        const nombreRegistro = this.obtenerNombreTipoRegistro(
          body.tipo_registro,
        );

        throw new BadRequestException(
          `Ya registraste tu ${nombreRegistro} el día de hoy.`,
        );
      }

      throw error;
    }

    return {
      message: this.obtenerMensajeRegistro(
        registro.tipo_registro,
        registro.estatus_registro,
      ),
      direccion,
      registro: {
        id_registro: registro.id_registro,
        tipo_registro: registro.tipo_registro,
        estatus_registro: registro.estatus_registro,
        latitud: registro.latitud,
        longitud: registro.longitud,
        direccion: registro.direccion,
        fecha_y_hora: registro.fecha_y_hora,
        id_empleado: registro.id_empleado,
      },
    };
  }

  async createRegistroManual(body: CreateRegistroManualDto) {
    if (!body.fecha || !body.hora) {
      throw new BadRequestException('Debes seleccionar fecha y hora.');
    }

    const fechaRegistro = new Date(`${body.fecha}T${body.hora}:00`);

    if (Number.isNaN(fechaRegistro.getTime())) {
      throw new BadRequestException('La fecha y hora no son válidas.');
    }

    const inicioDiaSeleccionado = new Date(fechaRegistro);
    inicioDiaSeleccionado.setHours(0, 0, 0, 0);

    const inicioDiaActual = new Date();
    inicioDiaActual.setHours(0, 0, 0, 0);

    if (inicioDiaSeleccionado.getTime() > inicioDiaActual.getTime()) {
      throw new BadRequestException(
        'No se pueden registrar accesos en fechas futuras.',
      );
    }

    const inicioBusqueda = new Date(inicioDiaActual);
    inicioBusqueda.setDate(inicioBusqueda.getDate() - VENTANA_DIAS_LABORABLES);

    const fechaEspeciales = await this.fechaEspecialRepository.find({
      where: {
        activo: true,
        fecha: Between(
          this.formatearFechaLocal(inicioBusqueda),
          this.formatearFechaLocal(inicioDiaActual),
        ),
      },
    });

    const fechaEspecialPorDia = new Map(
      fechaEspeciales.map((fechaEspecial) => [
        fechaEspecial.fecha,
        fechaEspecial,
      ]),
    );

    const diaLimite = new Date(inicioDiaActual);
    let diasLaborables = 0;
    let diasRevisados = 0;

    while (diasLaborables < 3 && diasRevisados < VENTANA_DIAS_LABORABLES) {
      diaLimite.setDate(diaLimite.getDate() - 1);
      diasRevisados++;

      const jornada = resolverJornadaPorFecha(
        diaLimite,
        fechaEspecialPorDia.get(this.formatearFechaLocal(diaLimite)) ?? null,
      );

      if (jornada.esLaborable) diasLaborables++;
    }

    if (diasLaborables < 3) {
      throw new BadRequestException(
        'No se encontraron suficientes días laborables recientes para el registro manual.',
      );
    }

    if (inicioDiaSeleccionado.getTime() < diaLimite.getTime()) {
      throw new BadRequestException(
        'Solo se permiten registros manuales de los últimos 3 días laborables.',
      );
    }

    const tipoRegistro = body.tipo_registro as TipoRegistro;
    const jornada = await this.resolverJornada(fechaRegistro);

    this.validarRegistroSegunJornada(jornada, tipoRegistro);

    await this.validarRegistroUnicoPorFecha(
      body.id_empleado,
      tipoRegistro,
      fechaRegistro,
    );

    const minutosExtensionSalida = await this.obtenerMinutosExtensionSalida(
      jornada,
      body.id_empleado,
      fechaRegistro,
    );

    const estatusRegistro = this.obtenerEstatusRegistro(
      tipoRegistro,
      fechaRegistro,
      jornada,
      minutosExtensionSalida,
    );

    if (
      tipoRegistro === 'salida' &&
      minutosExtensionSalida > 0 &&
      estatusRegistro === 'antes_de_tiempo'
    ) {
      throw new BadRequestException(
        'El empleado tiene horas extra aprobadas para esa fecha. Debe cumplirlas antes de registrar la salida.',
      );
    }

    let latitud = 0;
    let longitud = 0;
    let direccion = '';

    if (body.tipo_direccion === TipoDireccionManualDto.PUNTO) {
      if (!body.id_punto) {
        throw new BadRequestException('Selecciona un punto autorizado.');
      }

      const punto = await this.puntoRepository.findOne({
        where: {
          id_punto: Number(body.id_punto),
          activo: true,
        },
      });

      if (!punto) {
        throw new BadRequestException(
          'El punto autorizado no existe o está inactivo.',
        );
      }

      latitud = Number(punto.latitud);
      longitud = Number(punto.longitud);
      direccion = punto.direccion_fija;
    } else {
      if (!body.direccion_manual?.trim()) {
        throw new BadRequestException('Escribe la dirección manual.');
      }

      direccion = body.direccion_manual.trim();
    }

    if (body.observacion?.trim()) {
      direccion = `${direccion}. Registro manual por administrador. Motivo: ${body.observacion.trim()}`;
    } else {
      direccion = `${direccion}. Registro manual por administrador.`;
    }

    const registro = this.registroRepository.create({
      tipo_registro: tipoRegistro,
      estatus_registro: estatusRegistro,
      latitud,
      longitud,
      direccion,
      fotografia: null,
      id_empleado: body.id_empleado,
      fecha_y_hora: fechaRegistro,
    });

    try {
      await this.registroRepository.save(registro);
    } catch (error) {
      const mysqlError = error as MySqlError;

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);

        throw new BadRequestException(
          `El empleado ya tiene registrado ${nombreRegistro} en esa fecha.`,
        );
      }

      throw error;
    }

    return {
      message: 'Registro manual guardado correctamente.',
      registro,
    };
  }

  async getRegistrosManualesDeHoy() {
    const { inicioDia, finDia } = this.obtenerRangoDiaActual();

    const registros = await this.registroRepository.find({
      where: {
        fecha_y_hora: Between(inicioDia, finDia),
        direccion: Like('%Registro manual por administrador%'),
      },
      relations: { empleado: true },
      order: { fecha_y_hora: 'DESC' },
    });

    return registros.map((registro) => ({
      id_registro: registro.id_registro,
      tipo_registro: registro.tipo_registro,
      fecha_y_hora: registro.fecha_y_hora,
      direccion: registro.direccion,
      empleado: {
        id_empleado: registro.empleado.id_empleado,
        nombre: registro.empleado.nombre,
        apellido_paterno: registro.empleado.apellido_paterno,
      },
    }));
  }

  private async validarRegistroUnicoPorFecha(
    idEmpleado: number,
    tipoRegistro: TipoRegistro,
    fecha: Date,
  ) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const registroExistente = await this.registroRepository.findOne({
      where: {
        id_empleado: idEmpleado,
        tipo_registro: tipoRegistro,
        fecha_y_hora: Between(inicioDia, finDia),
      },
    });

    if (registroExistente) {
      const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);

      throw new BadRequestException(
        `El empleado ya tiene registrado ${nombreRegistro} en esa fecha.`,
      );
    }
  }

  private obtenerEstatusRegistro(
    tipoRegistro: TipoRegistro,
    fecha: Date,
    jornada: JornadaResuelta,
    minutosExtensionSalida = 0,
  ): EstatusRegistro | null {
    const minutos = fecha.getHours() * 60 + fecha.getMinutes();

    if (
      jornada.entradaInicio === null ||
      jornada.entradaFin === null ||
      jornada.salidaInicio === null ||
      jornada.salidaFin === null
    ) {
      throw new BadRequestException(
        'La jornada no tiene horarios válidos configurados.',
      );
    }

    if (tipoRegistro === 'entrada') {
      if (minutos < jornada.entradaInicio) {
        throw new BadRequestException(
          `La entrada solo puede registrarse a partir de las ${this.formatearMinutos(jornada.entradaInicio)}.`,
        );
      }

      return minutos <= jornada.entradaFin ? 'a_tiempo' : 'retardo';
    }

    if (tipoRegistro === 'salida') {
      if (minutos < jornada.salidaInicio + minutosExtensionSalida) {
        return 'antes_de_tiempo';
      }

      if (minutos > jornada.salidaFin + minutosExtensionSalida) {
        return 'fuera_de_rango';
      }

      return 'a_tiempo';
    }

    return null;
  }

  private async obtenerMinutosExtensionSalida(
    jornada: JornadaResuelta,
    idEmpleado: number,
    fecha: Date,
  ): Promise<number> {
    if (!jornada.permiteExtensionHorasExtras) {
      return 0;
    }

    return this.solicitudHoraExtraService.obtenerMinutosAutorizados(
      idEmpleado,
      this.formatearFechaLocal(fecha),
    );
  }

  private formatearMinutos(totalMinutos: number): string {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  private obtenerMensajeRegistro(
    tipoRegistro: TipoRegistro,
    estatusRegistro: EstatusRegistro | null,
  ) {
    if (tipoRegistro === 'entrada' && estatusRegistro === 'retardo') {
      return 'Entrada registrada correctamente con retardo.';
    }

    if (tipoRegistro === 'salida' && estatusRegistro === 'antes_de_tiempo') {
      return 'Salida registrada correctamente antes del tiempo establecido.';
    }

    if (tipoRegistro === 'salida' && estatusRegistro === 'fuera_de_rango') {
      return 'Salida registrada correctamente fuera del rango establecido.';
    }

    return 'Registro de acceso guardado correctamente.';
  }

  private async validarFlujoDelDia(
    idEmpleado: number,
    tipoRegistro: TipoRegistro,
  ) {
    if (tipoRegistro === 'entrada') {
      return;
    }

    const { inicioDia, finDia } = this.obtenerRangoDiaActual();

    const entradaHoy = await this.registroRepository.findOne({
      where: {
        id_empleado: idEmpleado,
        tipo_registro: 'entrada',
        fecha_y_hora: Between(inicioDia, finDia),
      },
    });

    if (!entradaHoy) {
      throw new BadRequestException(
        'Primero debes registrar tu entrada del día antes de registrar comida o salida.',
      );
    }
  }

  private async validarRegistroUnicoDelDia(
    idEmpleado: number,
    tipoRegistro: TipoRegistro,
  ) {
    const { inicioDia, finDia } = this.obtenerRangoDiaActual();

    const registroExistente = await this.registroRepository.findOne({
      where: {
        id_empleado: idEmpleado,
        tipo_registro: tipoRegistro,
        fecha_y_hora: Between(inicioDia, finDia),
      },
    });

    if (registroExistente) {
      const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);

      throw new BadRequestException(
        `Ya registraste tu ${nombreRegistro} el día de hoy.`,
      );
    }
  }

  private obtenerRangoDiaActual() {
    const ahora = new Date();

    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(ahora);
    finDia.setHours(23, 59, 59, 999);

    return { inicioDia, finDia };
  }

  private obtenerNombreTipoRegistro(tipoRegistro: TipoRegistro) {
    const nombres: Record<TipoRegistro, string> = {
      entrada: 'entrada',
      salida: 'salida',
      salida_comida: 'salida a comida',
      regreso_comida: 'regreso de comida',
    };

    return nombres[tipoRegistro];
  }

  private async obtenerPuntoAutorizadoCercano(
    latitud: number,
    longitud: number,
  ): Promise<PuntoAutorizado | null> {
    const puntos = await this.puntoRepository.find({
      where: { activo: true },
    });

    const puntoEncontrado = puntos.find((punto) => {
      const distancia = this.calcularDistanciaMetros(
        latitud,
        longitud,
        Number(punto.latitud),
        Number(punto.longitud),
      );

      return distancia <= punto.radio_metros;
    });

    return puntoEncontrado ?? null;
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

  private async obtenerDireccionGoogle(
    latitud: number,
    longitud: number,
  ): Promise<string | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=${apiKey}&language=es`;

    try {
      const response = await fetch(url);
      const data = (await response.json()) as GoogleGeocodeResponse;

      return data.results?.[0]?.formatted_address ?? null;
    } catch (error) {
      console.error('ERROR AL OBTENER DIRECCIÓN:', error);
      return null;
    }
  }

  private async resolverJornada(fecha: Date): Promise<JornadaResuelta> {
    const fechaTexto = this.formatearFechaLocal(fecha);

    const fechaEspecial = await this.fechaEspecialRepository.findOne({
      where: {
        fecha: fechaTexto,
        activo: true,
      },
    });

    if (
      fechaEspecial &&
      fechaEspecial.tipo_jornada !== 'no_laborable' &&
      (fechaEspecial.hora_inicio_entrada === null ||
        fechaEspecial.hora_fin_entrada === null ||
        fechaEspecial.hora_inicio_salida === null ||
        fechaEspecial.hora_fin_salida === null)
    ) {
      throw new BadRequestException(
        `La fecha especial ${fechaEspecial.nombre} no tiene horarios válidos configurados.`,
      );
    }

    return resolverJornadaPorFecha(fecha, fechaEspecial);
  }

  private formatearFechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private validarRegistroSegunJornada(
    jornada: JornadaResuelta,
    tipoRegistro: TipoRegistro,
  ) {
    if (!jornada.esLaborable) {
      throw new BadRequestException(
        `No se pueden realizar registros porque el día no es laborable: ${jornada.nombre}.`,
      );
    }

    const esRegistroComida =
      tipoRegistro === 'salida_comida' || tipoRegistro === 'regreso_comida';

    if (esRegistroComida && !jornada.requiereComida) {
      throw new BadRequestException(
        'Esta jornada no requiere registros de salida o regreso de comida.',
      );
    }
  }
}
