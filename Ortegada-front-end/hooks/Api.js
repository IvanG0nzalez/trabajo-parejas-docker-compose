const { enviar, obtener, actualizar } = require("./Conexion");
const { save, saveToken } = require("./SessionUtil");

//let URL_BASE = "https://ortegada-back-end.onrender.com/api/";
const URL_BASE = "http://localhost:3000/api/";

const endpoints = {
    cuentas: {
        inicio_sesion: `${URL_BASE}cuentas/inicio_sesion`,
        guardar: `${URL_BASE}cuentas/guardar`,
        confirmar: `${URL_BASE}cuentas/confirmar/`,
        obtener: `${URL_BASE}cuentas/obtener/`,
        modificar: `${URL_BASE}cuentas/modificar/`,
        listar: `${URL_BASE}cuentas`,
        cambiar_clave: `${URL_BASE}cuentas/clave/`,
        cambiar_estado: `${URL_BASE}cuentas/cambiar-estado/`,
        recuperar_clave: `${URL_BASE}cuentas/recuperar-clave`,
        actualizar_clave: `${URL_BASE}cuentas/actualizar-clave`,
    },
    platos: {
        listar: `${URL_BASE}platos`,
        listar_disponibles: `${URL_BASE}platos/disponibles`,
        obtener: `${URL_BASE}platos/obtener/`,
        guardar: `${URL_BASE}platos/guardar`,
        modificar: `${URL_BASE}platos/modificar/`,
        cambiar_estado: `${URL_BASE}platos/cambiar-estado/`,
    },
    platos_tipos: {
        guardar: `${URL_BASE}platos-tipos/guardar`,
        modificar: `${URL_BASE}platos-tipos/modificar/`,
        cambiar_estado: `${URL_BASE}platos-tipos/cambiar-estado/`,
        listar_disponibles: `${URL_BASE}platos-tipos/disponibles`,
        listar: `${URL_BASE}platos-tipos`,
        obtener: `${URL_BASE}platos-tipos/obtener/`,
    },
    cuentas_platos: {
        guardar: `${URL_BASE}cuentas-platos/guardar/`,
        listar_plato_cuenta: `${URL_BASE}cuentas-platos/`,
        listar: `${URL_BASE}cuentas-platos`,
        cancelar: `${URL_BASE}cuentas-platos/cancelar`,
    },
};

const api_cuenta = {
    inicio_sesion: async (datos) =>  {
        const sesion = await enviar(endpoints.cuentas.inicio_sesion, datos);
        if (sesion && sesion.code === 200 && sesion.datos.token) {
            saveToken(sesion.datos.token);
            save("id", sesion.datos.external_id);
            save("user", sesion.datos.user);
            save("user_name", sesion.datos.user_name);
        }
        return sesion;
    },
    registro_cuenta: (datos) => enviar(endpoints.cuentas.guardar, datos),
    confirmar_cuenta: (token) => obtener(endpoints.cuentas.confirmar + token),
    obtener_cuenta: (external, token) => obtener(endpoints.cuentas.obtener + external, token),
    modificar_cuenta: (external, datos, token) => actualizar(endpoints.cuentas.modificar + external, datos, token),
    listar_cuentas: (token) => obtener(endpoints.cuentas.listar, token),
    cambiar_clave_cuenta: (external, datos, token) => actualizar(endpoints.cuentas.cambiar_clave + external, datos, token),
    cambiar_estado_cuenta: (external, datos, token) => actualizar(endpoints.cuentas.cambiar_estado + external, datos, token),
    recuperar_clave_cuenta: (datos) => enviar(endpoints.cuentas.recuperar_clave, datos),
    actualizar_clave_cuenta: (datos) => enviar(endpoints.cuentas.actualizar_clave, datos),
};

const api_plato = {
    listar_platos: (token) => obtener(endpoints.platos.listar, token),
    listar_platos_disponibles: (token) => obtener(endpoints.platos.listar_disponibles, token),
    obtener_plato: (external, token) => obtener(endpoints.platos.obtener + external, token),
    guardar_plato: (datos, token) => enviar(endpoints.platos.guardar, datos, token),
    modificar_plato: (external, datos, token) => actualizar(endpoints.platos.modificar + external, datos, token),
    cambiar_estado_plato: (external, datos, token) => actualizar(endpoints.platos.cambiar_estado + external, datos, token),
};

const api_tipo = {
    guardar_tipo_plato: (datos, token) => enviar(endpoints.platos_tipos.guardar, datos, token),
    modificar_tipo_plato: (external, datos, token) => actualizar(endpoints.platos_tipos.modificar + external, datos, token),
    cambiar_estado_tipo_plato: (external, datos, token) => actualizar(endpoints.platos_tipos.cambiar_estado + external, datos, token),
    listar_tipos_platos: (token) => obtener(endpoints.platos_tipos.listar, token),
    listar_tipos_platos_disponibles: (token) => obtener(endpoints.platos_tipos.listar_disponibles, token),
    obtener_tipo_plato: (external, token) => obtener(endpoints.platos_tipos.obtener + external, token),
};

const api_cuenta_plato = {
    guardar_cuenta_plato: (external_usuario, external_plato, datos, token) => enviar(endpoints.cuentas_platos.guardar + external_usuario + "/" + external_plato, datos, token),
    listar_plato_cuenta: (external, token) => obtener(endpoints.cuentas_platos.listar_plato_cuenta + external, token),
    listar_cuentas_platos: (token) => obtener(endpoints.cuentas_platos.listar, token),
    cancelar_cuenta_plato: (datos, token) => actualizar(endpoints.cuentas_platos.cancelar, datos, token),
};

module.exports = {
    api_cuenta,
    api_plato,
    api_tipo,
    api_cuenta_plato,
};