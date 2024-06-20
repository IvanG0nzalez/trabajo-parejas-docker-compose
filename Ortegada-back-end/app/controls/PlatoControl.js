"use strict";

var models = require("../models");
var platos = models.plato;
var tipos = models.tipo_plato;
var CuentaPlato = models.cuenta_plato;
const { check, validationResult } = require("express-validator");
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

class PlatoControl {
	async guardar(req, res) {
		if (req.body.hasOwnProperty('nombre') &&
			req.body.hasOwnProperty('tipo') &&
			req.body.hasOwnProperty('precio')) {

			const { nombre, tipo, precio } = req.body;

			if (nombre.trim() === "" || tipo.trim() === "") {
				return res.status(400).json({ msg: "ERROR", tag: "Debe seleccionar un tipo, un nombre y un precio para el plato", code: 400 });
			}

			const precioFloat = parseFloat(precio);
			if(isNaN(precioFloat) || precioFloat < 0){
				return res.status(400).json({ msg: "ERROR", tag: "El precio debe ser un número positivo", code: 400 });
			}

			const tipoAux = await tipos.findOne({
				where: {
					nombre: tipo,
				},
			});
			if (!tipoAux) {
				return res.status(400).json({ msg: "ERROR", tag: "Debe seleccionar un tipo válido para el plato", code: 400 });
			}

			var nombre_minus = nombre.toLowerCase();

			const platoAux = await platos.findAll({
				where: {
					nombre: Sequelize.where(
						Sequelize.fn("LOWER", Sequelize.col("nombre")),
						"LIKE",
						`%${nombre_minus}`
					),
				},
			});

			if (platoAux.length > 0) {
				return res.status(400).json({ msg: "ERROR", tag: "Ya existe un plato con ese nombre", code: 400 });
			}

			var uuid = require('uuid');
			var data = {
				nombre: nombre,
				precio: precioFloat,
				id_tipo_plato: tipoAux.id,
				external_id: uuid.v4(),
			}
			var result = await platos.create(data);
			if (result === null) {
				return res.status(401).json({ msg: "Error", tag: "Hubo un error al guardar el plato, prueba de nuevo.", code: 401 });
			} else {
				return res.status(200).json({ msg: "OK", tag: "Plato guardado correctamente!", code: 200 });
			}
		} else {
			return res.status(400).json({ msg: "Error", tag: "Faltan datos", code: 400 });
		}
	}

	async listar(req, res) {
		try {
			const lista = await platos.findAll({
				attributes: ["nombre", "precio", "estado", "external_id"],
				include: [
					{
						model: tipos,
						as: "tipo_plato",
						attributes: ["nombre"],
					},
				]
			});

			if (!lista || lista.length === 0) {
				return res.status(404).json({
					msg: "No hay platos registrados",
					code: 404,
					datos: {},
				});
			}

			const datos = lista.map(plato => ({
				nombre: plato.nombre,
				precio: plato.precio,
				tipo: plato.tipo_plato.nombre,
				estado: plato.estado,
				external_id: plato.external_id,
			}));

			return res.status(200).json({
				msg: "OK",
				code: 200,
				datos: datos,
			});
		} catch (error) {
			console.error('Error al listar platos:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}

	async listar_disponibles(req, res) {
		try {
			const lista = await platos.findAll({
				where: { 
					estado: true,
					precio: {
						[Op.gt]: 0
					}
				},
				attributes: ["nombre", "precio", "estado", "external_id"],
				include: [
					{
						model: tipos,
						as: "tipo_plato",
						attributes: ["nombre"],
					},
				]
			});

			if (!lista || lista.length === 0) {
				return res.status(404).json({
					msg: "No hay platos registrados",
					code: 404,
					datos: {},
				});
			}

			const datos = lista.map(plato => ({
				nombre: plato.nombre,
				precio: plato.precio,
				tipo: plato.tipo_plato.nombre,
				estado: plato.estado,
				external_id: plato.external_id,
			}));

			return res.status(200).json({
				msg: "OK",
				code: 200,
				datos: datos,
			});
		} catch (error) {
			console.error('Error al listar platos:', error);
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
			var plato = await platos.findOne({
				where: {
					external_id: external,
					estado: true
				},
				attributes: ["nombre", "precio", "external_id"],
				include: [
					{
						model: tipos,
						as: "tipo_plato",
						attributes: ["nombre"],
					},
				]
			});

			if (!plato) {
				return res.status(204).json({
					msg: "Error",
					tag: "No se encontro el plato",
					code: 204,
				});
			}

			return res.status(200).json({
				msg: "OK",
				code: 200,
				datos: {
					nombre: plato.nombre,
					precio: plato.precio,
					tipo: plato.tipo_plato.nombre,
					external_id: plato.external_id,
				},
			});

		} catch (error) {
			console.error('Error al obtener plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}

	async cambiar_estado(req, res) {
		const external = req.params.external;
		const { estado } = req.body;

		if (estado === undefined || estado === null) {
			return res.status(400).json({ msg: "ERROR", tag: "Debe enviar el estado", code: 400 });
		}

		if (external) {
			var plato = await platos.findOne({
				where: {
					external_id: external,
				}
			});
			if (!plato) {
				return res.status(204).json({
					msg: "Error",
					tag: "No se encontro el plato",
					code: 400,
				});
			}

			await plato.update({ estado: estado });

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

	async modificar(req, res) {
		try {
			const external = req.params.external;
			const { nombre, tipo, precio } = req.body;

			const platoAux = await platos.findOne({
				where: { external_id: external },
				include: [
					{
						model: tipos,
						as: "tipo_plato",
						attributes: ["nombre"],
					},
				],
			});

			if (!platoAux) {
				return res.status(404).json({ msg: "ERROR", tag: "No se pudo encontrar el plato", code: 404 });
			}

			if (nombre && nombre.toLowerCase() !== platoAux.nombre.toLowerCase()) {
				const platoExistente = await platos.findOne({
					where: { nombre: nombre }
				});

				if (platoExistente) {
					return res.status(400).json({ msg: "ERROR", tag: "Ya existe un plato con ese nombre", code: 400 });
				}

				platoAux.nombre = nombre;
			}

			if (tipo && tipo !== platoAux.tipo_plato.nombre) {
				const tipoExistente = await tipos.findOne({
					where: { nombre: tipo }
				});

				if (!tipoExistente) {
					return res.status(400).json({ msg: "ERROR", tag: "Tipo de plato no válido.", code: 400 });
				}

				platoAux.id_tipo_plato = tipoExistente.id;
			}

			if(precio !== undefined){
				const precioFloat = parseFloat(precio);
				if(isNaN(precioFloat) || precioFloat < 0){
					return res.status(400).json({ msg: "ERROR", tag: "El precio debe ser un número positivo", code: 400 });
				}
				if (precioFloat !== platoAux.precio) {
					platoAux.precio = precioFloat;

					let cuentaPlatos = await CuentaPlato.findAll({
						where: {
							id_plato: platoAux.id
						}
					});

					if(cuentaPlatos && cuentaPlatos.length > 0){
						for(const cuentaPlato of cuentaPlatos){
							const nuevoTotal = cuentaPlato.cantidad * precioFloat;
							cuentaPlato.total = nuevoTotal;
							await cuentaPlato.save();
						}
					}
				}
			}

			await platoAux.save();

			return res.status(200).json({ msg: "OK", tag: "Plato modificado correctamente", code: 200 });
		} catch (error) {
			console.error('Error al obtener tipos de plato:', error);
			return res.status(500).json({ msg: "Error interno del servidor", code: 500 });
		}
	}
}

module.exports = PlatoControl;