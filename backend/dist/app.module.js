"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '..', '.env') });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const administrador_entity_1 = require("./entities/administrador.entity");
const empleado_entity_1 = require("./entities/empleado.entity");
const fecha_especial_entity_1 = require("./entities/fecha-especial.entity");
const punto_autorizado_entity_1 = require("./entities/punto-autorizado.entity");
const registro_acceso_entity_1 = require("./entities/registro-acceso.entity");
const solicitud_hora_extra_entity_1 = require("./entities/solicitud-hora-extra.entity");
const admin_dashboard_route_1 = require("./routes/admin-dashboard.route");
const auth_routes_1 = require("./routes/auth.routes");
const empleado_route_1 = require("./routes/empleado.route");
const fecha_especial_route_1 = require("./routes/fecha-especial.route");
const punto_autorizado_route_1 = require("./routes/punto-autorizado.route");
const registro_acceso_route_1 = require("./routes/registro-acceso.route");
const registro_historial_route_1 = require("./routes/registro-historial.route");
const solicitud_hora_extra_route_1 = require("./routes/solicitud-hora-extra.route");
const env_duration_1 = require("./utils/env-duration");
const admin_dashboard_service_1 = require("./services/admin-dashboard.service");
const auth_service_1 = require("./services/auth.service");
const empleado_service_1 = require("./services/empleado.service");
const fecha_especial_service_1 = require("./services/fecha-especial.service");
const punto_autorizado_service_1 = require("./services/punto-autorizado.service");
const registro_acceso_service_1 = require("./services/registro-acceso.service");
const registro_historial_service_1 = require("./services/registro-historial.service");
const solicitud_hora_extra_service_1 = require("./services/solicitud-hora-extra.service");
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env');
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                timezone: 'local',
                entities: [
                    administrador_entity_1.Administrador,
                    empleado_entity_1.Empleado,
                    registro_acceso_entity_1.RegistroAcceso,
                    punto_autorizado_entity_1.PuntoAutorizado,
                    fecha_especial_entity_1.FechaEspecial,
                    solicitud_hora_extra_entity_1.SolicitudHoraExtra,
                ],
                synchronize: false,
                extra: {
                    connectionLimit: 20,
                    initCommands: ["SET time_zone = '-06:00'"],
                },
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            typeorm_1.TypeOrmModule.forFeature([
                administrador_entity_1.Administrador,
                empleado_entity_1.Empleado,
                registro_acceso_entity_1.RegistroAcceso,
                punto_autorizado_entity_1.PuntoAutorizado,
                fecha_especial_entity_1.FechaEspecial,
                solicitud_hora_extra_entity_1.SolicitudHoraExtra,
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: (0, env_duration_1.getJwtExpiresInSeconds)(),
                },
            }),
        ],
        controllers: [
            auth_routes_1.AuthRoutes,
            registro_acceso_route_1.RegistroAccesoRoute,
            punto_autorizado_route_1.PuntoAutorizadoRoute,
            admin_dashboard_route_1.AdminDashboardRoute,
            empleado_route_1.EmpleadoRoute,
            registro_historial_route_1.RegistroHistorialRoute,
            fecha_especial_route_1.FechaEspecialRoute,
            solicitud_hora_extra_route_1.SolicitudHoraExtraRoute,
        ],
        providers: [
            auth_service_1.AuthService,
            registro_acceso_service_1.RegistroAccesoService,
            punto_autorizado_service_1.PuntoAutorizadoService,
            admin_dashboard_service_1.AdminDashboardService,
            empleado_service_1.EmpleadoService,
            registro_historial_service_1.RegistroHistorialService,
            fecha_especial_service_1.FechaEspecialService,
            solicitud_hora_extra_service_1.SolicitudHoraExtraService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map