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
exports.CreateRegistroManualDto = exports.CreateRegistroAccesoDto = exports.TipoDireccionManualDto = exports.TipoRegistroDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoRegistroDto;
(function (TipoRegistroDto) {
    TipoRegistroDto["ENTRADA"] = "entrada";
    TipoRegistroDto["SALIDA"] = "salida";
    TipoRegistroDto["SALIDA_COMIDA"] = "salida_comida";
    TipoRegistroDto["REGRESO_COMIDA"] = "regreso_comida";
})(TipoRegistroDto || (exports.TipoRegistroDto = TipoRegistroDto = {}));
var TipoDireccionManualDto;
(function (TipoDireccionManualDto) {
    TipoDireccionManualDto["MANUAL"] = "manual";
    TipoDireccionManualDto["PUNTO"] = "punto";
})(TipoDireccionManualDto || (exports.TipoDireccionManualDto = TipoDireccionManualDto = {}));
class CreateRegistroAccesoDto {
    tipo_registro;
    latitud;
    longitud;
}
exports.CreateRegistroAccesoDto = CreateRegistroAccesoDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoRegistroDto, {
        message: 'El tipo de registro debe ser entrada, salida, salida_comida o regreso_comida.',
    }),
    __metadata("design:type", String)
], CreateRegistroAccesoDto.prototype, "tipo_registro", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLatitude)({ message: 'La latitud no es válida.' }),
    __metadata("design:type", Number)
], CreateRegistroAccesoDto.prototype, "latitud", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLongitude)({ message: 'La longitud no es válida.' }),
    __metadata("design:type", Number)
], CreateRegistroAccesoDto.prototype, "longitud", void 0);
class CreateRegistroManualDto {
    id_empleado;
    tipo_registro;
    fecha;
    hora;
    tipo_direccion;
    id_punto;
    direccion_manual;
    observacion;
}
exports.CreateRegistroManualDto = CreateRegistroManualDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'El ID del empleado debe ser un número entero.' }),
    (0, class_validator_1.Min)(1, { message: 'El ID del empleado debe ser mayor a 0.' }),
    __metadata("design:type", Number)
], CreateRegistroManualDto.prototype, "id_empleado", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoRegistroDto, {
        message: 'El tipo de registro debe ser entrada, salida, salida_comida o regreso_comida.',
    }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "tipo_registro", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha no es válida.' }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'La hora debe tener formato HH:mm.',
    }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "hora", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoDireccionManualDto, {
        message: 'El tipo de dirección debe ser manual o punto.',
    }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "tipo_direccion", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((body) => body.tipo_direccion === TipoDireccionManualDto.PUNTO),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'El punto autorizado debe ser un número entero.' }),
    (0, class_validator_1.Min)(1, { message: 'Selecciona un punto autorizado válido.' }),
    __metadata("design:type", Number)
], CreateRegistroManualDto.prototype, "id_punto", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((body) => body.tipo_direccion === TipoDireccionManualDto.MANUAL),
    (0, class_validator_1.IsString)({ message: 'La dirección manual debe ser texto.' }),
    (0, class_validator_1.Length)(1, 255, {
        message: 'La dirección manual debe tener entre 1 y 255 caracteres.',
    }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "direccion_manual", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La observación debe ser texto.' }),
    (0, class_validator_1.Length)(0, 255, {
        message: 'La observación no puede exceder 255 caracteres.',
    }),
    __metadata("design:type", String)
], CreateRegistroManualDto.prototype, "observacion", void 0);
//# sourceMappingURL=registro-acceso.dto.js.map