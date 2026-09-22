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
exports.ResponderSolicitudHoraExtraDto = exports.CreateSolicitudHoraExtraDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ESTADOS_RESPUESTA = ['aprobada', 'rechazada'];
const MINUTOS_VALIDOS = [60, 120, 180];
class CreateSolicitudHoraExtraDto {
    fecha_trabajo;
    minutos_solicitados;
    motivo;
}
exports.CreateSolicitudHoraExtraDto = CreateSolicitudHoraExtraDto;
__decorate([
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha debe tener el formato YYYY-MM-DD.',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha no es válida.' }),
    __metadata("design:type", String)
], CreateSolicitudHoraExtraDto.prototype, "fecha_trabajo", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Las horas solicitadas no son válidas.' }),
    (0, class_validator_1.IsIn)(MINUTOS_VALIDOS, {
        message: 'Solo puedes solicitar 1, 2 o 3 horas extra.',
    }),
    __metadata("design:type", Number)
], CreateSolicitudHoraExtraDto.prototype, "minutos_solicitados", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El motivo debe ser texto.' }),
    (0, class_validator_1.Length)(1, 500, {
        message: 'El motivo debe tener entre 1 y 500 caracteres.',
    }),
    __metadata("design:type", String)
], CreateSolicitudHoraExtraDto.prototype, "motivo", void 0);
class ResponderSolicitudHoraExtraDto {
    estado;
    minutos_autorizados;
    comentario_respuesta;
}
exports.ResponderSolicitudHoraExtraDto = ResponderSolicitudHoraExtraDto;
__decorate([
    (0, class_validator_1.IsIn)(ESTADOS_RESPUESTA, {
        message: 'El estado solo puede ser aprobada o rechazada.',
    }),
    __metadata("design:type", String)
], ResponderSolicitudHoraExtraDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Las horas autorizadas no son válidas.' }),
    (0, class_validator_1.IsIn)(MINUTOS_VALIDOS, {
        message: 'Solo puedes autorizar 1, 2 o 3 horas extra.',
    }),
    __metadata("design:type", Number)
], ResponderSolicitudHoraExtraDto.prototype, "minutos_autorizados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El comentario debe ser texto.' }),
    (0, class_validator_1.Length)(0, 500, {
        message: 'El comentario no puede superar los 500 caracteres.',
    }),
    __metadata("design:type", String)
], ResponderSolicitudHoraExtraDto.prototype, "comentario_respuesta", void 0);
//# sourceMappingURL=solicitud-hora-extra.dto.js.map