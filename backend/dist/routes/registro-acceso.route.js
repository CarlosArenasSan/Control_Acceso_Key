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
exports.RegistroAccesoRoute = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const registro_acceso_entity_1 = require("../entities/registro-acceso.entity");
const registro_acceso_service_1 = require("../services/registro-acceso.service");
const admin_guard_1 = require("../guards/admin.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const empleado_guard_1 = require("../guards/empleado.guard");
const registro_acceso_dto_1 = require("../dto/registro-acceso.dto");
require("multer");
let RegistroAccesoRoute = class RegistroAccesoRoute {
    registroService;
    registroRepository;
    constructor(registroService, registroRepository) {
        this.registroService = registroService;
        this.registroRepository = registroRepository;
    }
    create(user, body, file) {
        return this.registroService.createRegistro(user, body, file);
    }
    async getFoto(id, res) {
        const registro = await this.registroRepository
            .createQueryBuilder('registro')
            .addSelect('registro.fotografia')
            .where('registro.id_registro = :id', { id })
            .getOne();
        if (!registro?.fotografia) {
            return res.status(404).send('Sin fotografía');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'private, no-store');
        return res.send(registro.fotografia);
    }
    getRegistrosManualesDeHoy() {
        return this.registroService.getRegistrosManualesDeHoy();
    }
    createManual(body) {
        return this.registroService.createRegistroManual(body);
    }
};
exports.RegistroAccesoRoute = RegistroAccesoRoute;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, empleado_guard_1.EmpleadoGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fotografia', {
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
        fileFilter: (_req, file, cb) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Formato de imagen no permitido. Usa JPG, PNG o WEBP.'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, registro_acceso_dto_1.CreateRegistroAccesoDto, Object]),
    __metadata("design:returntype", void 0)
], RegistroAccesoRoute.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/foto'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RegistroAccesoRoute.prototype, "getFoto", null);
__decorate([
    (0, common_1.Get)('manual/hoy'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistroAccesoRoute.prototype, "getRegistrosManualesDeHoy", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registro_acceso_dto_1.CreateRegistroManualDto]),
    __metadata("design:returntype", void 0)
], RegistroAccesoRoute.prototype, "createManual", null);
exports.RegistroAccesoRoute = RegistroAccesoRoute = __decorate([
    (0, common_1.Controller)('registro-acceso'),
    __param(1, (0, typeorm_1.InjectRepository)(registro_acceso_entity_1.RegistroAcceso)),
    __metadata("design:paramtypes", [registro_acceso_service_1.RegistroAccesoService,
        typeorm_2.Repository])
], RegistroAccesoRoute);
//# sourceMappingURL=registro-acceso.route.js.map