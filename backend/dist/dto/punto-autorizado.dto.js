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
exports.ResolveLocationDto = exports.UpdatePuntoStatusDto = exports.CreatePuntoAutorizadoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePuntoAutorizadoDto {
    nombre;
    latitud;
    longitud;
    radio_metros;
    direccion_fija;
    activo;
}
exports.CreatePuntoAutorizadoDto = CreatePuntoAutorizadoDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.Length)(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' }),
    __metadata("design:type", String)
], CreatePuntoAutorizadoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLatitude)({ message: 'La latitud no es válida.' }),
    __metadata("design:type", Number)
], CreatePuntoAutorizadoDto.prototype, "latitud", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLongitude)({ message: 'La longitud no es válida.' }),
    __metadata("design:type", Number)
], CreatePuntoAutorizadoDto.prototype, "longitud", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'El radio debe ser un número entero.' }),
    (0, class_validator_1.Min)(1, { message: 'El radio debe ser mayor a 0 metros.' }),
    (0, class_validator_1.Max)(10000, { message: 'El radio no puede ser mayor a 10,000 metros.' }),
    __metadata("design:type", Number)
], CreatePuntoAutorizadoDto.prototype, "radio_metros", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser texto.' }),
    (0, class_validator_1.Length)(1, 255, {
        message: 'La dirección debe tener entre 1 y 255 caracteres.',
    }),
    __metadata("design:type", String)
], CreatePuntoAutorizadoDto.prototype, "direccion_fija", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], CreatePuntoAutorizadoDto.prototype, "activo", void 0);
class UpdatePuntoStatusDto {
    activo;
}
exports.UpdatePuntoStatusDto = UpdatePuntoStatusDto;
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'El campo activo debe ser verdadero o falso.' }),
    __metadata("design:type", Boolean)
], UpdatePuntoStatusDto.prototype, "activo", void 0);
class ResolveLocationDto {
    latitud;
    longitud;
}
exports.ResolveLocationDto = ResolveLocationDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLatitude)({ message: 'La latitud no es válida.' }),
    __metadata("design:type", Number)
], ResolveLocationDto.prototype, "latitud", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLongitude)({ message: 'La longitud no es válida.' }),
    __metadata("design:type", Number)
], ResolveLocationDto.prototype, "longitud", void 0);
//# sourceMappingURL=punto-autorizado.dto.js.map