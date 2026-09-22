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
exports.RegistroAccesoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const registro_acceso_entity_1 = require("../entities/registro-acceso.entity");
const punto_autorizado_entity_1 = require("../entities/punto-autorizado.entity");
const fecha_especial_entity_1 = require("../entities/fecha-especial.entity");
const registro_acceso_dto_1 = require("../dto/registro-acceso.dto");
const jornada_1 = require("../utils/jornada");
const solicitud_hora_extra_service_1 = require("./solicitud-hora-extra.service");
const VENTANA_DIAS_LABORABLES = 90;
let RegistroAccesoService = class RegistroAccesoService {
    registroRepository;
    puntoRepository;
    fechaEspecialRepository;
    solicitudHoraExtraService;
    constructor(registroRepository, puntoRepository, fechaEspecialRepository, solicitudHoraExtraService) {
        this.registroRepository = registroRepository;
        this.puntoRepository = puntoRepository;
        this.fechaEspecialRepository = fechaEspecialRepository;
        this.solicitudHoraExtraService = solicitudHoraExtraService;
    }
    async createRegistro(user, body, file) {
        const idEmpleado = user.id;
        const tipoRegistro = body.tipo_registro;
        const fechaRegistro = new Date();
        const jornada = await this.resolverJornada(fechaRegistro);
        this.validarRegistroSegunJornada(jornada, tipoRegistro);
        await this.validarFlujoDelDia(idEmpleado, tipoRegistro);
        await this.validarRegistroUnicoDelDia(idEmpleado, tipoRegistro);
        const minutosExtensionSalida = await this.obtenerMinutosExtensionSalida(jornada, idEmpleado, fechaRegistro);
        const estatusRegistro = this.obtenerEstatusRegistro(tipoRegistro, fechaRegistro, jornada, minutosExtensionSalida);
        if (tipoRegistro === 'salida' &&
            minutosExtensionSalida > 0 &&
            estatusRegistro === 'antes_de_tiempo') {
            throw new common_1.BadRequestException('Tienes horas extra aprobadas para hoy. Debes cumplirlas antes de registrar tu salida.');
        }
        const requiereFoto = body.tipo_registro === registro_acceso_dto_1.TipoRegistroDto.ENTRADA ||
            body.tipo_registro === registro_acceso_dto_1.TipoRegistroDto.SALIDA;
        if (requiereFoto && !file) {
            throw new common_1.BadRequestException('Debes tomar una fotografía para continuar.');
        }
        const latitud = Number(body.latitud);
        const longitud = Number(body.longitud);
        if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
            throw new common_1.BadRequestException('La ubicación recibida no es válida.');
        }
        if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
            throw new common_1.BadRequestException('Las coordenadas recibidas no son válidas.');
        }
        const puntoCercano = await this.obtenerPuntoAutorizadoCercano(latitud, longitud);
        let latitudFinal = latitud;
        let longitudFinal = longitud;
        let direccion = null;
        if (puntoCercano) {
            latitudFinal = Number(puntoCercano.latitud);
            longitudFinal = Number(puntoCercano.longitud);
            direccion = puntoCercano.direccion_fija;
        }
        else {
            direccion = await this.obtenerDireccionGoogle(latitud, longitud);
        }
        const registro = this.registroRepository.create({
            tipo_registro: tipoRegistro,
            estatus_registro: estatusRegistro,
            latitud: latitudFinal,
            longitud: longitudFinal,
            direccion,
            fotografia: file?.buffer ?? null,
            id_empleado: idEmpleado,
            fecha_y_hora: fechaRegistro,
        });
        try {
            await this.registroRepository.save(registro);
        }
        catch (error) {
            console.error('ERROR AL GUARDAR REGISTRO:', error);
            const mysqlError = error;
            if (mysqlError.code === 'ER_DUP_ENTRY') {
                const nombreRegistro = this.obtenerNombreTipoRegistro(body.tipo_registro);
                throw new common_1.BadRequestException(`Ya registraste tu ${nombreRegistro} el día de hoy.`);
            }
            throw error;
        }
        return {
            message: this.obtenerMensajeRegistro(registro.tipo_registro, registro.estatus_registro),
            direccion,
            registro: {
                id_registro: registro.id_registro,
                tipo_registro: registro.tipo_registro,
                estatus_registro: registro.estatus_registro,
                latitud: registro.latitud,
                longitud: registro.longitud,
                direccion: registro.direccion,
                fecha_y_hora: registro.fecha_y_hora,
                id_empleado: registro.id_empleado,
            },
        };
    }
    async createRegistroManual(body) {
        if (!body.fecha || !body.hora) {
            throw new common_1.BadRequestException('Debes seleccionar fecha y hora.');
        }
        const fechaRegistro = new Date(`${body.fecha}T${body.hora}:00`);
        if (Number.isNaN(fechaRegistro.getTime())) {
            throw new common_1.BadRequestException('La fecha y hora no son válidas.');
        }
        const inicioDiaSeleccionado = new Date(fechaRegistro);
        inicioDiaSeleccionado.setHours(0, 0, 0, 0);
        const inicioDiaActual = new Date();
        inicioDiaActual.setHours(0, 0, 0, 0);
        if (inicioDiaSeleccionado.getTime() > inicioDiaActual.getTime()) {
            throw new common_1.BadRequestException('No se pueden registrar accesos en fechas futuras.');
        }
        const inicioBusqueda = new Date(inicioDiaActual);
        inicioBusqueda.setDate(inicioBusqueda.getDate() - VENTANA_DIAS_LABORABLES);
        const fechaEspeciales = await this.fechaEspecialRepository.find({
            where: {
                activo: true,
                fecha: (0, typeorm_2.Between)(this.formatearFechaLocal(inicioBusqueda), this.formatearFechaLocal(inicioDiaActual)),
            },
        });
        const fechaEspecialPorDia = new Map(fechaEspeciales.map((fechaEspecial) => [
            fechaEspecial.fecha,
            fechaEspecial,
        ]));
        const diaLimite = new Date(inicioDiaActual);
        let diasLaborables = 0;
        let diasRevisados = 0;
        while (diasLaborables < 3 && diasRevisados < VENTANA_DIAS_LABORABLES) {
            diaLimite.setDate(diaLimite.getDate() - 1);
            diasRevisados++;
            const jornada = (0, jornada_1.resolverJornadaPorFecha)(diaLimite, fechaEspecialPorDia.get(this.formatearFechaLocal(diaLimite)) ?? null);
            if (jornada.esLaborable)
                diasLaborables++;
        }
        if (diasLaborables < 3) {
            throw new common_1.BadRequestException('No se encontraron suficientes días laborables recientes para el registro manual.');
        }
        if (inicioDiaSeleccionado.getTime() < diaLimite.getTime()) {
            throw new common_1.BadRequestException('Solo se permiten registros manuales de los últimos 3 días laborables.');
        }
        const tipoRegistro = body.tipo_registro;
        const jornada = await this.resolverJornada(fechaRegistro);
        this.validarRegistroSegunJornada(jornada, tipoRegistro);
        await this.validarRegistroUnicoPorFecha(body.id_empleado, tipoRegistro, fechaRegistro);
        const minutosExtensionSalida = await this.obtenerMinutosExtensionSalida(jornada, body.id_empleado, fechaRegistro);
        const estatusRegistro = this.obtenerEstatusRegistro(tipoRegistro, fechaRegistro, jornada, minutosExtensionSalida);
        if (tipoRegistro === 'salida' &&
            minutosExtensionSalida > 0 &&
            estatusRegistro === 'antes_de_tiempo') {
            throw new common_1.BadRequestException('El empleado tiene horas extra aprobadas para esa fecha. Debe cumplirlas antes de registrar la salida.');
        }
        let latitud = 0;
        let longitud = 0;
        let direccion = '';
        if (body.tipo_direccion === registro_acceso_dto_1.TipoDireccionManualDto.PUNTO) {
            if (!body.id_punto) {
                throw new common_1.BadRequestException('Selecciona un punto autorizado.');
            }
            const punto = await this.puntoRepository.findOne({
                where: {
                    id_punto: Number(body.id_punto),
                    activo: true,
                },
            });
            if (!punto) {
                throw new common_1.BadRequestException('El punto autorizado no existe o está inactivo.');
            }
            latitud = Number(punto.latitud);
            longitud = Number(punto.longitud);
            direccion = punto.direccion_fija;
        }
        else {
            if (!body.direccion_manual?.trim()) {
                throw new common_1.BadRequestException('Escribe la dirección manual.');
            }
            direccion = body.direccion_manual.trim();
        }
        if (body.observacion?.trim()) {
            direccion = `${direccion}. Registro manual por administrador. Motivo: ${body.observacion.trim()}`;
        }
        else {
            direccion = `${direccion}. Registro manual por administrador.`;
        }
        const registro = this.registroRepository.create({
            tipo_registro: tipoRegistro,
            estatus_registro: estatusRegistro,
            latitud,
            longitud,
            direccion,
            fotografia: null,
            id_empleado: body.id_empleado,
            fecha_y_hora: fechaRegistro,
        });
        try {
            await this.registroRepository.save(registro);
        }
        catch (error) {
            const mysqlError = error;
            if (mysqlError.code === 'ER_DUP_ENTRY') {
                const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);
                throw new common_1.BadRequestException(`El empleado ya tiene registrado ${nombreRegistro} en esa fecha.`);
            }
            throw error;
        }
        return {
            message: 'Registro manual guardado correctamente.',
            registro,
        };
    }
    async getRegistrosManualesDeHoy() {
        const { inicioDia, finDia } = this.obtenerRangoDiaActual();
        const registros = await this.registroRepository.find({
            where: {
                fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
                direccion: (0, typeorm_2.Like)('%Registro manual por administrador%'),
            },
            relations: { empleado: true },
            order: { fecha_y_hora: 'DESC' },
        });
        return registros.map((registro) => ({
            id_registro: registro.id_registro,
            tipo_registro: registro.tipo_registro,
            fecha_y_hora: registro.fecha_y_hora,
            direccion: registro.direccion,
            empleado: {
                id_empleado: registro.empleado.id_empleado,
                nombre: registro.empleado.nombre,
                apellido_paterno: registro.empleado.apellido_paterno,
            },
        }));
    }
    async validarRegistroUnicoPorFecha(idEmpleado, tipoRegistro, fecha) {
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);
        const registroExistente = await this.registroRepository.findOne({
            where: {
                id_empleado: idEmpleado,
                tipo_registro: tipoRegistro,
                fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
            },
        });
        if (registroExistente) {
            const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);
            throw new common_1.BadRequestException(`El empleado ya tiene registrado ${nombreRegistro} en esa fecha.`);
        }
    }
    obtenerEstatusRegistro(tipoRegistro, fecha, jornada, minutosExtensionSalida = 0) {
        const minutos = fecha.getHours() * 60 + fecha.getMinutes();
        if (jornada.entradaInicio === null ||
            jornada.entradaFin === null ||
            jornada.salidaInicio === null ||
            jornada.salidaFin === null) {
            throw new common_1.BadRequestException('La jornada no tiene horarios válidos configurados.');
        }
        if (tipoRegistro === 'entrada') {
            if (minutos < jornada.entradaInicio) {
                throw new common_1.BadRequestException(`La entrada solo puede registrarse a partir de las ${this.formatearMinutos(jornada.entradaInicio)}.`);
            }
            return minutos <= jornada.entradaFin ? 'a_tiempo' : 'retardo';
        }
        if (tipoRegistro === 'salida') {
            if (minutos < jornada.salidaInicio + minutosExtensionSalida) {
                return 'antes_de_tiempo';
            }
            if (minutos > jornada.salidaFin + minutosExtensionSalida) {
                return 'fuera_de_rango';
            }
            return 'a_tiempo';
        }
        return null;
    }
    async obtenerMinutosExtensionSalida(jornada, idEmpleado, fecha) {
        if (!jornada.permiteExtensionHorasExtras) {
            return 0;
        }
        return this.solicitudHoraExtraService.obtenerMinutosAutorizados(idEmpleado, this.formatearFechaLocal(fecha));
    }
    formatearMinutos(totalMinutos) {
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }
    obtenerMensajeRegistro(tipoRegistro, estatusRegistro) {
        if (tipoRegistro === 'entrada' && estatusRegistro === 'retardo') {
            return 'Entrada registrada correctamente con retardo.';
        }
        if (tipoRegistro === 'salida' && estatusRegistro === 'antes_de_tiempo') {
            return 'Salida registrada correctamente antes del tiempo establecido.';
        }
        if (tipoRegistro === 'salida' && estatusRegistro === 'fuera_de_rango') {
            return 'Salida registrada correctamente fuera del rango establecido.';
        }
        return 'Registro de acceso guardado correctamente.';
    }
    async validarFlujoDelDia(idEmpleado, tipoRegistro) {
        if (tipoRegistro === 'entrada') {
            return;
        }
        const { inicioDia, finDia } = this.obtenerRangoDiaActual();
        const entradaHoy = await this.registroRepository.findOne({
            where: {
                id_empleado: idEmpleado,
                tipo_registro: 'entrada',
                fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
            },
        });
        if (!entradaHoy) {
            throw new common_1.BadRequestException('Primero debes registrar tu entrada del día antes de registrar comida o salida.');
        }
    }
    async validarRegistroUnicoDelDia(idEmpleado, tipoRegistro) {
        const { inicioDia, finDia } = this.obtenerRangoDiaActual();
        const registroExistente = await this.registroRepository.findOne({
            where: {
                id_empleado: idEmpleado,
                tipo_registro: tipoRegistro,
                fecha_y_hora: (0, typeorm_2.Between)(inicioDia, finDia),
            },
        });
        if (registroExistente) {
            const nombreRegistro = this.obtenerNombreTipoRegistro(tipoRegistro);
            throw new common_1.BadRequestException(`Ya registraste tu ${nombreRegistro} el día de hoy.`);
        }
    }
    obtenerRangoDiaActual() {
        const ahora = new Date();
        const inicioDia = new Date(ahora);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(ahora);
        finDia.setHours(23, 59, 59, 999);
        return { inicioDia, finDia };
    }
    obtenerNombreTipoRegistro(tipoRegistro) {
        const nombres = {
            entrada: 'entrada',
            salida: 'salida',
            salida_comida: 'salida a comida',
            regreso_comida: 'regreso de comida',
        };
        return nombres[tipoRegistro];
    }
    async obtenerPuntoAutorizadoCercano(latitud, longitud) {
        const puntos = await this.puntoRepository.find({
            where: { activo: true },
        });
        const puntoEncontrado = puntos.find((punto) => {
            const distancia = this.calcularDistanciaMetros(latitud, longitud, Number(punto.latitud), Number(punto.longitud));
            return distancia <= punto.radio_metros;
        });
        return puntoEncontrado ?? null;
    }
    calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
        const radioTierra = 6371000;
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radioTierra * c;
    }
    async obtenerDireccionGoogle(latitud, longitud) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return null;
        }
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=${apiKey}&language=es`;
        try {
            const response = await fetch(url);
            const data = (await response.json());
            return data.results?.[0]?.formatted_address ?? null;
        }
        catch (error) {
            console.error('ERROR AL OBTENER DIRECCIÓN:', error);
            return null;
        }
    }
    async resolverJornada(fecha) {
        const fechaTexto = this.formatearFechaLocal(fecha);
        const fechaEspecial = await this.fechaEspecialRepository.findOne({
            where: {
                fecha: fechaTexto,
                activo: true,
            },
        });
        if (fechaEspecial &&
            fechaEspecial.tipo_jornada !== 'no_laborable' &&
            (fechaEspecial.hora_inicio_entrada === null ||
                fechaEspecial.hora_fin_entrada === null ||
                fechaEspecial.hora_inicio_salida === null ||
                fechaEspecial.hora_fin_salida === null)) {
            throw new common_1.BadRequestException(`La fecha especial ${fechaEspecial.nombre} no tiene horarios válidos configurados.`);
        }
        return (0, jornada_1.resolverJornadaPorFecha)(fecha, fechaEspecial);
    }
    formatearFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    validarRegistroSegunJornada(jornada, tipoRegistro) {
        if (!jornada.esLaborable) {
            throw new common_1.BadRequestException(`No se pueden realizar registros porque el día no es laborable: ${jornada.nombre}.`);
        }
        const esRegistroComida = tipoRegistro === 'salida_comida' || tipoRegistro === 'regreso_comida';
        if (esRegistroComida && !jornada.requiereComida) {
            throw new common_1.BadRequestException('Esta jornada no requiere registros de salida o regreso de comida.');
        }
    }
};
exports.RegistroAccesoService = RegistroAccesoService;
exports.RegistroAccesoService = RegistroAccesoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registro_acceso_entity_1.RegistroAcceso)),
    __param(1, (0, typeorm_1.InjectRepository)(punto_autorizado_entity_1.PuntoAutorizado)),
    __param(2, (0, typeorm_1.InjectRepository)(fecha_especial_entity_1.FechaEspecial)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        solicitud_hora_extra_service_1.SolicitudHoraExtraService])
], RegistroAccesoService);
//# sourceMappingURL=registro-acceso.service.js.map