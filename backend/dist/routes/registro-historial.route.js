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
exports.RegistroHistorialRoute = void 0;
const common_1 = require("@nestjs/common");
const registro_historial_service_1 = require("../services/registro-historial.service");
const admin_guard_1 = require("../guards/admin.guard");
let RegistroHistorialRoute = class RegistroHistorialRoute {
    historialService;
    constructor(historialService) {
        this.historialService = historialService;
    }
    findHistory(desde, hasta, empleado, incidencia, estadoEmpleado) {
        return this.historialService.findHistory({
            desde,
            hasta,
            empleado,
            incidencia: incidencia,
            estadoEmpleado: estadoEmpleado,
        });
    }
};
exports.RegistroHistorialRoute = RegistroHistorialRoute;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('empleado')),
    __param(3, (0, common_1.Query)('incidencia')),
    __param(4, (0, common_1.Query)('estadoEmpleado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RegistroHistorialRoute.prototype, "findHistory", null);
exports.RegistroHistorialRoute = RegistroHistorialRoute = __decorate([
    (0, common_1.Controller)('registro-historial'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [registro_historial_service_1.RegistroHistorialService])
], RegistroHistorialRoute);
//# sourceMappingURL=registro-historial.route.js.map