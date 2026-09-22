"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const administrador_entity_1 = require("../entities/administrador.entity");
const empleado_entity_1 = require("../entities/empleado.entity");
let AuthService = class AuthService {
    administradorRepository;
    empleadoRepository;
    jwtService;
    constructor(administradorRepository, empleadoRepository, jwtService) {
        this.administradorRepository = administradorRepository;
        this.empleadoRepository = empleadoRepository;
        this.jwtService = jwtService;
    }
    async login(data) {
        const { username, password } = data;
        if (!username || !password) {
            throw new common_1.UnauthorizedException('Faltan credenciales');
        }
        const admin = await this.administradorRepository
            .createQueryBuilder('administrador')
            .addSelect('administrador.password_hash')
            .where('administrador.username = :username', { username })
            .getOne();
        if (admin) {
            return this.loginAdmin(admin, password);
        }
        return this.loginEmpleado(username, password);
    }
    async loginAdmin(admin, password) {
        if (!admin.password_hash) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const passwordValid = await bcrypt.compare(password, admin.password_hash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const user = {
            id: admin.id_admin,
            username: admin.username,
            role: 'admin',
            fullName: admin.username,
        };
        const token = this.jwtService.sign(user);
        return { token, user };
    }
    async loginEmpleado(username, password) {
        const empleado = await this.empleadoRepository
            .createQueryBuilder('empleado')
            .addSelect('empleado.password_hash')
            .where('empleado.username = :username', { username })
            .getOne();
        if (!empleado || !empleado.password_hash) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        if (!empleado.activo) {
            throw new common_1.UnauthorizedException('El empleado está inactivo. Contacta al administrador.');
        }
        const passwordValid = await bcrypt.compare(password, empleado.password_hash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const user = {
            id: empleado.id_empleado,
            username: empleado.username,
            role: 'empleado',
            fullName: `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno ?? ''}`.trim(),
        };
        const token = this.jwtService.sign(user);
        return { token, user };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(administrador_entity_1.Administrador)),
    __param(1, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map