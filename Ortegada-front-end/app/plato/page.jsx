"use client";

import Menu from "@/componentes/menu";
import ObtenerPlato from "@/componentes/obtenerPlato";
import ObtenerPlatoPedido from "@/componentes/obtenerPlatoPedido";
import { estaSesion } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Platos() {
  const router = useRouter();

  useEffect(() => {
    if(!estaSesion()) {
      router.push('/');
    }
  }, [router]);

  if(!estaSesion()) {
    return null;
  }

  return (
    <div>
      <Menu></Menu>
      <div className="container-fluid">
        <ObtenerPlato></ObtenerPlato>
      </div>
    </div>
  );
}