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
exports.SolicitudHoraExtra = void 0;
const typeorm_1 = require("typeorm");
const empleado_entity_1 = require("./empleado.entity");
const administrador_entity_1 = require("./administrador.entity");
let SolicitudHoraExtra = class SolicitudHoraExtra {
    id_solicitud;
    id_empleado;
    fecha_trabajo;
    minutos_solicitados;
    motivo;
    estado;
    minutos_autorizados;
    comentario_respuesta;
    id_admin_respuesta;
    fecha_solicitud;
    fecha_respuesta;
    activo;
    created_at;
    updated_at;
    empleado;
    administrador;
};
exports.SolicitudHoraExtra = SolicitudHoraExtra;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SolicitudHoraExtra.prototype, "id_solicitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SolicitudHoraExtra.prototype, "id_empleado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], SolicitudHoraExtra.prototype, "fecha_trabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', unsigned: true }),
    __metadata("design:type", Number)
], SolicitudHoraExtra.prototype, "minutos_solicitados", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], SolicitudHoraExtra.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pendiente', 'aprobada', 'rechazada', 'cancelada'],
        default: 'pendiente',
    }),
    __metadata("design:type", String)
], SolicitudHoraExtra.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], SolicitudHoraExtra.prototype, "minutos_autorizados", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], SolicitudHoraExtra.prototype, "comentario_respuesta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], SolicitudHoraExtra.prototype, "id_admin_respuesta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SolicitudHoraExtra.prototype, "fecha_solicitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], SolicitudHoraExtra.prototype, "fecha_respuesta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SolicitudHoraExtra.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SolicitudHoraExtra.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SolicitudHoraExtra.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empleado_entity_1.Empleado, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_empleado' }),
    __metadata("design:type", empleado_entity_1.Empleado)
], SolicitudHoraExtra.prototype, "empleado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => administrador_entity_1.Administrador, {
        nullable: true,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_admin_respuesta' }),
    __metadata("design:type", Object)
], SolicitudHoraExtra.prototype, "administrador", void 0);
exports.SolicitudHoraExtra = SolicitudHoraExtra = __decorate([
    (0, typeorm_1.Entity)('solicitud_hora_extra')
], SolicitudHoraExtra);
//# sourceMappingURL=solicitud-hora-extra.entity.js.map