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
exports.FechaEspecial = void 0;
const typeorm_1 = require("typeorm");
const administrador_entity_1 = require("./administrador.entity");
let FechaEspecial = class FechaEspecial {
    id_fecha_especial;
    fecha;
    nombre;
    tipo_jornada;
    hora_inicio_entrada;
    hora_fin_entrada;
    hora_inicio_salida;
    hora_fin_salida;
    requiere_comida;
    observaciones;
    activo;
    id_admin;
    created_at;
    updated_at;
    administrador;
};
exports.FechaEspecial = FechaEspecial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FechaEspecial.prototype, "id_fecha_especial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', unique: true }),
    __metadata("design:type", String)
], FechaEspecial.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], FechaEspecial.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['jornada_completa', 'media_jornada', 'no_laborable'],
    }),
    __metadata("design:type", String)
], FechaEspecial.prototype, "tipo_jornada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", Object)
], FechaEspecial.prototype, "hora_inicio_entrada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", Object)
], FechaEspecial.prototype, "hora_fin_entrada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", Object)
], FechaEspecial.prototype, "hora_inicio_salida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", Object)
], FechaEspecial.prototype, "hora_fin_salida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], FechaEspecial.prototype, "requiere_comida", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], FechaEspecial.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], FechaEspecial.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], FechaEspecial.prototype, "id_admin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], FechaEspecial.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], FechaEspecial.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => administrador_entity_1.Administrador, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_admin' }),
    __metadata("design:type", administrador_entity_1.Administrador)
], FechaEspecial.prototype, "administrador", void 0);
exports.FechaEspecial = FechaEspecial = __decorate([
    (0, typeorm_1.Entity)('fecha_especial')
], FechaEspecial);
//# sourceMappingURL=fecha-especial.entity.js.map