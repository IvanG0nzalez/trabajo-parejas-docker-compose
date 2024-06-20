"use client";

import { getToken } from "@/hooks/SessionUtil";
import { useEffect, useState } from "react";
import LoadingScreen from "./loadingScreen";
import Link from "next/link";
import mensajes from "./Mensajes";
import { FaSpinner } from 'react-icons/fa';
import { api_plato, api_tipo } from "@/hooks/Api";

const ObtenerPlato = () => {
	const [platos, setPlatos] = useState([]);
	const [filtroTipo, setFiltroTipo] = useState("");
	const [tiposPlatos, setTiposPlatos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const token = getToken();
			const [response_platos, response_tipos] = await Promise.all([
				api_plato.listar_platos(token),
				api_tipo.listar_tipos_platos_disponibles(token),
			]);
			setPlatos(response_platos.datos);
			setTiposPlatos(response_tipos.datos);
			setIsLoading(false);
		};
		fetchData();
	}, []);

	const handleCambioEstado = async (external_id, estado) => {
		setLoading(true);
		const token = getToken();
		const nuevoEstado = !estado;

		api_plato.cambiar_estado_plato(external_id, {estado: nuevoEstado}, token).then(response => {
			if (response.code === 200) {
				api_plato.listar_platos(token).then(response => {
					setPlatos(response.datos);
					if (nuevoEstado) {
						mensajes("OK", "El plato ahora está disponible para pedir!", "success");
					} else {
						mensajes("OK", "Se ha eliminado el plato de la lista!", "success");
					}
				});
			} else {
				mensajes("Intenta de nuevo", "Algo salió mal", "error");
			}
		}).catch(error => {
			mensajes("Intenta de nuevo", "Algo salió mal", "error");
		}).finally(() => {
			setLoading(false);
		});
	};

	const handleFiltroTipoChange = (event) => {
		setFiltroTipo(event.target.value);
	};

	const platosFiltrados = (filtroTipo
		? platos.filter((plato) => plato.tipo === filtroTipo)
		: platos) || [];


	if (isLoading) {
		return LoadingScreen();
	}

	return (
		<div>
			<div className="table-container">
				<div className="center-h1">
					<h1>Platos Registrados</h1>
				</div>

				<div className="filtro-tipo">
					<label htmlFor="tipo">Filtrar: </label>
					<select id="tipo" value={filtroTipo} onChange={handleFiltroTipoChange} className="form-select" disabled={!platos.length}>
						<option value="">Todos</option>
						{tiposPlatos.map((tipo, i) => (
							<option key={i} value={tipo}>{tipo}</option>
						))}
					</select>
					<Link href={`/plato/agregar`}>
						<button className="btn btn-success">Agregar Plato</button>
					</Link>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>Número</th>
							<th>Nombre</th>
							<th>Precio</th>
							<th>Tipo</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{platos.length > 0 ? (
							platosFiltrados.map((plato, i) => (
								<tr key={i}>
									<td>{i + 1}</td>
									<td>{plato.nombre}</td>
									<td>${plato.precio}</td>
									<td>{plato.tipo}</td>
									<td>
										<div className="actions">
											{plato.estado ? (
												<>
													<Link href={`/plato/modificar/${plato.external_id}`}>
														<button className="btn btn-primary">Modificar</button>
													</Link>
													<button className="btn btn-danger" onClick={() => handleCambioEstado(plato.external_id, plato.estado)} disabled={loading}>
														{loading ? <FaSpinner className="spinner" /> : "Deshabilitar"}
													</button>
												</>
											) : (
												<button className="btn btn-success" onClick={() => handleCambioEstado(plato.external_id, plato.estado)} disabled={loading}>
													{loading ? <FaSpinner className="spinner" /> : "Habilitar"}
												</button>
											)}
										</div>
									</td>
								</tr>

							))
						) : (
							<tr>
								<td colSpan="4" className="no-pedidos-row">Aún no se han registrado ningún plato</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<style jsx>{`
				.table-container {
					overflow-x: auto;
					width: 50%;
					margin: 20px auto;
					padding: 20px;
				}

				table {
					max-width: 100%;
					border-collapse: collapse;
					margin-top: 20px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					border-radius: 8px;
					overflow: hidden;
					background-color: #fff;
				}

				th,
				td {
					border: 1px solid #ddd;
					padding: 8px;
					text-align: center;
					vertical-align: middle;
				}

				th {
					background-color: #f2f2f2;
				}

				.btn {
					margin-right: 10px;
				}

				.center-h1 {
					text-align: center;
					margin-bottom: 20px;
				}

				.actions {
					display: flex;
					justify-content: center;
				}

				.filtro-tipo {
					display: flex;
					justify-content: left;
					gap: 15px;
				}

				.filtro-tipo label {
					margin-top: 7px;
				}

				.filtro-tipo select {
					padding: 5px;
					border-radius: 4px;
					max-width: 40%;
					max-height: 40px;
				}

				.filtro-tipo button {
					max-height: 40px;
				}

				@media (max-width: 768px) {
					.table-container {
						width: 100%;
						padding: 10px;
					}

					.actions {
						flex-direction: column;
						align-items: center;
					}

					.btn {
						margin-top: 3px;
						margin-right: 0px;
					}
				}

				@media (max-width: 1024px) {
					.table-container {
					  width: 80%;
					  padding: 10px;
					}
			  	}
			`}</style>
		</div>
	)

}

export default ObtenerPlato;