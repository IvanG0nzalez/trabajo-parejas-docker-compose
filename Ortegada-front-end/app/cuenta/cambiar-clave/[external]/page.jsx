"use client";

import mensajes from "@/componentes/Mensajes";
import Menu from "@/componentes/menu";
import { api_cuenta } from "@/hooks/Api";
import { estaSesion, getToken } from "@/hooks/SessionUtil";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

export default function ModificarClave() {
  const router = useRouter();
  const token = getToken();
  const { external } = useParams();
  const [usuario, setUsuario] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const schema = Yup.object().shape({
    clave: Yup.string(),
  });

  const formOptions = { resolver: yupResolver(schema) };
  const { register, handleSubmit, formState, reset } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {
    api_cuenta.obtener_cuenta(external, token).then((response) => {
      if (response.code === 200) {
        setUsuario(response.datos);
      }
    });
  }, [external, token]);

  if (!estaSesion()) {
    router.push("/");
    return null;
  }

  const sendData = (formData) => {
    var datos = {};

    if (formData.clave) {
      datos.clave = formData.clave;
    }

    api_cuenta.cambiar_clave_cuenta(external, datos, token).then((response) => {
      if (response.code === 200) {
        mensajes("OK", response.tag, "success");
        router.push("/cuenta");
      } else {
        mensajes("Error", response.tag, "error");
      }
    });
  };

  return (
    <div>
      <Menu></Menu>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card">
              <div className="card-body p-5 text-center">
                <h2 className="mb-4">Cambiar contraseña de {usuario.correo}</h2>
                <form onSubmit={handleSubmit(sendData)}>
                  <div className="mb-4">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                      {...register("clave")}
                      name="clave"
                      id="clave"
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.clave ? "is-invalid" : ""
                        }`}
                      placeholder={`Ingrese una nueva contraseña`}
                    />
                    <div className="invalid-feedback">
                      {errors.clave?.message}
                    </div>

                    <div className="form-check mt-2 d-flex align-items-center">
                      <input
                        type="checkbox"
                        onChange={() => setShowPassword(!showPassword)}
                        id="mostrarContrasena"
                        className="form-check-input"
                        style={{
                          cursor: "pointer",
                          marginRight: "6px",
                          boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
                        }}
                      />
                      <label
                        style={{
                          fontSize: "12px",
                          color: "gray",
                          marginTop: "5px",
                        }}
                      >
                        Mostrar contraseña
                      </label>
                    </div>
                  </div>



                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      Guardar cambios
                    </button>
                    <Link href="/cuenta" className="btn btn-danger">
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}