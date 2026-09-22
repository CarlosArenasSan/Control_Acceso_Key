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
exports.UpdateEmpleadoDto = exports.CreateEmpleadoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateEmpleadoDto {
    id_empleado;
    nombre;
    apellido_paterno;
    apellido_materno;
    username;
    password;
    activo;
}
exports.CreateEmpleadoDto = CreateEmpleadoDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'El ID del empleado debe ser un número entero.' }),
    (0, class_validator_1.Min)(1, { message: 'El ID del empleado debe ser mayor a 0.' }),
    __metadata("design:type", Number)
], CreateEmpleadoDto.prototype, "id_empleado", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' }),
    __metadata("design:type", String)
], CreateEmpleadoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El apellido paterno debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, {
        message: 'El apellido paterno debe tener entre 1 y 100 caracteres.',
    }),
    __metadata("design:type", String)
], CreateEmpleadoDto.prototype, "apellido_paterno", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El apellido materno debe ser texto.' }),
    (0, class_validator_1.Length)(0, 100, {
        message: 'El apellido materno no puede exceder 100 caracteres.',
    }),
    __metadata("design:type", String)
], CreateEmpleadoDto.prototype, "apellido_materno", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El usuario debe ser texto.' }),
    (0, class_validator_1.Length)(3, 50, {
        message: 'El usuario debe tener entre 3 y 50 caracteres.',
    }),
    __metadata("design:type", String)
], CreateEmpleadoDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La contraseña debe ser texto.' }),
    (0, class_validator_1.Length)(8, 100, {
        message: 'La contraseña debe tener mínimo 8 caracteres.',
    }),
    __metadata("design:type", String)
], CreateEmpleadoDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], CreateEmpleadoDto.prototype, "activo", void 0);
class UpdateEmpleadoDto {
    nombre;
    apellido_paterno;
    apellido_materno;
    username;
    password;
    activo;
}
exports.UpdateEmpleadoDto = UpdateEmpleadoDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' }),
    __metadata("design:type", String)
], UpdateEmpleadoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El apellido paterno debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, {
        message: 'El apellido paterno debe tener entre 1 y 100 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateEmpleadoDto.prototype, "apellido_paterno", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El apellido materno debe ser texto.' }),
    (0, class_validator_1.Length)(0, 100, {
        message: 'El apellido materno no puede exceder 100 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateEmpleadoDto.prototype, "apellido_materno", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El usuario debe ser texto.' }),
    (0, class_validator_1.Length)(3, 50, {
        message: 'El usuario debe tener entre 3 y 50 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateEmpleadoDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La contraseña debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, {
        message: 'La contraseña debe tener mínimo 8 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateEmpleadoDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], UpdateEmpleadoDto.prototype, "activo", void 0);
//# sourceMappingURL=empleado.dto.js.map