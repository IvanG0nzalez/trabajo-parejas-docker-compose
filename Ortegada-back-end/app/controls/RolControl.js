"use strict";

var models = require("../models");
var rol = models.rol;
const { check, validationResult } = require("express-validator");


class RolControl {
  async listar(req, res) {
    var lista = await rol.findAll({
      attributes: ["nombre", "external_id"],
    });
    if (lista === undefined || lista === null) {
      res.status(200);
      res.json({ msg: "OK", code: 200, datos: {} });
    } else {
      res.status(200);
      res.json({ msg: "OK", code: 200, datos: lista });
    }
  }
  async validarRol(req, res, next) {
    await check("nombre").matches(/^[a-zA-Z ]+$/).withMessage("El nombre del rol no puede contener caracteres especiales ni estar vacio").run(req);

    const errors = validationResult(req).formatWith(({ msg, value }) => ({
      msg,
      value,
    }));
    //console.log(errors.formatWith(msg, value))

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "ERROR",
        tag: "Credenciales Invalidas",
        code: 401,
        errors: errors.array(),
      });
    }

    next();
  }

  async guardar(req, res) {
    if (req.body.hasOwnProperty("nombre")) {
      var uuid = require("uuid");
      var data = {
        nombre: req.body.nombre,
        external_id: uuid.v4(),
      };
      var result = await rol.create(data);
      if (result === null) {
        res.status(401);
        res.json({ msg: "Error", tag: "No se creó", code: 401 });
      } else {
        res.status(200);
        res.json({ msg: "OK", code: 200 });
      }
    } else {
      res.status(400);
      res.json({ msg: "Error", tag: "Faltan datos", code: 400 });
    }
  }

  async modificar(req, res) {
    const external = req.params.external;
    const { nombre } = req.body;
    var uuid = require("uuid");
    let rolAux;

    if (!nombre) {
      res.status(400);
      res.json({ msg: "Error", tag: "Faltan datos", code: 400 });
      return;
    }

    rolAux = await rol.findOne({ where: { external_id: external } });

    if (!rolAux) {
      res.status(404);
      res.json({ msg: "Error", tag: "El rol no existe", code: 404 });
      return;
    }

    rolAux.nombre = nombre;
    //rolAux.external_id = uuid.v4();

    await rolAux.save();

    res.status(200);
    res.json({ msg: "OK", code: 200 });
  }
}

module.exports = RolControl;
