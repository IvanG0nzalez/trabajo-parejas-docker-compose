"use strict";

var models = require("../models");
var platos = models.plato;
var cuentas = models.cuenta;
var CuentaPlato = models.cuenta_plato;
var tipos = models.tipo_plato;
const { check, validationResult } = require("express-validator");
const { Op, where } = require('sequelize');

class CuentaPlatoControl {

	async guardar(req, res) {
		const external_cuenta = req.params.external_cuenta;
		const external_plato = req.params.external_plato;
		const cantidad = req.body.cantidad;

		if (!external_cuenta || !external_plato || !cantidad) {
			return res.status(400).json({ msg: "Error", tag: "Faltan datos", code: 400 });
		}

		const cantidadInt = parseInt(cantidad);
		if(isNaN(cantidadInt) || cantidadInt <= 0){
			return res.status(400).json({ msg: "ERROR", tag: "La cantidad debe ser un número entero positivo", code: 400 });
		}

		const cuentaAux = await cuentas.findOne({ where: { external_id: external_cuenta, estado: true } });
		const platoAux = await platos.findOne({ where: { external_id: external_plato } });

		if (!cuentaAux) {
			return res.status(204).json({ msg: "Error", tag: "La cuenta no existe", code: 204 });
		}

		if (!platoAux) {
			return res.status(204).json({ msg: "Error", tag: "El plato no existe", code: 204 });
		}

		let cuentaPlato = await CuentaPlato.findOne({
			where: {
				id_cuenta: cuentaAux.id,
				id_plato: platoAux.id
			}
		});

		const valor_total = cantidadInt * platoAux.precio;

		if (!cuentaPlato) {
			cuentaPlato = await CuentaPlato.create({
				id_cuenta: cuentaAux.id,
				id_plato: platoAux.id,
				cantidad: cantidadInt,
				total: valor_total,
			});
			console.log(cuentaPlato);
		} else {
			cuentaPlato.cantidad = cantidad;
			cuentaPlato.total = valor_total;
			await cuentaPlato.save();
		}

		return res.status(200).json({ msg: "OK", tag: "Selección guardada correctamente", code: 200 });

	}

	async listar(req, res) {
		const external_cuenta = req.params.external;

		if (!external_cuenta) {
			return res.status(400).json({ msg: "Error", tag: "Faltan datos", code: 400 });
		}

		const cuentaAux = await cuentas.findOne({
			where: {
				external_id: external_cuenta,
				estado: true
			}
		});

		if (!cuentaAux) {
			return res.status(204).json({ msg: "Error", tag: "La cuenta no existe", code: 204 });
		}

		const cuentaPlatoAux = await CuentaPlato.findAll({
			where: {
				id_cuenta: cuentaAux.id,
				cantidad: { [Op.gt]: 0 }
			}
		});

		if (!cuentaPlatoAux || cuentaPlatoAux.length === 0) {
			return res.status(200).json({ msg: "Error", code: 200, tag: "Aún no ha seleccionado platos", datos: {} });
		}

		const platosIds = cuentaPlatoAux.map(item => item.id_plato);

		const platosAux = await platos.findAll({
			where: { id: platosIds, estado: true },
			attributes: ["id", "nombre", "precio", "id_tipo_plato", "external_id"]
		});

		const platosAgrupados = {};

		for (const item of cuentaPlatoAux) {
			const plato = platosAux.find(plato => plato.id === item.id_plato);
			if (plato) {
				const tipoPlato = await tipos.findByPk(plato.id_tipo_plato);
				if (tipoPlato) {
					if (!platosAgrupados[tipoPlato.nombre]) {
						platosAgrupados[tipoPlato.nombre] = [];
					}
					platosAgrupados[tipoPlato.nombre].push({ nombre: plato.nombre, cantidad: item.cantidad, total: item.total });
				}
			}
		}

		const tiposAux = await tipos.findAll({
			attributes: ['nombre'],
			order: [['id', 'ASC']]
		});

		const ordenTiposPlato = tiposAux.map(tipo => tipo.nombre);

		const respuesta = { usuario: cuentaAux.correo };

		ordenTiposPlato.forEach(tipo => {
			if (platosAgrupados[tipo]) {
				respuesta[tipo] = platosAgrupados[tipo].sort((a, b) => b.cantidad - a.cantidad);
			}
		});

		return res.status(200).json({ msg: "OK", code: 200, datos: respuesta });
	}

	async listar_platos(req, res) {
		try {
			const cuentaPlatoAux = await CuentaPlato.findAll({
				include: [
					{
						model: cuentas,
						where: {
							estado: true
						}
					},
					{
						model: platos,
						where: {
							estado: true
						},
						include: [
							{
								model: tipos,
								as: "tipo_plato",
								where: {
									estado: true
								},
								attributes: ['nombre'],
							}
						]
					}
				],
				where: {
					cantidad: { [Op.gt]: 0 },
					total: { [Op.gt]: 0 }
				}
			});

			const platosAgrupados = [];

			for (const item of cuentaPlatoAux) {
				const cuenta = await cuentas.findByPk(item.id_cuenta);
				const plato = await platos.findByPk(item.id_plato, {
					include: [
						{
							model: tipos,
							as: "tipo_plato",
							attributes: ['nombre'],
						},
					],
				});

				if (cuenta && plato) {
					const platoInfo = {
						usuario: cuenta.nombre_usuario || "Sin Definir",
						correo: cuenta.correo,
						nombre_plato: plato.nombre,
						tipo_plato: plato.tipo_plato.nombre,
						precio: plato.precio,
						cantidad: item.cantidad,
						total: item.total,
					};

					platosAgrupados.push(platoInfo);
				}
			}

			platosAgrupados.sort((a, b) => a.usuario.localeCompare(b.usuario));

			const respuesta = {
				msg: "OK",
				code: 200,
				datos: platosAgrupados
			};

			return res.status(200).json(respuesta);
		} catch (error) {
			console.error("Error al listar platos:", error);
			return res.status(500).json({ msg: "Error", tag: "Error interno del servidor", code: 500 });
		}
	}

	async cancelarPedido(req, res) {
		const external_cuenta = req.body.external_cuenta;
		const nombre_plato = req.body.nombre_plato;

		if (!external_cuenta || !nombre_plato) {
			return res.status(400).json({ msg: "Error", tag: "Faltan datos", code: 400 });
		}

		const cuentaAux = await cuentas.findOne({
			where: { external_id: external_cuenta }
		});

		const platoAux = await platos.findOne({
			where: { nombre: nombre_plato }
		});

		if (!cuentaAux || !platoAux) {
			return res.status(400).json({ msg: "Error", tag: "No hay ningún pedido con esos datos", code: 400 });
		}

		const cuentaPlatoAux = await CuentaPlato.findOne({
			where: {
				id_cuenta: cuentaAux.id,
				id_plato: platoAux.id
			}
		});

		if (!cuentaPlatoAux) {
			return res.status(400).json({ msg: "Error", tag: "No se encontró el pedido", code: 400 });
		}

		await cuentaPlatoAux.update({ 
			cantidad: 0, 
			total: 0 
		});

		return res.status(200).json({ msg: "OK", tag: "Se ha cancelado el pedido", code: 200 });
	}
}

module.exports = CuentaPlatoControl;