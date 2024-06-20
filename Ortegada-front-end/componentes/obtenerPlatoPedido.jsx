"use client";

import React, { useState, useEffect } from "react";
import { getId, getToken } from "@/hooks/SessionUtil";
import LoadingScreen from "./loadingScreen";
import PlatoCard from "./platoCard";
import mensajes from "./Mensajes";
import { FaSpinner } from "react-icons/fa";
import { api_cuenta_plato, api_plato, api_tipo } from "@/hooks/Api";

const ObtenerPlatoPedido = () => {
	const [platos, setPlatos] = useState([]);
	const [pedidos, setPedidos] = useState([]);
	const [ordenTipos, setOrdenTipos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const token = getToken();
	const external_usuario = getId();
	let platosPorTipo = {};

	useEffect(() => {
		const fetchData = async () => {

			const [response_platos, response_pedidos, response_tipos] = await Promise.all([
				api_plato.listar_platos_disponibles(token),
				api_cuenta_plato.listar_plato_cuenta(external_usuario, token),
				api_tipo.listar_tipos_platos_disponibles(token),
			]);
			setPlatos(response_platos.datos);
			setPedidos(response_pedidos.datos);
			setOrdenTipos(response_tipos.datos);
			setIsLoading(false);
		};

		if (typeof window !== "undefined") {
			fetchData();
		}
	}, []);

	if (isLoading) {
		return LoadingScreen();
	}

	const updatePedidos = async () => {
		setLoading(true);

		api_cuenta_plato.listar_plato_cuenta(external_usuario, token).then(response => {
			setPedidos(response.datos);
		}).catch(error => {
			mensajes("Error", "Hubo un error al guardar el pedido, intente de nuevo más tarde", "error");
		}).finally(() => {
			setLoading(false);
		});
	};

	const handleCancelarPedido = async (nombrePedido) => {
		setLoading(true);
		let datos = {
			external_cuenta: external_usuario,
			nombre_plato: nombrePedido
		};

		api_cuenta_plato.cancelar_cuenta_plato(datos, token).then(response => {
			if (response.code === 200) {
				api_cuenta_plato.listar_plato_cuenta(external_usuario, token).then(response => {
					setPedidos(response.datos);
					mensajes("OK", "Su pedido ha sido cancelado", "success");
				});
			} else {
				mensajes("Error", "Hubo un error al cancelar el pedido, intente de nuevo más tarde", "error");
				setLoading(false);
			}
		}).catch(error => {
			mensajes("Error", "Hubo un error al cancelar el pedido, intente de nuevo más tarde", "error");
		}).finally(() => {
			setLoading(false);
		});
	};

	if (platos && platos.length > 0) {
		platosPorTipo = platos.reduce((acc, plato) => {
			if (!acc[plato.tipo]) {
				acc[plato.tipo] = [];
			}
			acc[plato.tipo].push(plato);
			return acc;
		}, {});
	}

	return (
		<div className="container">
			<h1>LISTADO DE PLATOS</h1>
			{!platos || !platos.length ? (
				<div className="contenedor-no-platos">
					<div className="no-platos">
						<div className="separador"></div>
						<h2>Aún no hay platos disponibles para pedir. Regresa luego :(</h2>
						<div className="separador"></div>
					</div>
				</div>
			) : (
				ordenTipos.map((tipo) => (
					platosPorTipo[tipo] && platosPorTipo[tipo].length > 0 && (
						<div key={tipo}>
							<div className="separador"></div>
							<h2>{tipo}</h2>
							<div className="separador"></div>
							{pedidos[tipo] && (
								<div className="platos-pedidos">
									<ul>
										{pedidos[tipo].map((pedido, j) => (
											<li key={j}>
												Ha pedido {pedido.cantidad} plato(s) de "{pedido.nombre}" (Total de ${pedido.total}) <button className="btn btn-danger" onClick={() => handleCancelarPedido(pedido.nombre)} disabled={loading}>
													{loading ? <FaSpinner className="spinner" /> : "Cancelar pedido"}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
							<div className="plato-list">
								{platosPorTipo[tipo].map((plato, i) => (
									<PlatoCard key={i} plato={plato} external_usuario={external_usuario} token={token} updatePedidos={updatePedidos} />
								))}
							</div>
						</div>
					)
				))
			)}
			<style jsx>{`
				.contenedor-no-platos {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 90vh;
				}

				.no-platos {
					text-align: center;
				}

				h1 {
				text-align: center;
				margin-bottom: 20px;
				margin-top: 1rem;
				}

				.platos-pedidos {
					display: flex;
					flex-warp: wrap;
					justify-content: left;
				}

				.plato-list {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					margin-bottom: 20px;
				}

				.separador {
					border-bottom: 1px solid #ccc;
					margin-bottom: 10px;
				}

				li {
         	 		margin: 5px 0;
          			color: #555;
       			 }
      		`}</style>
		</div>
	);
}

export default ObtenerPlatoPedido;