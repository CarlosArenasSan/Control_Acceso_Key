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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuntoAutorizado = void 0;
const typeorm_1 = require("typeorm");
let PuntoAutorizado = class PuntoAutorizado {
    id_punto;
    nombre;
    latitud;
    longitud;
    radio_metros;
    direccion_fija;
    activo;
    created_at;
};
exports.PuntoAutorizado = PuntoAutorizado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PuntoAutorizado.prototype, "id_punto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PuntoAutorizado.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], PuntoAutorizado.prototype, "latitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], PuntoAutorizado.prototype, "longitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 250 }),
    __metadata("design:type", Number)
], PuntoAutorizado.prototype, "radio_metros", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PuntoAutorizado.prototype, "direccion_fija", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PuntoAutorizado.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PuntoAutorizado.prototype, "created_at", void 0);
exports.PuntoAutorizado = PuntoAutorizado = __decorate([
    (0, typeorm_1.Entity)('punto_autorizado')
], PuntoAutorizado);
//# sourceMappingURL=punto-autorizado.entity.js.map