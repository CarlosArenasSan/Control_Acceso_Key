"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistroHistorialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empleado_entity_1 = require("../entities/empleado.entity");
const registro_acceso_entity_1 = require("../entities/registro-acceso.entity");
const fecha_especial_entity_1 = require("../entities/fecha-especial.entity");
const solicitud_hora_extra_entity_1 = require("../entities/solicitud-hora-extra.entity");
const jornada_1 = require("../utils/jornada");
const MAX_RANGE_DAYS = 90;
const MAX_MINUTOS_COMIDA = 65;
let RegistroHistorialService = class RegistroHistorialService {
    registroRepository;
    empleadoRepository;
    fechaEspecialRepository;
    solicitudHoraExtraRepository;
    constructor(registroRepository, empleadoRepository, fechaEspecialRepository, solicitudHoraExtraRepository) {
        this.registroRepository = registroRepository;
        this.empleadoRepository = empleadoRepository;
        this.fechaEspecialRepository = fechaEspecialRepository;
        this.solicitudHoraExtraRepository = solicitudHoraExtraRepository;
    }
    async findHistory(filters) {
        const desde = this.parseLocalDate(filters.desde);
        desde.setHours(0, 0, 0, 0);
        const hasta = this.parseLocalDate(filters.hasta);
        hasta.setHours(23, 59, 59, 999);
        if (desde.getTime() > hasta.getTime()) {
            throw new common_1.BadRequestException('La fecha "desde" no puede ser posterior a "hasta".');
        }
        const desdeDia = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
        const hastaDia = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
        const hoyInicio = new Date();
        hoyInicio.setHours(0, 0, 0, 0);
        if (hastaDia.getTime() > hoyInicio.getTime()) {
            throw new common_1.BadRequestException('La fecha "hasta" no puede ser posterior a hoy.');
        }
        const rangoDias = Math.round((hastaDia.getTime() - desdeDia.getTime()) / 86400000) + 1;
        if (rangoDias > MAX_RANGE_DAYS) {
            throw new common_1.BadRequestException(`El rango máximo permitido es de ${MAX_RANGE_DAYS} días.`);
        }
        const whereEmpleado = {};
        if (filters.estadoEmpleado === 'activos') {
            whereEmpleado.activo = true;
        }
        if (filters.estadoEmpleado === 'inactivos') {
            whereEmpleado.activo = false;
        }
        const empleados = await this.empleadoRepository.find({
            where: whereEmpleado,
            order: { id_empleado: 'ASC' },
        });
        const registros = await this.registroRepository.find({
            where: {
                fecha_y_hora: (0, typeorm_2.Between)(desde, hasta),
            },
            relations: {
                empleado: true,
            },
            order: {
                fecha_y_hora: 'ASC',
            },
        });
        const registrosConFoto = new Set((await this.registroRepository.find({
            where: {
                fecha_y_hora: (0, typeorm_2.Between)(desde, hasta),
                fotografia: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
            },
            select: { id_registro: true },
        })).map((registro) => registro.id_registro));
        const fechaEspecialPorDia = await this.obtenerFechaEspecialPorDia(desde, hasta);
        const horasExtraPorDia = await this.obtenerHorasExtraPorDia(desde, hasta);
        const dias = this.obtenerDiasEntre(desde, hasta);
        const rows = [];
        const registrosPorDia = new Map();
        for (const registro of registros) {
            const key = `${registro.id_empleado}|${this.formatLocalDateKey(registro.fecha_y_hora)}`;
            const lista = registrosPorDia.get(key);
            if (lista) {
                lista.push(registro);
            }
            else {
                registrosPorDia.set(key, [registro]);
            }
        }
        for (const empleado of empleados) {
            const nombreCompleto = `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno ?? ''}`.trim();
            if (filters.empleado) {
                const busqueda = filters.empleado.toLowerCase();
                const coincide = nombreCompleto.toLowerCase().includes(busqueda) ||
                    String(empleado.id_empleado).includes(busqueda);
                if (!coincide)
                    continue;
            }
            const fechaAltaEmpleado = this.formatLocalDateKey(empleado.created_at);
            for (const dia of dias) {
                const fechaKey = this.formatLocalDateKey(dia);
                if (fechaKey <= fechaAltaEmpleado) {
                    continue;
                }
                const registrosDia = registrosPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ?? [];
                if (registrosDia.length === 0) {
                    if (!empleado.activo ||
                        !this.esDiaLaborable(dia, fechaEspecialPorDia)) {
                        continue;
                    }
                    if (filters.incidencia !== 'ausencias' &&
                        filters.incidencia !== 'todos') {
                        continue;
                    }
                    rows.push({
                        fecha: fechaKey,
                        empleado: {
                            id_empleado: empleado.id_empleado,
                            nombre: nombreCompleto,
                            activo: empleado.activo,
                        },
                        entrada: null,
                        comida: {
                            salida: null,
                            regreso: null,
                            minutos: null,
                            excedido: false,
                            salidaDireccion: null,
                            salidaGps: null,
                            regresoDireccion: null,
                            regresoGps: null,
                        },
                        salida: null,
                        estadoDia: 'Falta',
                        estadoEmpleado: empleado.activo ? 'Activo' : 'Inactivo',
                        gpsRegistro: null,
                        direccionRegistro: null,
                        incidencias: {
                            retardo: false,
                            excesoComida: false,
                            salidaFueraRango: false,
                            ausencia: true,
                        },
                        horasExtra: horasExtraPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ??
                            null,
                        registros: [],
                    });
                    continue;
                }
                const entrada = registrosDia.find((item) => item.tipo_registro === 'entrada');
                const salidaComida = registrosDia.find((item) => item.tipo_registro === 'salida_comida');
                const regresoComida = registrosDia.find((item) => item.tipo_registro === 'regreso_comida');
                const salida = registrosDia.find((item) => item.tipo_registro === 'salida');
                const minutosComida = salidaComida && regresoComida
                    ? Math.round((regresoComida.fecha_y_hora.getTime() -
                        salidaComida.fecha_y_hora.getTime()) /
                        60000)
                    : null;
                const excesoComida = minutosComida !== null ? minutosComida > MAX_MINUTOS_COMIDA : false;
                const retardo = entrada?.estatus_registro === 'retardo';
                const salidaFueraRango = salida?.estatus_registro === 'fuera_de_rango' ||
                    salida?.estatus_registro === 'antes_de_tiempo';
                let estadoDia = 'Falta';
                if (entrada &&
                    salida &&
                    !retardo &&
                    !excesoComida &&
                    !salidaFueraRango) {
                    estadoDia = 'Día completo';
                }
                else if (entrada) {
                    estadoDia = 'Con incidencia';
                }
                const row = {
                    fecha: fechaKey,
                    empleado: {
                        id_empleado: empleado.id_empleado,
                        nombre: nombreCompleto,
                        activo: empleado.activo,
                    },
                    entrada: entrada
                        ? {
                            id_registro: entrada.id_registro,
                            hora: entrada.fecha_y_hora,
                            estatus: entrada.estatus_registro,
                            direccion: entrada.direccion,
                            latitud: entrada.latitud,
                            longitud: entrada.longitud,
                            tieneFoto: registrosConFoto.has(entrada.id_registro),
                        }
                        : null,
                    comida: {
                        salida: salidaComida?.fecha_y_hora ?? null,
                        regreso: regresoComida?.fecha_y_hora ?? null,
                        minutos: minutosComida,
                        excedido: excesoComida,
                        salidaDireccion: salidaComida?.direccion ?? null,
                        salidaGps: salidaComida
                            ? `${salidaComida.latitud}, ${salidaComida.longitud}`
                            : null,
                        regresoDireccion: regresoComida?.direccion ?? null,
                        regresoGps: regresoComida
                            ? `${regresoComida.latitud}, ${regresoComida.longitud}`
                            : null,
                    },
                    salida: salida
                        ? {
                            id_registro: salida.id_registro,
                            hora: salida.fecha_y_hora,
                            estatus: salida.estatus_registro,
                            direccion: salida.direccion,
                            latitud: salida.latitud,
                            longitud: salida.longitud,
                            tieneFoto: registrosConFoto.has(salida.id_registro),
                        }
                        : null,
                    estadoDia,
                    estadoEmpleado: empleado.activo ? 'Activo' : 'Inactivo',
                    gpsRegistro: entrada
                        ? `${entrada.latitud}, ${entrada.longitud}`
                        : salida
                            ? `${salida.latitud}, ${salida.longitud}`
                            : registrosDia[0]
                                ? `${registrosDia[0].latitud}, ${registrosDia[0].longitud}`
                                : null,
                    direccionRegistro: entrada?.direccion ??
                        salida?.direccion ??
                        registrosDia[0]?.direccion ??
                        null,
                    incidencias: {
                        retardo,
                        excesoComida,
                        salidaFueraRango,
                        ausencia: !entrada,
                    },
                    horasExtra: horasExtraPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ?? null,
                    registros: registrosDia.map((registro) => ({
                        id_registro: registro.id_registro,
                        tipo_registro: registro.tipo_registro,
                        estatus_registro: registro.estatus_registro,
                        fecha_y_hora: registro.fecha_y_hora,
                        direccion: registro.direccion,
                        latitud: registro.latitud,
                        longitud: registro.longitud,
                        tieneFoto: registrosConFoto.has(registro.id_registro),
                    })),
                };
                if (this.pasaFiltroIncidencia(row, filters.incidencia ?? 'todos')) {
                    rows.push(row);
                }
            }
        }
        return rows;
    }
    pasaFiltroIncidencia(row, filtro) {
        if (filtro === 'todos')
            return true;
        if (filtro === 'puntuales')
            return row.estadoDia === 'Día completo';
        if (filtro === 'retardos')
            return row.incidencias.retardo;
        if (filtro === 'exceso_comida')
            return row.incidencias.excesoComida;
        if (filtro === 'salidas_anticipadas') {
            return row.incidencias.salidaFueraRango;
        }
        if (filtro === 'ausencias')
            return row.incidencias.ausencia;
        return true;
    }
    obtenerDiasEntre(desde, hasta) {
        const dias = [];
        const actual = new Date(desde);
        while (actual <= hasta) {
            dias.push(new Date(actual));
            actual.setDate(actual.getDate() + 1);
        }
        return dias;
    }
    async obtenerFechaEspecialPorDia(desde, hasta) {
        const fechaEspeciales = await this.fechaEspecialRepository.find({
            where: {
                activo: true,
                fecha: (0, typeorm_2.Between)(this.formatLocalDateKey(desde), this.formatLocalDateKey(hasta)),
            },
        });
        return new Map(fechaEspeciales.map((fechaEspecial) => [
            fechaEspecial.fecha,
            fechaEspecial,
        ]));
    }
    async obtenerHorasExtraPorDia(desde, hasta) {
        const solicitudes = await this.solicitudHoraExtraRepository.find({
            where: {
                activo: true,
                fecha_trabajo: (0, typeorm_2.Between)(this.formatLocalDateKey(desde), this.formatLocalDateKey(hasta)),
            },
            select: {
                id_empleado: true,
                fecha_trabajo: true,
                minutos_solicitados: true,
                minutos_autorizados: true,
                estado: true,
            },
        });
        return new Map(solicitudes.map((solicitud) => [
            `${solicitud.id_empleado}|${solicitud.fecha_trabajo}`,
            {
                minutos_solicitados: solicitud.minutos_solicitados,
                minutos_autorizados: solicitud.minutos_autorizados,
                estado: solicitud.estado,
            },
        ]));
    }
    esDiaLaborable(fecha, fechaEspecialPorDia) {
        const fechaKey = this.formatLocalDateKey(fecha);
        return (0, jornada_1.resolverJornadaPorFecha)(fecha, fechaEspecialPorDia.get(fechaKey) ?? null).esLaborable;
    }
    parseLocalDate(value) {
        if (!value)
            return new Date();
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    formatLocalDateKey(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
exports.RegistroHistorialService = RegistroHistorialService;
exports.RegistroHistorialService = RegistroHistorialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registro_acceso_entity_1.RegistroAcceso)),
    __param(1, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __param(2, (0, typeorm_1.InjectRepository)(fecha_especial_entity_1.FechaEspecial)),
    __param(3, (0, typeorm_1.InjectRepository)(solicitud_hora_extra_entity_1.SolicitudHoraExtra)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RegistroHistorialService);
//# sourceMappingURL=registro-historial.service.js.map