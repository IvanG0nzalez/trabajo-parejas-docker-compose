"use client";

import Menu from "@/componentes/menu";
import ObtenerCuenta from "@/componentes/obtenerCuenta";
import { estaSesion } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Cuentas() {
	const router = useRouter();

	useEffect(() => {
		if (!estaSesion()) {
			router.push("/");
		}
	}, [router]);

	if (!estaSesion()) {
		return null;
	}

	return (
		<div>
			<Menu></Menu>
			<div className="container-fluid">
				<ObtenerCuenta></ObtenerCuenta>
			</div>
		</div>
	);
}