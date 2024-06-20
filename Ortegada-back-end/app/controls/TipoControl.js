"use strict";

var models = require("../models");
var platos = models.plato;
var tipos = models.tipo_plato;
var CuentaPlato = models.cuenta_plato;
const { check, validationResult } = require("express-validator");
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

class TipoControl {
    async guardar(req, res) {
		if (req.body.hasOwnProperty('nombre')) {

			const { nombre } = req.body;

			if (nombre.trim() === "") {
				return res.status(400).json({ msg: "ERROR", tag: "Debe ingresar el nombre del tipo de plato", code: 400 });
			}

            var nombre_minus = nombre.toLowerCase();

			const tipoAux = await tipos.findOne({
				where: {
					nombre: Sequelize.where(
						Sequelize.fn("LOWER", Sequelize.col("nombre")),
						"LIKE",
						`%${nombre_minus}`
					),
				},
			});

			if (tipoAux !== null) {
				return res.status(400).json({ msg: "ERROR", tag: "Ya existe ese tipo de plato", code: 400 });
			}

			var uuid = require('uuid');
			var data = {
				nombre: nombre,
				external_id: uuid.v4(),
			}

			var result = await tipos.create(data);
			if (result === null) {
				return res.status(401).json({ msg: "Error", tag: "Hubo un error al guardar el tipo de plato, prueba de nuevo.", code: 401 });
			} else {
				return res.status(200).json({ msg: "OK", tag: "Tipo de plato guardado correctamente!", code: 200 });
			}
		} else {
			return res.status(400).json({ msg: "Error", tag: "Faltan datos", code: 400 });
		}
	}

    async modificar(req, res) {
		try {
			const external = req.params.external;
			const { nombre } = req.body;

			const tipoAux = await tipos.findOne({
				where: { external_id: external }
			});

			if (!tipoAux) {
				return res.status(404).json({ msg: "ERROR", tag: "No se pudo encontrar el plato", code: 404 });
			}

			if (nombre && nombre.toLowerCase() !== tipoAux.nombre.toLowerCase()) {
				const tipoExistente = await tipos.findOne({
					where: { nombre: nombre }
				});

				if (tipoExistente) {
					return res.status(400).json({ msg: "ERROR", tag: "Ya existe ese tipo de plato", code: 400 });
				}

				tipoAux.nombre = nombre;
			}

			await tipoAux.save();

			return res.status(200).json({ msg: "OK", tag: "Tipo de plato modificado correctamente", code: 200 });
		} catch (error) {
			console.error('Error al obtener tipos de plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}

    async cambiar_estado(req, res) {
		const external = req.params.external;
		const { estado } = req.body;

		if (external) {
			var tipoAux = await tipos.findOne({
				where: {
					external_id: external,
				}
			});
			if (!tipoAux) {
				return res.status(204).json({
					msg: "Error",
					tag: "No se encontro el tipo de plato",
					code: 204,
				});
			}

			if(estado === null || estado === undefined){
				return res.status(400).json({ msg: "ERROR", tag: "Debe enviar el estado", code: 400 });
			}

			await tipoAux.update({ estado: estado });

			return res.status(200).json({
				msg: "OK",
				tag: "Se cambió el estado del plato",
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

    async listar_disponibles(req, res) {
		try {
			const tiposAux = await tipos.findAll({
                where: { estado: true },
				attributes: ['nombre'],
				order: [['id', 'ASC']]
			});

			const tipos_mapeados = tiposAux.map(tipo => tipo.nombre);
			return res.status(200).json({ msg: "OK", code: 200, datos: tipos_mapeados });
		} catch (error) {
			console.error('Error al obtener tipos de plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}

    async listar(req, res) {
		try {
			const tiposAux = await tipos.findAll({
				attributes: ['nombre', 'estado', 'external_id'],
				order: [['id', 'ASC']]
			});

			return res.status(200).json({ msg: "OK", code: 200, datos: tiposAux });
		} catch (error) {
			console.error('Error al obtener tipos de plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}

    async obtener(req, res) {
		try {
			const external = req.params.external;
			if (!external) {
				return res.status(400).json({
					msg: "Error",
					tag: "External Invalido",
					code: 400,
				});
			}
			var tipoAux = await tipos.findOne({
				where: {
					external_id: external,
					estado: true
				},
				attributes: ["nombre", "external_id"],
			});

			if (!tipoAux) {
				return res.status(204).json({
					msg: "Error",
					tag: "No se encontro el tipo de plato",
					code: 204,
				});
			}

			return res.status(200).json({
				msg: "OK",
				code: 200,
				datos: {
					nombre: tipoAux.nombre,
					external_id: tipoAux.external_id,
				},
			});

		} catch (error) {
			console.error('Error al obtener plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}
}

module.exports = TipoControl;