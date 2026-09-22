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
exports.SolicitudHoraExtraService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const solicitud_hora_extra_entity_1 = require("../entities/solicitud-hora-extra.entity");
const fecha_especial_entity_1 = require("../entities/fecha-especial.entity");
const empleado_entity_1 = require("../entities/empleado.entity");
const LIMITE_DIAS_SEMANALES = 4;
const MINUTOS_BLOQUEO_RECHAZO = 30;
let SolicitudHoraExtraService = class SolicitudHoraExtraService {
    solicitudRepository;
    fechaEspecialRepository;
    dataSource;
    constructor(solicitudRepository, fechaEspecialRepository, dataSource) {
        this.solicitudRepository = solicitudRepository;
        this.fechaEspecialRepository = fechaEspecialRepository;
        this.dataSource = dataSource;
    }
    async create(user, dto) {
        await this.validarFechaTrabajo(user.id, dto.fecha_trabajo);
        try {
            return await this.dataSource.transaction(async (manager) => {
                const solicitudRepo = manager.getRepository(solicitud_hora_extra_entity_1.SolicitudHoraExtra);
                const empleado = await manager.findOne(empleado_entity_1.Empleado, {
                    where: { id_empleado: user.id },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!empleado) {
                    throw new common_1.BadRequestException('El empleado no existe.');
                }
                await this.validarDiasDisponibles(solicitudRepo, user.id, dto.fecha_trabajo);
                const existente = await solicitudRepo.findOne({
                    where: {
                        id_empleado: user.id,
                        fecha_trabajo: dto.fecha_trabajo,
                    },
                });
                if (existente?.estado === 'pendiente' ||
                    existente?.estado === 'aprobada') {
                    throw new common_1.BadRequestException('Ya tienes una solicitud vigente para esta fecha.');
                }
                if (existente) {
                    existente.minutos_solicitados = dto.minutos_solicitados;
                    existente.motivo = dto.motivo.trim();
                    existente.estado = 'pendiente';
                    existente.minutos_autorizados = null;
                    existente.comentario_respuesta = null;
                    existente.id_admin_respuesta = null;
                    existente.fecha_solicitud = new Date();
                    existente.fecha_respuesta = null;
                    existente.activo = true;
                    return solicitudRepo.save(existente);
                }
                const solicitud = solicitudRepo.create({
                    id_empleado: user.id,
                    fecha_trabajo: dto.fecha_trabajo,
                    minutos_solicitados: dto.minutos_solicitados,
                    motivo: dto.motivo.trim(),
                    estado: 'pendiente',
                    minutos_autorizados: null,
                    comentario_respuesta: null,
                    id_admin_respuesta: null,
                    fecha_respuesta: null,
                    activo: true,
                });
                return solicitudRepo.save(solicitud);
            });
        }
        catch (error) {
            const mysqlError = error;
            if (mysqlError.code === 'ER_DUP_ENTRY') {
                throw new common_1.BadRequestException('Ya tienes una solicitud para esta fecha.');
            }
            throw error;
        }
    }
    async respond(id, dto, idAdmin) {
        const solicitud = await this.solicitudRepository.findOne({
            where: { id_solicitud: id, activo: true },
        });
        if (!solicitud) {
            throw new common_1.BadRequestException('La solicitud no existe.');
        }
        if (solicitud.estado !== 'pendiente') {
            throw new common_1.BadRequestException('Solo se pueden responder solicitudes pendientes.');
        }
        if (dto.estado === 'aprobada') {
            if (!dto.minutos_autorizados) {
                throw new common_1.BadRequestException('Debes indicar los minutos autorizados.');
            }
            if (dto.minutos_autorizados > solicitud.minutos_solicitados) {
                throw new common_1.BadRequestException('Los minutos autorizados no pueden superar los minutos solicitados.');
            }
            solicitud.estado = 'aprobada';
            solicitud.minutos_autorizados = dto.minutos_autorizados;
        }
        else {
            if (!dto.comentario_respuesta?.trim()) {
                throw new common_1.BadRequestException('Debes indicar un comentario al rechazar la solicitud.');
            }
            solicitud.estado = 'rechazada';
            solicitud.minutos_autorizados = null;
        }
        solicitud.comentario_respuesta = dto.comentario_respuesta?.trim() || null;
        solicitud.id_admin_respuesta = idAdmin;
        solicitud.fecha_respuesta = new Date();
        return this.solicitudRepository.save(solicitud);
    }
    async cancel(id, user) {
        const solicitud = await this.solicitudRepository.findOne({
            where: {
                id_solicitud: id,
                id_empleado: user.id,
                activo: true,
            },
        });
        if (!solicitud) {
            throw new common_1.BadRequestException('La solicitud no existe.');
        }
        if (solicitud.estado !== 'pendiente') {
            throw new common_1.BadRequestException('Solo puedes cancelar solicitudes pendientes.');
        }
        solicitud.estado = 'cancelada';
        solicitud.fecha_respuesta = new Date();
        return this.solicitudRepository.save(solicitud);
    }
    async getSaldo(idEmpleado) {
        const solicitudes = await this.obtenerSolicitudesSemanales(this.solicitudRepository, idEmpleado, this.formatLocalDateKey(new Date()));
        const solicitudesVigentes = solicitudes.filter((solicitud) => solicitud.estado === 'pendiente' || solicitud.estado === 'aprobada');
        const minutosAprobados = solicitudes
            .filter((solicitud) => solicitud.estado === 'aprobada')
            .reduce((total, solicitud) => total + (solicitud.minutos_autorizados ?? 0), 0);
        const minutosPendientes = solicitudes
            .filter((solicitud) => solicitud.estado === 'pendiente')
            .reduce((total, solicitud) => total + solicitud.minutos_solicitados, 0);
        return {
            limite_dias: LIMITE_DIAS_SEMANALES,
            dias_ocupados: solicitudesVigentes.length,
            dias_disponibles: Math.max(LIMITE_DIAS_SEMANALES - solicitudesVigentes.length, 0),
            minutos_aprobados: minutosAprobados,
            minutos_pendientes: minutosPendientes,
        };
    }
    findMine(idEmpleado) {
        return this.solicitudRepository.find({
            where: {
                id_empleado: idEmpleado,
                activo: true,
                fecha_trabajo: (0, typeorm_2.MoreThanOrEqual)(this.obtenerInicioSemanaActual()),
            },
            order: { fecha_solicitud: 'DESC' },
        });
    }
    findAll() {
        return this.solicitudRepository.find({
            where: {
                activo: true,
                fecha_trabajo: (0, typeorm_2.MoreThanOrEqual)(this.obtenerInicioSemanaActual()),
            },
            relations: {
                empleado: true,
                administrador: true,
            },
            order: { fecha_solicitud: 'DESC' },
        });
    }
    obtenerInicioSemanaActual() {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));
        return this.formatLocalDateKey(lunes);
    }
    async obtenerMinutosAutorizados(idEmpleado, fechaTrabajo) {
        const solicitud = await this.solicitudRepository.findOne({
            where: {
                id_empleado: idEmpleado,
                fecha_trabajo: fechaTrabajo,
                estado: 'aprobada',
                activo: true,
            },
        });
        return solicitud?.minutos_autorizados ?? 0;
    }
    async validarFechaTrabajo(idEmpleado, fechaTrabajo) {
        const hoyKey = this.formatLocalDateKey(new Date());
        if (fechaTrabajo < hoyKey) {
            throw new common_1.BadRequestException('No puedes solicitar horas extra para fechas pasadas.');
        }
        const fecha = this.parseLocalDate(fechaTrabajo);
        const diaSemana = fecha.getDay();
        if (diaSemana === 6) {
            throw new common_1.BadRequestException('Los sábados son jornada de media jornada y no se permiten horas extra.');
        }
        if (diaSemana === 0) {
            throw new common_1.BadRequestException('El domingo no es un día laborable y no se permiten horas extra.');
        }
        const fechaEspecial = await this.fechaEspecialRepository.findOne({
            where: {
                fecha: fechaTrabajo,
                activo: true,
            },
        });
        if (fechaEspecial) {
            throw new common_1.BadRequestException(`El día ${fechaTrabajo} está registrado como fecha especial (${fechaEspecial.nombre}) y no se permiten horas extra.`);
        }
        const rechazo = await this.solicitudRepository.findOne({
            where: {
                id_empleado: idEmpleado,
                fecha_trabajo: fechaTrabajo,
                estado: 'rechazada',
                activo: true,
            },
        });
        if (rechazo?.fecha_respuesta) {
            const minutosDesdeRechazo = (Date.now() - rechazo.fecha_respuesta.getTime()) / 60000;
            if (minutosDesdeRechazo < MINUTOS_BLOQUEO_RECHAZO) {
                throw new common_1.BadRequestException('Tu solicitud para esta fecha fue rechazada. Revisa el comentario del administrador y vuelve a intentarlo después de 30 minutos.');
            }
        }
    }
    async validarDiasDisponibles(repository, idEmpleado, fechaTrabajo) {
        const solicitudes = await this.obtenerSolicitudesSemanales(repository, idEmpleado, fechaTrabajo);
        const diasOcupados = solicitudes.filter((solicitud) => solicitud.estado === 'pendiente' || solicitud.estado === 'aprobada').length;
        if (diasOcupados >= LIMITE_DIAS_SEMANALES) {
            throw new common_1.BadRequestException('Ya utilizaste los 4 días disponibles de horas extra esta semana.');
        }
    }
    async obtenerSolicitudesSemanales(repository, idEmpleado, fechaTrabajo) {
        const { inicio, fin } = this.obtenerRangoSemana(this.parseLocalDate(fechaTrabajo));
        return repository.find({
            where: {
                id_empleado: idEmpleado,
                activo: true,
                fecha_trabajo: (0, typeorm_2.Between)(inicio, fin),
            },
        });
    }
    obtenerRangoSemana(fecha) {
        const diaSemana = fecha.getDay();
        const lunes = new Date(fecha);
        lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
        const sabado = new Date(lunes);
        sabado.setDate(lunes.getDate() + 5);
        return {
            inicio: this.formatLocalDateKey(lunes),
            fin: this.formatLocalDateKey(sabado),
        };
    }
    parseLocalDate(value) {
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
exports.SolicitudHoraExtraService = SolicitudHoraExtraService;
exports.SolicitudHoraExtraService = SolicitudHoraExtraService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(solicitud_hora_extra_entity_1.SolicitudHoraExtra)),
    __param(1, (0, typeorm_1.InjectRepository)(fecha_especial_entity_1.FechaEspecial)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SolicitudHoraExtraService);
//# sourceMappingURL=solicitud-hora-extra.service.js.map