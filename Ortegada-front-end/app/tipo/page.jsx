"use client";

import Menu from "@/componentes/menu";
import ObtenerTipo from "@/componentes/obtenerTipo";
import { estaSesion } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Tipos() {
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
				<ObtenerTipo></ObtenerTipo>
			</div>
		</div>
	);
}