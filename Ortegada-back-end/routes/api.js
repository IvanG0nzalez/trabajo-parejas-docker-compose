var express = require('express');
var router = express.Router();
let jwt = require("jsonwebtoken");

const rol = require("../app/controls/RolControl");
let rolControl = new rol();

const cuenta = require("../app/controls/CuentaControl");
let cuentaControl = new cuenta();

const plato = require("../app/controls/PlatoControl");
let platoControl = new plato();

const cuenta_plato = require("../app/controls/CuentaPlatoControl");
let cuentaPlatoControl = new cuenta_plato();

const tipo = require("../app/controls/TipoControl");
let tipoControl = new tipo();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//MIDDLEWARE
const auth = function middleware(req, res, next) {
  const token = req.headers["token"];

  //console.log(req.headers);

  if (token === undefined) {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Falta token",
      code: 401,
    });
  } else {
    require("dotenv").config();
    const key = process.env.KEY;
    jwt.verify(token, key, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "Token no valido o expirado",
          code: 401,
        });
      } else {
        req.id = decoded.external;
        console.log(req.id);
        const models = require("../app/models");
        const cuenta = models.cuenta;
        const aux = await cuenta.findOne({
          where: { external_id: decoded.external },
        });
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "Token no valido",
            code: 401,
          });
        } else {
          next();
        }
      }
    });
  }
};

const isAdmin = async (req, res, next) => {
  const models = require("../app/models");
  const cuenta = models.cuenta;
  const cuentaAux = await cuenta.findOne({
    where: { external_id: req.id },
  });

  const rol = models.rol;
  const rolAux = await rol.findOne({
    where: { id: cuentaAux.id_rol },
  });

  if ((rolAux.nombre === "Administrador")) {
    next();
  } else {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Debe ser un Administrador",
      code: 401,
    });
  }

  // console.log(req.url);
  // console.log(token);
  // next();
};

const isOrganizador = async (req, res, next) => {
  const models = require("../app/models");
  const cuenta = models.cuenta;
  const cuentaAux = await cuenta.findOne({
    where: { external_id: req.id },
  });

  const rol = models.rol;
  const rolAux = await rol.findOne({
    where: { id: cuentaAux.id_rol },
  });

  if ((rolAux.nombre === "Organizador") || (rolAux.nombre === "Administrador")) {
    next();
  } else {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Debe ser un Organizador",
      code: 401,
    });
  }

  // console.log(req.url);
  // console.log(token);
  // next();
};

//api cuentas
router.post("/cuentas/inicio_sesion", cuentaControl.validarInicio_Sesion, cuentaControl.inicio_sesion);
router.post("/cuentas/guardar", cuentaControl.validarRegistro, cuentaControl.guardar);
router.get("/cuentas/obtener/:external", [auth], cuentaControl.obtener);
router.patch("/cuentas/modificar/:external", [auth], cuentaControl.modificar);
router.get("/cuentas",[auth, isOrganizador], cuentaControl.listar);
router.patch("/cuentas/clave/:external", [auth, isOrganizador], cuentaControl.cambiar_clave);
router.patch("/cuentas/cambiar-estado/:external", [auth, isOrganizador], cuentaControl.cambiar_estado);

//api roles
router.get("/admin/roles", [auth, isAdmin], rolControl.listar);
router.post("/admin/roles/guardar", [auth, isAdmin], rolControl.validarRol, rolControl.guardar);

//api platos
router.get("/platos", [auth, isOrganizador], platoControl.listar);
router.get("/platos/disponibles", [auth], platoControl.listar_disponibles);
router.get("/platos/obtener/:external", [auth, isOrganizador], platoControl.obtener);
router.post("/platos/guardar", [auth, isOrganizador], platoControl.guardar);
router.patch("/platos/modificar/:external", [auth, isOrganizador], platoControl.modificar);
router.patch("/platos/cambiar-estado/:external", [auth, isOrganizador], platoControl.cambiar_estado);

//api tipos
router.post("/platos-tipos/guardar", [auth, isOrganizador], tipoControl.guardar);
router.patch("/platos-tipos/modificar/:external", [auth, isOrganizador], tipoControl.modificar);
router.patch("/platos-tipos/cambiar-estado/:external", [auth, isOrganizador], tipoControl.cambiar_estado);
router.get("/platos-tipos/disponibles", [auth], tipoControl.listar_disponibles);
router.get("/platos-tipos", tipoControl.listar);
router.get("/platos-tipos/obtener/:external", [auth, isOrganizador], tipoControl.obtener);

//api cuenta_plato
router.post("/cuentas-platos/guardar/:external_cuenta/:external_plato", [auth], cuentaPlatoControl.guardar);
router.get("/cuentas-platos/:external", [auth], cuentaPlatoControl.listar);
router.get("/cuentas-platos", [auth, isOrganizador], cuentaPlatoControl.listar_platos);
router.patch("/cuentas-platos/cancelar", [auth], cuentaPlatoControl.cancelarPedido);

//api keepalive
router.get("/keepalive", cuentaControl.keepAlive);

module.exports = router;
