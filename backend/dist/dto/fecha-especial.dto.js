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
exports.UpdateFechaStatusDto = exports.UpdateFechaEspecialDto = exports.CreateFechaEspecialDto = void 0;
const class_validator_1 = require("class-validator");
const TIPOS_JORNADA = [
    'jornada_completa',
    'media_jornada',
    'no_laborable',
];
class CreateFechaEspecialDto {
    fecha;
    nombre;
    tipo_jornada;
    observaciones;
    activo;
}
exports.CreateFechaEspecialDto = CreateFechaEspecialDto;
__decorate([
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha debe tener el formato YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha no es válida.' }),
    __metadata("design:type", String)
], CreateFechaEspecialDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.Length)(1, 255, {
        message: 'El nombre debe tener entre 1 y 255 caracteres.',
    }),
    __metadata("design:type", String)
], CreateFechaEspecialDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsIn)(TIPOS_JORNADA, { message: 'El tipo de jornada no es válido.' }),
    __metadata("design:type", String)
], CreateFechaEspecialDto.prototype, "tipo_jornada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las observaciones deben ser texto.' }),
    (0, class_validator_1.Length)(0, 255, {
        message: 'Las observaciones no pueden superar los 255 caracteres.',
    }),
    __metadata("design:type", String)
], CreateFechaEspecialDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], CreateFechaEspecialDto.prototype, "activo", void 0);
class UpdateFechaEspecialDto {
    nombre;
    tipo_jornada;
    observaciones;
}
exports.UpdateFechaEspecialDto = UpdateFechaEspecialDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.Length)(1, 255, {
        message: 'El nombre debe tener entre 1 y 255 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateFechaEspecialDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(TIPOS_JORNADA, { message: 'El tipo de jornada no es válido.' }),
    __metadata("design:type", String)
], UpdateFechaEspecialDto.prototype, "tipo_jornada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las observaciones deben ser texto.' }),
    (0, class_validator_1.Length)(0, 255, {
        message: 'Las observaciones no pueden superar los 255 caracteres.',
    }),
    __metadata("design:type", String)
], UpdateFechaEspecialDto.prototype, "observaciones", void 0);
class UpdateFechaStatusDto {
    activo;
}
exports.UpdateFechaStatusDto = UpdateFechaStatusDto;
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], UpdateFechaStatusDto.prototype, "activo", void 0);
//# sourceMappingURL=fecha-especial.dto.js.map