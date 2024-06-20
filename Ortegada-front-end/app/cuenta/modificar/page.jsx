"use client";

import mensajes from "@/componentes/Mensajes";
import Menu from "@/componentes/menu";
import { api_cuenta } from "@/hooks/Api";
import { estaSesion, getId, getToken } from "@/hooks/SessionUtil";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

export default function Modificar() {
	const router = useRouter();
	const token = getToken();
	const external_usuario = getId();
	const [usuario, setUsuario] = useState({});
  const [showPassword, setShowPassword] = useState(false);

	const schema = Yup.object().shape({
		correo: Yup.string()
			.email("Ingrese un correo electrónico válido")
      .required("El correo electrónico es obligatorio"),
    nombre_usuario: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Ingrese solo letras")
      .required("Ingrese un nombre de usuario"),
		clave: Yup.string(),
	});

	const formOptions = { resolver: yupResolver(schema)};
	const { register, handleSubmit, formState, reset } = useForm(formOptions);
	const { errors } = formState;

	useEffect(() => {
    api_cuenta.obtener_cuenta(external_usuario, token).then((response) => {
      if (response.code === 200) {
        setUsuario(response.datos);
        reset({
          correo: response.datos.correo,
          nombre_usuario: response.datos.nombre_usuario,
        
        });
      }
    });
	}, [external_usuario, reset, token]);

  if (typeof window === "undefined") {
    return null;
  }

	if (!estaSesion()) {
		router.push("/");
		return null;
	}

	const sendData = (formData) => {
		var datos = {
			correo: formData.correo,
      nombre_usuario: formData.nombre_usuario,
		};

    if(formData.clave) {
      datos.clave = formData.clave;
    }
    api_cuenta.modificar_cuenta(external_usuario, datos, token).then(
      (response) => {
        if (response.code === 200) {
          mensajes("OK", response.tag, "success");
          router.push("/pedido");
        } else {
          mensajes("Error", response.tag, "error");
        }
      }
    );
	};

	return(
		<div>
      <Menu></Menu>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card">
              <div className="card-body p-5 text-center">
                <h2 className="mb-4">Modificar Datos de la Cuenta</h2>
                <form onSubmit={handleSubmit(sendData)}>
                  <div className="mb-4">
                    <label className="form-label">Correo electrónico</label>
                    <input
                      {...register("correo")}
                      name="correo"
                      id="correo"
                      className={`form-control ${errors.correo ? "is-invalid" : ""
                        }`}
                      placeholder={`Ingrese su correo electrónico`}
                    />
                    <div className="invalid-feedback">
                      {errors.correo?.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Nombre de Usuario</label>
                    <input
                      {...register("nombre_usuario")}
                      name="nombre_usuario"
                      id="nombre_usuario"
                      className={`form-control ${errors.nombre_usuario ? "is-invalid" : ""
                        }`}
                      placeholder={`Ingrese un nombre de usuario`}
                    />
                    <div className="invalid-feedback">
                      {errors.nombre_usuario?.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Contraseña</label>
                    <input
                      {...register("clave")}
                      name="clave"
                      id="clave"
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.clave ? "is-invalid" : ""
                        }`}
                      placeholder={`Ingrese una contraseña`}
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
                    <Link href="/pedido" className="btn btn-danger">
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