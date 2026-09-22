import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '.env') });

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './entities/administrador.entity';
import { Empleado } from './entities/empleado.entity';
import { FechaEspecial } from './entities/fecha-especial.entity';
import { PuntoAutorizado } from './entities/punto-autorizado.entity';
import { RegistroAcceso } from './entities/registro-acceso.entity';
import { SolicitudHoraExtra } from './entities/solicitud-hora-extra.entity';
import { AdminDashboardRoute } from './routes/admin-dashboard.route';
import { AuthRoutes } from './routes/auth.routes';
import { EmpleadoRoute } from './routes/empleado.route';
import { FechaEspecialRoute } from './routes/fecha-especial.route';
import { PuntoAutorizadoRoute } from './routes/punto-autorizado.route';
import { RegistroAccesoRoute } from './routes/registro-acceso.route';
import { RegistroHistorialRoute } from './routes/registro-historial.route';
import { SolicitudHoraExtraRoute } from './routes/solicitud-hora-extra.route';
import { getJwtExpiresInSeconds } from './utils/env-duration';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AuthService } from './services/auth.service';
import { EmpleadoService } from './services/empleado.service';
import { FechaEspecialService } from './services/fecha-especial.service';
import { PuntoAutorizadoService } from './services/punto-autorizado.service';
import { RegistroAccesoService } from './services/registro-acceso.service';
import { RegistroHistorialService } from './services/registro-historial.service';
import { SolicitudHoraExtraService } from './services/solicitud-hora-extra.service';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurado en el archivo .env');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timezone: 'local',
      entities: [
        Administrador,
        Empleado,
        RegistroAcceso,
        PuntoAutorizado,
        FechaEspecial,
        SolicitudHoraExtra,
      ],
      synchronize: false,
      extra: {
        connectionLimit: 20,
        initCommands: ["SET time_zone = '-06:00'"],
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forFeature([
      Administrador,
      Empleado,
      RegistroAcceso,
      PuntoAutorizado,
      FechaEspecial,
      SolicitudHoraExtra,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: getJwtExpiresInSeconds(),
      },
    }),
  ],
  controllers: [
    AuthRoutes,
    RegistroAccesoRoute,
    PuntoAutorizadoRoute,
    AdminDashboardRoute,
    EmpleadoRoute,
    RegistroHistorialRoute,
    FechaEspecialRoute,
    SolicitudHoraExtraRoute,
  ],
  providers: [
    AuthService,
    RegistroAccesoService,
    PuntoAutorizadoService,
    AdminDashboardService,
    EmpleadoService,
    RegistroHistorialService,
    FechaEspecialService,
    SolicitudHoraExtraService,
  ],
})
export class AppModule {}
