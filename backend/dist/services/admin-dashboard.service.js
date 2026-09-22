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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const empleado_entity_1 = require("../entities/empleado.entity");
const registro_acceso_entity_1 = require("../entities/registro-acceso.entity");
const fecha_especial_entity_1 = require("../entities/fecha-especial.entity");
const solicitud_hora_extra_entity_1 = require("../entities/solicitud-hora-extra.entity");
const jornada_1 = require("../utils/jornada");
const MAX_MINUTOS_COMIDA = 65;
let AdminDashboardService = class AdminDashboardService {
    empleadoRepository;
    registroRepository;
    fechaEspecialRepository;
    solicitudHoraExtraRepository;
    constructor(empleadoRepository, registroRepository, fechaEspecialRepository, solicitudHoraExtraRepository) {
        this.empleadoRepository = empleadoRepository;
        this.registroRepository = registroRepository;
        this.fechaEspecialRepository = fechaEspecialRepository;
        this.solicitudHoraExtraRepository = solicitudHoraExtraRepository;
    }
    async getStartPanel() {
        const { inicioDia, finDia } = this.obtenerRangoDiaActual();
        const empleadosActivosHoy = await this.empleadoRepository.find({
            where: { activo: true },
        });
        const empleadosActivosHoyIds = new Set(empleadosActivosHoy.map((empleado) => empleado.id_empleado));
        const empleadosContablesParaAusencia = await this.empleadoRepository.find({
            where: {
                activo: true,
                created_at: (0, typeorm_2.LessThan)(inicioDia),
            },
        });
        const empleadosContablesParaAusenciaIds = new Set(empleadosContablesParaAusencia.map((empleado) => empleado.id_empleado));
        const registrosHoy = await this.registroRepository.find({
            where: {
                fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
            },
            relations: {
                empleado: true,
            },
        });
        const registrosHoyActivos = registrosHoy.filter((registro) => empleadosActivosHoyIds.has(registro.id_empleado));
        const presentes = new Set(registrosHoyActivos
            .filter((registro) => registro.tipo_registro === 'entrada')
            .map((registro) => registro.id_empleado));
        const presentesContablesParaAusencia = new Set(Array.from(presentes).filter((idEmpleado) => empleadosContablesParaAusenciaIds.has(idEmpleado)));
        const retardos = registrosHoyActivos.filter((registro) => registro.tipo_registro === 'entrada' &&
            registro.estatus_registro === 'retardo');
        const salidasComida = registrosHoyActivos.filter((registro) => registro.tipo_registro === 'salida_comida');
        const regresosComida = registrosHoyActivos.filter((registro) => registro.tipo_registro === 'regreso_comida');
        const empleadosEnComida = salidasComida.filter((salida) => {
            return !regresosComida.some((regreso) => regreso.id_empleado === salida.id_empleado);
        });
        const excedidosComida = salidasComida.filter((salida) => {
            const regreso = regresosComida.find((item) => item.id_empleado === salida.id_empleado);
            if (!regreso) {
                return false;
            }
            const minutos = (regreso.fecha_y_hora.getTime() - salida.fecha_y_hora.getTime()) /
                60000;
            return minutos > MAX_MINUTOS_COMIDA;
        });
        const jornadaHoy = (0, jornada_1.resolverJornadaPorFecha)(new Date(), await this.obtenerFechaEspecialDeHoy());
        const horasExtraPorEmpleado = await this.obtenerHorasExtraDeHoy();
        const horasExtraAprobadas = Array.from(horasExtraPorEmpleado.values())
            .filter((solicitud) => solicitud.estado === 'aprobada')
            .reduce((total, solicitud) => total + (solicitud.minutos_autorizados ?? 0), 0);
        const ausencias = !jornadaHoy.esLaborable
            ? 0
            : Math.max(empleadosContablesParaAusencia.length -
                presentesContablesParaAusencia.size, 0);
        return {
            kpis: {
                presentes: presentes.size,
                retardos: retardos.length,
                enComida: empleadosEnComida.length,
                excedidosComida: excedidosComida.length,
                ausencias,
                horasExtraAprobadas,
            },
            puntualidadSemanal: await this.getPuntualidadSemanal(empleadosActivosHoyIds),
            incidencias: this.getIncidencias(registrosHoyActivos, horasExtraPorEmpleado),
        };
    }
    getIncidencias(registrosHoy, horasExtraPorEmpleado = new Map()) {
        return registrosHoy
            .filter((registro) => registro.estatus_registro === 'retardo' ||
            registro.estatus_registro === 'fuera_de_rango' ||
            registro.estatus_registro === 'antes_de_tiempo')
            .map((registro) => ({
            id_registro: registro.id_registro,
            empleado: registro.empleado
                ? `${registro.empleado.nombre} ${registro.empleado.apellido_paterno}`
                : `Empleado ${registro.id_empleado}`,
            tipo: registro.estatus_registro,
            detalle: registro.estatus_registro === 'retardo'
                ? 'Entrada con retardo'
                : registro.estatus_registro === 'antes_de_tiempo'
                    ? 'Salida antes de tiempo'
                    : 'Salida fuera de rango',
            fecha_y_hora: this.formatDateTimeLocal(registro.fecha_y_hora),
            horasExtra: horasExtraPorEmpleado.get(registro.id_empleado) ?? null,
        }));
    }
    async obtenerHorasExtraDeHoy() {
        const solicitudes = await this.solicitudHoraExtraRepository.find({
            where: {
                activo: true,
                fecha_trabajo: this.formatFechaKey(new Date()),
            },
            select: {
                id_empleado: true,
                minutos_solicitados: true,
                minutos_autorizados: true,
                estado: true,
            },
        });
        return new Map(solicitudes.map((solicitud) => [
            solicitud.id_empleado,
            {
                minutos_solicitados: solicitud.minutos_solicitados,
                minutos_autorizados: solicitud.minutos_autorizados,
                estado: solicitud.estado,
            },
        ]));
    }
    async getPuntualidadSemanal(empleadosActivosHoyIds) {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));
        lunes.setHours(0, 0, 0, 0);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        const fechaEspecialPorDia = await this.obtenerFechaEspecialEnRango(lunes, domingo);
        const nombresDias = [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo',
        ];
        const resultados = [];
        for (let index = 0; index < nombresDias.length; index++) {
            const inicioDia = new Date(lunes);
            inicioDia.setDate(lunes.getDate() + index);
            inicioDia.setHours(0, 0, 0, 0);
            const jornada = (0, jornada_1.resolverJornadaPorFecha)(inicioDia, fechaEspecialPorDia.get(this.formatFechaKey(inicioDia)) ?? null);
            if (!jornada.esLaborable) {
                continue;
            }
            const finDia = new Date(inicioDia);
            finDia.setHours(23, 59, 59, 999);
            const registrosDia = await this.registroRepository.find({
                where: {
                    tipo_registro: 'entrada',
                    fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
                },
            });
            const registrosActivosDia = registrosDia.filter((registro) => empleadosActivosHoyIds.has(registro.id_empleado));
            const aTiempo = registrosActivosDia.filter((registro) => registro.estatus_registro === 'a_tiempo').length;
            const retardos = registrosActivosDia.filter((registro) => registro.estatus_registro === 'retardo').length;
            resultados.push({
                dia: nombresDias[index],
                aTiempo,
                retardos,
            });
        }
        return resultados;
    }
    async obtenerFechaEspecialDeHoy() {
        return this.fechaEspecialRepository.findOne({
            where: {
                fecha: this.formatFechaKey(new Date()),
                activo: true,
            },
        });
    }
    async obtenerFechaEspecialEnRango(desde, hasta) {
        const fechaEspeciales = await this.fechaEspecialRepository.find({
            where: {
                activo: true,
                fecha: (0, typeorm_2.Between)(this.formatFechaKey(desde), this.formatFechaKey(hasta)),
            },
        });
        return new Map(fechaEspeciales.map((fechaEspecial) => [
            fechaEspecial.fecha,
            fechaEspecial,
        ]));
    }
    formatFechaKey(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    obtenerRangoDiaActual() {
        const ahora = new Date();
        const inicioDia = new Date(ahora);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(ahora);
        finDia.setHours(23, 59, 59, 999);
        return { inicioDia, finDia };
    }
    formatDateTimeLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hour = String(fecha.getHours()).padStart(2, '0');
        const minute = String(fecha.getMinutes()).padStart(2, '0');
        const second = String(fecha.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __param(1, (0, typeorm_1.InjectRepository)(registro_acceso_entity_1.RegistroAcceso)),
    __param(2, (0, typeorm_1.InjectRepository)(fecha_especial_entity_1.FechaEspecial)),
    __param(3, (0, typeorm_1.InjectRepository)(solicitud_hora_extra_entity_1.SolicitudHoraExtra)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map