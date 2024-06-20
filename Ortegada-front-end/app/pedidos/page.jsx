"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { estaSesion } from "@/hooks/SessionUtil";
import Menu from "@/componentes/menu";
import ObtenerPedidos from "@/componentes/obtenerPedidos";

export default function Pedidos() {
  const router = useRouter();

  useEffect(() => {
    if(!estaSesion()) {
      router.push('/')
    }
  }, [router]);

  if(!estaSesion()) {
    return null;
  }
    
  return (
    <div>
      <Menu></Menu>
      <div className="container-fluid">
        <ObtenerPedidos></ObtenerPedidos>
      </div>
    </div>
  );
}