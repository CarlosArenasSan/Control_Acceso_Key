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
exports.SolicitudHoraExtraRoute = void 0;
const common_1 = require("@nestjs/common");
const solicitud_hora_extra_service_1 = require("../services/solicitud-hora-extra.service");
const admin_guard_1 = require("../guards/admin.guard");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const empleado_guard_1 = require("../guards/empleado.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const solicitud_hora_extra_dto_1 = require("../dto/solicitud-hora-extra.dto");
let SolicitudHoraExtraRoute = class SolicitudHoraExtraRoute {
    solicitudService;
    constructor(solicitudService) {
        this.solicitudService = solicitudService;
    }
    create(user, body) {
        return this.solicitudService.create(user, body);
    }
    findMine(user) {
        return this.solicitudService.findMine(user.id);
    }
    getMiSaldo(user) {
        return this.solicitudService.getSaldo(user.id);
    }
    cancel(id, user) {
        return this.solicitudService.cancel(id, user);
    }
    findAll() {
        return this.solicitudService.findAll();
    }
    respond(id, body, user) {
        return this.solicitudService.respond(id, body, user.id);
    }
};
exports.SolicitudHoraExtraRoute = SolicitudHoraExtraRoute;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, empleado_guard_1.EmpleadoGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, solicitud_hora_extra_dto_1.CreateSolicitudHoraExtraDto]),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, empleado_guard_1.EmpleadoGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('mi-saldo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, empleado_guard_1.EmpleadoGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "getMiSaldo", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, empleado_guard_1.EmpleadoGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/responder'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, solicitud_hora_extra_dto_1.ResponderSolicitudHoraExtraDto, Object]),
    __metadata("design:returntype", void 0)
], SolicitudHoraExtraRoute.prototype, "respond", null);
exports.SolicitudHoraExtraRoute = SolicitudHoraExtraRoute = __decorate([
    (0, common_1.Controller)('solicitudes-horas-extra'),
    __metadata("design:paramtypes", [solicitud_hora_extra_service_1.SolicitudHoraExtraService])
], SolicitudHoraExtraRoute);
//# sourceMappingURL=solicitud-hora-extra.route.js.map