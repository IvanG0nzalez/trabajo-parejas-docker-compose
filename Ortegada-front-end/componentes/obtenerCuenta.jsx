"use client";

import { getToken } from "@/hooks/SessionUtil";
import { useEffect, useState } from "react";
import LoadingScreen from "./loadingScreen";
import Link from "next/link";
import mensajes from "./Mensajes";
import { FaSpinner } from 'react-icons/fa';
import { api_cuenta } from "@/hooks/Api";

const ObtenerCuenta = () => {
	const [cuentas, setCuentas] = useState([]);
	const [loading, setLoading] = useState(false);
	const token = getToken();

	useEffect(() => {

		api_cuenta.listar_cuentas(token).then((response) => {
			if (response.code === 200) {
				setCuentas(response.datos);
			}
		});
	}, []);

	const handleCambioEstado = async (external_id, estado) => {
		setLoading(true);
		const token = getToken();
		const nuevoEstado = !estado;

		api_cuenta.cambiar_estado_cuenta(external_id, { estado: nuevoEstado }, token).then((response_cambio) => {
			if (response_cambio.code === 200) {
				api_cuenta.listar_cuentas(token).then((response) => {
					setCuentas(response.datos);
					if (nuevoEstado) {
						mensajes("OK", "Cuenta habilitada correctamente!", "success");
					} else {
						mensajes("OK", "Cuenta deshabilitada correctamente!", "success");
					}
				});	
			} else {
				mensajes("Error", response_cambio.tag, "error");
			}
		}).catch((error) => {
			mensajes("Intenta de nuevo", "Algo salió mal", "error");
		}).finally(() => {
			setLoading(false);
		});
	};

	if (!cuentas) {
		return LoadingScreen();
	}

	return (
		<div>
			<div className="table-container">
				<div className="center-h1">
					<h1>Cuentas Registradas</h1>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>Número</th>
							<th>Correo electrónico</th>
							<th>Nombre de Usuario</th>
							<th>Rol</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{cuentas.map((cuenta, i) => (
							<tr key={i}>
								<td>{i + 1}</td>
								<td>{cuenta.correo}</td>
								<td>{cuenta.nombre_usuario}</td>
								<td>{cuenta.rol.nombre}</td>
								<td>
									<div className="actions">
										{cuenta.estado ? (
											<>
												<Link href={`/cuenta/cambiar-clave/${cuenta.external_id}`}>
													<button className="btn btn-primary">Cambiar contraseña</button>
												</Link>
												<button className="btn btn-danger" onClick={() => handleCambioEstado(cuenta.external_id, cuenta.estado)} disabled={loading}>
													{loading ? <FaSpinner className="spinner" /> : "Deshabilitar Cuenta"}
												</button>
											</>
										) : (
											<button className="btn btn-success" onClick={() => handleCambioEstado(cuenta.external_id, cuenta.estado)} disabled={loading}>
												{loading ? <FaSpinner className="spinner" /> : "Habilitar Cuenta"}
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
					width: 60%;
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
						width: 85%;
						padding: 10px;
				  	}
				}
			`}</style>
		</div>
	)

}

export default ObtenerCuenta;