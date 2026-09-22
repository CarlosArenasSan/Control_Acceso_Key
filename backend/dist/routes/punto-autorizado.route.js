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
exports.PuntoAutorizadoRoute = void 0;
const common_1 = require("@nestjs/common");
const punto_autorizado_service_1 = require("../services/punto-autorizado.service");
const admin_guard_1 = require("../guards/admin.guard");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const punto_autorizado_dto_1 = require("../dto/punto-autorizado.dto");
let PuntoAutorizadoRoute = class PuntoAutorizadoRoute {
    puntoService;
    constructor(puntoService) {
        this.puntoService = puntoService;
    }
    findAll() {
        return this.puntoService.findAll();
    }
    create(body) {
        return this.puntoService.create(body);
    }
    updateStatus(id, body) {
        return this.puntoService.updateStatus(id, body.activo);
    }
    delete(id) {
        return this.puntoService.delete(id);
    }
    resolveLocation(body) {
        return this.puntoService.resolveLocation(body.latitud, body.longitud);
    }
};
exports.PuntoAutorizadoRoute = PuntoAutorizadoRoute;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PuntoAutorizadoRoute.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [punto_autorizado_dto_1.CreatePuntoAutorizadoDto]),
    __metadata("design:returntype", void 0)
], PuntoAutorizadoRoute.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, punto_autorizado_dto_1.UpdatePuntoStatusDto]),
    __metadata("design:returntype", void 0)
], PuntoAutorizadoRoute.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PuntoAutorizadoRoute.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('resolve-location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [punto_autorizado_dto_1.ResolveLocationDto]),
    __metadata("design:returntype", void 0)
], PuntoAutorizadoRoute.prototype, "resolveLocation", null);
exports.PuntoAutorizadoRoute = PuntoAutorizadoRoute = __decorate([
    (0, common_1.Controller)('puntos-autorizados'),
    __metadata("design:paramtypes", [punto_autorizado_service_1.PuntoAutorizadoService])
], PuntoAutorizadoRoute);
//# sourceMappingURL=punto-autorizado.route.js.map