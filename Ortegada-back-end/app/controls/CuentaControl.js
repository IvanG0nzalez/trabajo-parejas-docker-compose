"use strict";

const nodemailer = require("nodemailer");
const crypto = require('crypto');
var models = require("../models");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const { Op, DATE } = require('sequelize');
require("dotenv").config();

var rol = models.rol;
var cuenta = models.cuenta;
let jwt = require("jsonwebtoken");
const { text } = require("express");

class CuentaControl {

  async listar(req, res) {
    var lista = await cuenta.findAll({
      attributes: ["correo", "nombre_usuario", "estado", "external_id"],
      include: [
        {
          model: rol,
          as: "rol",
          attributes: ["external_id", "nombre"],
          where: {
            nombre: {
              [Op.ne]: "Administrador"
            }
          }
        },
      ],
    });

    if (!lista || lista.length === 0) {
      res.status(204);
      res.json({
        msg: "No hay cuentas registradas",
        code: 200,
        datos: {},
      });
    } else {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        datos: lista,
      });
    }
  }

  async obtener(req, res) {
    const external = req.params.external;
    if (external) {
      var lista = await cuenta.findOne({
        where: { external_id: external },
        attributes: ["correo", "nombre_usuario", "external_id"],
        include: [
          {
            model: rol,
            as: "rol",
            attributes: ["external_id", "nombre"],
          },
        ],
      });
      if (lista === undefined || lista === null) {
        res.status(204);
        res.json({
          msg: "Error",
          tag: "No se encontro la cuenta",
          code: 400,
          datos: [],
        });
      } else {
        res.status(200);
        res.json({
          msg: "OK",
          code: 200,
          datos: lista,
        });
      }
    } else {
      res.status(400);
      res.json({
        msg: "Error",
        tag: "External Invalido",
        code: 400,
      });
    }
  }

  async guardar(req, res) {
    const UUID = require("uuid");

    const camposPermitidos = [
      "correo",
      "nombre_usuario",
      "clave",
    ];

    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (
      camposInvalidos.length > 0 ||
      !camposPermitidos.every((campo) => camposEnviados.includes(campo))
    ) {
      return res.status(400).json({
        msg: "ERROR",
        tag: "Campos no permitidos o incompletos",
        code: 400,
      });

    }
    const rolAux = await rol.findOne({
      where: { nombre: "Usuario" }
    });

    if (rolAux !== undefined && rolAux !== null) {
      const claveCifrada = await bcrypt.hash(req.body.clave, 10);

      const cuentaExistente = await cuenta.findOne({
        where: { correo: req.body.correo }
      });

      if (cuentaExistente) {
        return res.status(409).json({
          msg: "ERROR",
          tag: "Ya se ha registrado",
          code: 409,
        });
      }


      const nuevaCuenta = await cuenta.create(
        {
          correo: req.body.correo,
          nombre_usuario: req.body.nombre_usuario,
          clave: claveCifrada,
          id_rol: rolAux.id,
          external_id: UUID.v4(),
        }
      );

      if (nuevaCuenta === null) {
        return res.status(401).json({
          msg: "ERROR",
          tag: "No se pudo crear",
          code: 400,
        });
      }

      
    } else {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "No se encuentra Rol",
        code: 400,
      });
    }

  }

  async validarRegistro(req, res, next) {
    await check("correo")
      .notEmpty()
      .withMessage("El usuario no debe estar vacío")
      .isEmail()
      .withMessage("El usuario debe ser un correo electrónico válido")
      .run(req);
    await check("clave").notEmpty().withMessage("La clave no puede estar vacio").run(req);
    await check("nombre_usuario").notEmpty().withMessage("El nombre de usuario no puede esta vacio").run(req);

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(400).json({
        msg: "ERROR",
        tag: "Error en la solicitud",
        code: 400,
        errors: errors.array(),
      });
    }

    next();
  }

  async modificar(req, res) {

    const external = req.params.external;
    const { correo, nombre_usuario, clave } = req.body;
    const cuentaAux = await cuenta.findOne({
      where: { external_id: external }
    });

    if (!cuentaAux) {
      return res.status(404).json({ msg: "ERROR", tag: "No se pudo encontrar al usuario", code: 404 });
    }

    if (correo && correo !== cuentaAux.correo) {
      const cuentExistente = await cuenta.findOne({
        where: { correo: correo }
      });

      if (cuentExistente) {
        return res.status(400).json({ msg: "ERROR", tag: "El correo ya está en uso", code: 400 });
      }
    }

    if (clave) {
      const claveCifrada = await bcrypt.hash(req.body.clave, 10);
      cuentaAux.clave = claveCifrada;
    }

    cuentaAux.nombre_usuario = nombre_usuario || cuentaAux.nombre_usuario;
    cuentaAux.correo = correo || cuentaAux.correo;
    await cuentaAux.save();

    return res.status(200).json({ msg: "OK", tag: "Cuenta modificada correctamente", code: 200 });
  }

  async cambiar_clave(req, res) {
    const external_cuenta = req.params.external;

    var cuentaAux = await cuenta.findOne({
      where: {
        external_id: external_cuenta,
      }
    });
    //console.log(cuentaAux)
    if (req.body.hasOwnProperty("clave")) {
      const claveCifrada = await bcrypt.hash(req.body.clave, 10);

      cuentaAux.clave = claveCifrada;
      await cuentaAux.save();

      res.status(200).json({ msg: "OK", tag: "Contraseña modificada correctamente", code: 200 });

    } else {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Debe ingresar una contraseña",
        code: 400
      });
    }
  }

  async cambiar_estado(req, res) {
    const external = req.params.external;
    const { estado } = req.body;

    if (estado === undefined || estado === null) {
      return res.status(400).json({ msg: "ERROR", tag: "Debe enviar el estado", code: 400 });
    }

    if (external) {
      var cuentaAux = await cuenta.findOne({
        where: {
          external_id: external,
        }
      });

      if (!cuentaAux) {
        return res.status(204).json({
          msg: "Error",
          tag: "No se encontró la cuenta",
          code: 400,
        });
      }

      await cuentaAux.update({ estado: estado });

      return res.status(200).json({
        msg: "OK",
        tag: "Se cambió el estado de la cuenta",
        code: 200,
      });

    } else {
      return res.status(400).json({
        msg: "Error",
        tag: "External Invalido",
        code: 400,
      });
    }
  }

  async validarInicio_Sesion(req, res, next) {
    await check("correo").notEmpty().withMessage("El usuario no debe estar vacio").run(req);
    await check("clave").notEmpty().withMessage("La clave no puede estar vacia").run(req);

    const errors = validationResult(req).formatWith(({ msg, value }) => ({ msg, value }));
    //console.log(errors.formatWith(msg, value))

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "ERROR",
        tag: "Error en las credenciales",
        code: 401,
        errors: errors.array(),
      });
    }

    next();
  }

  async inicio_sesion(req, res) {
    if (
      req.body.hasOwnProperty("correo") &&
      req.body.hasOwnProperty("clave")
    ) {
      let cuentaAux = await cuenta.findOne({
        where: {
          correo: req.body.correo,
        },
      });
      if (!cuentaAux) {
        return res.status(400).json({
          msg: "ERROR",
          tag: "La cuenta no existe",
          code: 400,
        });
      } else {
        const validar = await bcrypt.compare(req.body.clave, cuentaAux.clave);
        if (validar) {
          if (cuentaAux.estado == true) {
            const token_data = {
              external: cuentaAux.external_id,
              check: true,
            };
            require("dotenv").config();
            const key = process.env.KEY;
            const token = jwt.sign(token_data, key, {
              expiresIn: "6h",
            });
            var info = {
              token: token,
              user: cuentaAux.correo,
              user_name: cuentaAux.nombre_usuario,
              external_id: cuentaAux.external_id,
            };
            console.log('info', info);
            res.status(200);
            res.json({
              msg: "OK",
              tag: "Listo",
              code: 200,
              datos: info,
            });
          } else {
            res.status(400);
            res.json({
              msg: "ERROR",
              tag: "Su cuenta aún no ha sido habilitada o ha sido deshabilitada por un administrador",
              code: 400,
            });
          }
        } else {
          res.status(400);
          res.json({
            msg: "ERROR",
            tag: "Credenciales incorrectas",
            code: 400,
          });
        }
      }
    } else {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Falta Datos",
        code: 400,
      });
    }
  }

  async keepAlive(req, res) {
    return res.status(200).json({ msg: "OK", code: 200 });
  }

}

module.exports = CuentaControl;
