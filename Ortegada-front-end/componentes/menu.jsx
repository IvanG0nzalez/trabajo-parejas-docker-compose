"use client";
import { borrarSesion, getId, getToken } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import mensajes from "./Mensajes";
import { useEffect, useState } from "react";
import LoadingScreen from "./loadingScreen";
import { api_cuenta } from "@/hooks/Api";

export default function Menu() {
	const router = useRouter();
	const token = getToken();
	const external_usuario = getId();

	const [usuarioData, setUsuarioData] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		api_cuenta.obtener_cuenta(external_usuario, token).then((response) => {
			if (response.code === 200) {
				setUsuarioData(response.datos);
			}
			setIsLoading(false);
		});
	}, [external_usuario, token]);

	const salir = async () => {
		await borrarSesion();
		mensajes("Adiós!", "Hasta la próxima", "success");
		router.push('/');
		router.refresh();
	}

	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<nav>
			<div className="encabezado">
			</div>
			<div className="navegacion">
			<ul>
				<span className="username">{usuarioData.nombre_usuario}</span>
				<li className="li-nav">
					<button
						className="menu-item"
						onClick={() => router.push("/pedido")}
					>
						<i className="fas fa-book"></i> Mis Pedidos
					</button>
				</li>
				<li className="li-nav">
					<button
						className="menu-item"
						onClick={() => router.push("/cuenta/modificar")}
					>
						<i className="fas fa-user"></i> Cuenta
					</button>
				</li>
				{usuarioData && (usuarioData.rol.nombre === "Administrador" || usuarioData.rol.nombre === "Organizador") && (
					<>
						<div className="separator"></div>
						<li className="li-nav">
							<button
								className="menu-item"
								onClick={() => router.push("/cuenta")}
							>
								<i className="fas fa-users"></i> Cuentas
							</button>
						</li>
						<li className="li-nav">
							<button
								className="menu-item"
								onClick={() => router.push("/plato")}
							>
								<i className="fas fa-utensils"></i> Platos
							</button>
						</li>
						<li className="li-nav">
							<button
								className="menu-item"
								onClick={() => router.push("/tipo")}
							>
								<i className="fas fa-clipboard"></i> Tipos de Platos
							</button>
						</li>
						<li className="li-nav">
							<button
								className="menu-item"
								onClick={() => router.push("/pedidos")}
							>
								<i className="fas fa-list-ul"></i> Pedidos
							</button>
						</li>
					</>
				)}
			</ul>
			<button className="btn-logout" onClick={salir}><i className="fas fa-sign-out-alt"></i>Cerrar Sesión</button>
			</div>
			
			<style jsx>{`
				.separator {
					border-left: 1px solid white;
					height: %100;
					margin: 0 5px 0 5px; 
				}

       			nav {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					align-items: center;
					background-color: #333;
					color: white;
				}

				.encabezado {
					width: 100%;
					height: 12.6rem;
					background: url('../familia.png') center;
					background-size: contain;
				}

				.navegacion {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10px;
					border-top: 2px solid #666;
				}

				ul {
					display: flex;
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.li-nav {
					margin-right: 10px;
					margin-left: 10px;
					margin-top: 5px;
				}

				a {
					color: white;
					text-decoration: none;
					padding: 10px;
				}

				button {
					background-color: transparent;
					border: none;
					color: white;
					cursor: pointer;
				}
				

				.username {
					background-color: #444; 
					padding: 5px 10px;
					border-radius: 5px; 
					margin-right: 10px;
					margin-left: 10px;
				}

				.menu-item {
					border-radius: 5px;
					padding: 0 5px;
				}

				.menu-item:hover {
					background-color: #444;
				}

				.btn-logout {
					background-color: #000; 
					padding: 5px 10px;
					border-radius: 5px; 
					display: flex;
					align-items: center;
				}

				.btn-logout i {
					margin-right: 8px;
				}

				.btn-logout:hover {
					background-color: #222;
				}

				@media (max-width: 768px) {
					ul {
						flex-direction: column;
						padding: 5px;
					}

					.li-nav {
						margin: 6px 12px;
					}

					.separator {
						border-bottom: 1px solid white;
						height: %100;
						margin: 0 5px 0 5px; 
					}
				}
			`}</style>
		</nav>
	);
}