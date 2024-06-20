"use client";

import { api_cuenta } from "@/hooks/Api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmarCuenta() {
  const router = useRouter();
  const { token } = useParams();
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (token) {
      api_cuenta.confirmar_cuenta(token).then((response) => {
        if (response.code === 200) {
          setMensaje(`${response.tag}. Ya puede cerrar esta ventana`);
        } else {
          setMensaje(response.tag);
        }
      }).catch(() => {
        setMensaje(
          "Algo salió mal al confirmar la cuenta, comunicate con un organizador"
        );
      });
    }
  }, [token, router]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card">
            <div className="card-body p-5 text-center">
              <h2 className="mb-4">Confirmación de Cuenta</h2>
              <p>{mensaje}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
