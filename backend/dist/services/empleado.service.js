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
exports.EmpleadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const empleado_entity_1 = require("../entities/empleado.entity");
const registro_acceso_entity_1 = require("../entities/registro-acceso.entity");
let EmpleadoService = class EmpleadoService {
    empleadoRepository;
    registroRepository;
    constructor(empleadoRepository, registroRepository) {
        this.empleadoRepository = empleadoRepository;
        this.registroRepository = registroRepository;
    }
    findAll() {
        return this.empleadoRepository.find({
            order: { id_empleado: 'ASC' },
        });
    }
    async create(data) {
        const exists = await this.empleadoRepository.findOne({
            where: { id_empleado: data.id_empleado },
        });
        if (exists) {
            throw new common_1.BadRequestException('Ya existe un empleado con ese ID.');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const empleado = this.empleadoRepository.create({
            id_empleado: data.id_empleado,
            nombre: data.nombre,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno || null,
            username: data.username,
            password_hash: passwordHash,
            activo: data.activo ?? true,
        });
        return this.empleadoRepository.save(empleado);
    }
    async update(id, data) {
        const empleado = await this.empleadoRepository.findOne({
            where: { id_empleado: id },
        });
        if (!empleado) {
            throw new common_1.BadRequestException('El empleado no existe.');
        }
        empleado.nombre = data.nombre;
        empleado.apellido_paterno = data.apellido_paterno;
        empleado.apellido_materno = data.apellido_materno || null;
        empleado.username = data.username;
        empleado.activo = data.activo;
        if (data.password?.trim()) {
            empleado.password_hash = await bcrypt.hash(data.password, 10);
        }
        return this.empleadoRepository.save(empleado);
    }
    async delete(id) {
        const empleado = await this.empleadoRepository.findOne({
            where: { id_empleado: id },
        });
        if (!empleado) {
            throw new common_1.BadRequestException('El empleado no existe.');
        }
        const totalRegistros = await this.registroRepository.count({
            where: { id_empleado: id },
        });
        if (totalRegistros === 0) {
            await this.empleadoRepository.remove(empleado);
            return {
                message: 'Empleado eliminado correctamente.',
            };
        }
        empleado.activo = false;
        await this.empleadoRepository.save(empleado);
        return {
            message: 'Empleado desactivado correctamente.',
        };
    }
};
exports.EmpleadoService = EmpleadoService;
exports.EmpleadoService = EmpleadoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(empleado_entity_1.Empleado)),
    __param(1, (0, typeorm_1.InjectRepository)(registro_acceso_entity_1.RegistroAcceso)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmpleadoService);
//# sourceMappingURL=empleado.service.js.map