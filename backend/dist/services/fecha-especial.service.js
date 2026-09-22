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
exports.FechaEspecialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fecha_especial_entity_1 = require("../entities/fecha-especial.entity");
const HORARIOS_JORNADA = {
    jornada_completa: {
        hora_inicio_entrada: '08:50:00',
        hora_fin_entrada: '09:10:00',
        hora_inicio_salida: '18:30:00',
        hora_fin_salida: '19:10:00',
        requiere_comida: true,
    },
    media_jornada: {
        hora_inicio_entrada: '08:50:00',
        hora_fin_entrada: '09:10:00',
        hora_inicio_salida: '13:30:00',
        hora_fin_salida: '14:10:00',
        requiere_comida: false,
    },
    no_laborable: {
        hora_inicio_entrada: null,
        hora_fin_entrada: null,
        hora_inicio_salida: null,
        hora_fin_salida: null,
        requiere_comida: false,
    },
};
let FechaEspecialService = class FechaEspecialService {
    fechaRepository;
    constructor(fechaRepository) {
        this.fechaRepository = fechaRepository;
    }
    findAll() {
        return this.fechaRepository.find({
            order: { fecha: 'DESC' },
        });
    }
    async create(data, idAdmin) {
        const existe = await this.fechaRepository.findOne({
            where: { fecha: data.fecha },
        });
        if (existe) {
            throw new common_1.BadRequestException('Ya existe una fecha especial para este día. Edita y reactiva el registro existente.');
        }
        const horario = HORARIOS_JORNADA[data.tipo_jornada];
        const fecha = this.fechaRepository.create({
            fecha: data.fecha,
            nombre: data.nombre.trim(),
            tipo_jornada: data.tipo_jornada,
            observaciones: data.observaciones?.trim() || null,
            activo: data.activo ?? true,
            id_admin: idAdmin,
            ...horario,
        });
        return this.fechaRepository.save(fecha);
    }
    async update(id, data) {
        const fecha = await this.fechaRepository.findOne({
            where: { id_fecha_especial: id },
        });
        if (!fecha) {
            throw new common_1.BadRequestException('La fecha especial no existe.');
        }
        if (data.nombre !== undefined) {
            fecha.nombre = data.nombre.trim();
        }
        if (data.observaciones !== undefined) {
            fecha.observaciones = data.observaciones.trim() || null;
        }
        if (data.tipo_jornada !== undefined) {
            fecha.tipo_jornada = data.tipo_jornada;
            const horario = HORARIOS_JORNADA[data.tipo_jornada];
            fecha.hora_inicio_entrada = horario.hora_inicio_entrada;
            fecha.hora_fin_entrada = horario.hora_fin_entrada;
            fecha.hora_inicio_salida = horario.hora_inicio_salida;
            fecha.hora_fin_salida = horario.hora_fin_salida;
            fecha.requiere_comida = horario.requiere_comida;
        }
        return this.fechaRepository.save(fecha);
    }
    async updateStatus(id, activo) {
        const fecha = await this.fechaRepository.findOne({
            where: { id_fecha_especial: id },
        });
        if (!fecha) {
            throw new common_1.BadRequestException('La fecha especial no existe.');
        }
        fecha.activo = activo;
        return this.fechaRepository.save(fecha);
    }
};
exports.FechaEspecialService = FechaEspecialService;
exports.FechaEspecialService = FechaEspecialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fecha_especial_entity_1.FechaEspecial)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FechaEspecialService);
//# sourceMappingURL=fecha-especial.service.js.map