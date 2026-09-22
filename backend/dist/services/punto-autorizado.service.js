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
exports.PuntoAutorizadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const punto_autorizado_entity_1 = require("../entities/punto-autorizado.entity");
let PuntoAutorizadoService = class PuntoAutorizadoService {
    puntoRepository;
    constructor(puntoRepository) {
        this.puntoRepository = puntoRepository;
    }
    findAll() {
        return this.puntoRepository.find({
            order: { id_punto: 'DESC' },
        });
    }
    async create(data) {
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
    async updateStatus(id, activo) {
        const punto = await this.puntoRepository.findOne({
            where: { id_punto: id },
        });
        if (!punto) {
            throw new common_1.BadRequestException('El punto autorizado no existe.');
        }
        punto.activo = activo;
        return this.puntoRepository.save(punto);
    }
    async delete(id) {
        const punto = await this.puntoRepository.findOne({
            where: { id_punto: id },
        });
        if (!punto) {
            throw new common_1.BadRequestException('El punto autorizado no existe.');
        }
        await this.puntoRepository.remove(punto);
        return {
            message: 'Punto autorizado eliminado correctamente.',
        };
    }
    async resolveLocation(latitud, longitud) {
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
    async obtenerPuntoAutorizadoCercano(latitud, longitud) {
        const puntos = await this.puntoRepository.find({
            where: { activo: true },
        });
        return puntos.find((punto) => {
            const distancia = this.calcularDistanciaMetros(latitud, longitud, Number(punto.latitud), Number(punto.longitud));
            return distancia <= punto.radio_metros;
        });
    }
    calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
        const radioTierra = 6371000;
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radioTierra * c;
    }
};
exports.PuntoAutorizadoService = PuntoAutorizadoService;
exports.PuntoAutorizadoService = PuntoAutorizadoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(punto_autorizado_entity_1.PuntoAutorizado)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PuntoAutorizadoService);
//# sourceMappingURL=punto-autorizado.service.js.map