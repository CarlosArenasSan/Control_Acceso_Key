"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolverJornadaPorFecha = resolverJornadaPorFecha;
exports.convertirHoraAMinutos = convertirHoraAMinutos;
function resolverJornadaPorFecha(fecha, fechaEspecial) {
    if (fechaEspecial) {
        if (fechaEspecial.tipo_jornada === 'no_laborable') {
            return {
                esLaborable: false,
                nombre: fechaEspecial.nombre,
                requiereComida: false,
                entradaInicio: null,
                entradaFin: null,
                salidaInicio: null,
                salidaFin: null,
                permiteExtensionHorasExtras: false,
            };
        }
        return {
            esLaborable: true,
            nombre: fechaEspecial.nombre,
            requiereComida: fechaEspecial.requiere_comida,
            entradaInicio: convertirHoraAMinutos(fechaEspecial.hora_inicio_entrada),
            entradaFin: convertirHoraAMinutos(fechaEspecial.hora_fin_entrada),
            salidaInicio: convertirHoraAMinutos(fechaEspecial.hora_inicio_salida),
            salidaFin: convertirHoraAMinutos(fechaEspecial.hora_fin_salida),
            permiteExtensionHorasExtras: false,
        };
    }
    const diaSemana = fecha.getDay();
    if (diaSemana === 0) {
        return {
            esLaborable: false,
            nombre: 'Domingo',
            requiereComida: false,
            entradaInicio: null,
            entradaFin: null,
            salidaInicio: null,
            salidaFin: null,
            permiteExtensionHorasExtras: false,
        };
    }
    const esSabado = diaSemana === 6;
    return {
        esLaborable: true,
        nombre: esSabado ? 'Jornada sabatina' : 'Jornada ordinaria',
        requiereComida: !esSabado,
        entradaInicio: 8 * 60 + 50,
        entradaFin: 9 * 60 + 10,
        salidaInicio: esSabado ? 13 * 60 + 30 : 18 * 60 + 30,
        salidaFin: esSabado ? 14 * 60 + 10 : 19 * 60 + 10,
        permiteExtensionHorasExtras: !esSabado,
    };
}
function convertirHoraAMinutos(hora) {
    if (!hora) {
        return null;
    }
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}
//# sourceMappingURL=jornada.js.map