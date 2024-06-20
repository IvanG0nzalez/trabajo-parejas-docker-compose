"use client";

import { getToken } from "@/hooks/SessionUtil";
import { useEffect, useState } from "react";
import LoadingScreen from "./loadingScreen";
import Link from "next/link";
import mensajes from "./Mensajes";
import { FaSpinner } from 'react-icons/fa';
import { api_tipo } from "@/hooks/Api";

const ObtenerTipo = () => {
	const [tipos, setTipos] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const token = getToken();
		api_tipo.listar_tipos_platos(token).then(response => {
			setTipos(response.datos);
		});
	}, []);

	const handleCambioEstado = async (external_id, estado) => {
		setLoading(true);
		const token = getToken();
		const nuevoEstado = !estado;

		api_tipo.cambiar_estado_tipo_plato(external_id, {estado: nuevoEstado}, token).then(response => {
			if (response.code === 200) {
				api_tipo.listar_tipos_platos(token).then(response => {
					setTipos(response.datos);
					if (nuevoEstado) {
						mensajes("OK", "Tipo de plato habilitado correctamente!", "success");
					} else {
						mensajes("OK", "Tipo de plato deshabilitado correctamente!", "success");
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

	if (!tipos) {
		return LoadingScreen();
	}

	return (
		<div>
			<div className="table-container">
				<div className="center-h1">
					<h1>Tipos de Platos Registrados</h1>
					<Link href={`/tipo/agregar`}>
						<button className="btn btn-success">Agregar Tipo de Plato</button>
					</Link>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>Número</th>
							<th>Nombre</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{tipos.map((tipo, i) => (
							<tr key={i}>
								<td>{i + 1}</td>
								<td>{tipo.nombre}</td>
								<td>
									<div className="actions">
										{tipo.estado ? (
											<>
												<Link href={`/tipo/modificar/${tipo.external_id}`}>
													<button className="btn btn-primary">Modificar</button>
												</Link>
												<button className="btn btn-danger" onClick={() => handleCambioEstado(tipo.external_id, tipo.estado)} disabled={loading}>
													{loading ? <FaSpinner className="spinner" /> : "Deshabilitar"}
												</button>
											</>
										) : (
											<button className="btn btn-success" onClick={() => handleCambioEstado(tipo.external_id, tipo.estado)} disabled={loading}>
												{loading ? <FaSpinner className="spinner" /> : "Habilitar"}
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
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
                    text-decoration: none;
                    color: #fff;
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
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

                @media (max-width: 768px) {
					.table-container {
						width: 100%;
						padding: 10px;
					}

                    .actions {
                        flex-direction: column;
                        align-items: center;
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

export default ObtenerTipo;