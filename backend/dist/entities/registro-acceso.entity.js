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
exports.RegistroAcceso = void 0;
const typeorm_1 = require("typeorm");
const empleado_entity_1 = require("./empleado.entity");
let RegistroAcceso = class RegistroAcceso {
    id_registro;
    fotografia;
    latitud;
    longitud;
    direccion;
    tipo_registro;
    estatus_registro;
    fecha_y_hora;
    id_empleado;
    fecha_registro;
    empleado;
};
exports.RegistroAcceso = RegistroAcceso;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RegistroAcceso.prototype, "id_registro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longblob', nullable: true, select: false }),
    __metadata("design:type", Object)
], RegistroAcceso.prototype, "fotografia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], RegistroAcceso.prototype, "latitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], RegistroAcceso.prototype, "longitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], RegistroAcceso.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['entrada', 'salida', 'salida_comida', 'regreso_comida'],
    }),
    __metadata("design:type", String)
], RegistroAcceso.prototype, "tipo_registro", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['a_tiempo', 'retardo', 'fuera_de_rango', 'antes_de_tiempo'],
        nullable: true,
    }),
    __metadata("design:type", Object)
], RegistroAcceso.prototype, "estatus_registro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RegistroAcceso.prototype, "fecha_y_hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RegistroAcceso.prototype, "id_empleado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        insert: false,
        update: false,
    }),
    __metadata("design:type", Object)
], RegistroAcceso.prototype, "fecha_registro", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empleado_entity_1.Empleado),
    (0, typeorm_1.JoinColumn)({ name: 'id_empleado' }),
    __metadata("design:type", empleado_entity_1.Empleado)
], RegistroAcceso.prototype, "empleado", void 0);
exports.RegistroAcceso = RegistroAcceso = __decorate([
    (0, typeorm_1.Entity)('registro_de_acceso')
], RegistroAcceso);
//# sourceMappingURL=registro-acceso.entity.js.map