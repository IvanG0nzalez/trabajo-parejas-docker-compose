"use client";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import mensajes from "@/componentes/Mensajes";
import { api_cuenta } from "@/hooks/Api";

export default function Registro() {
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    correo: Yup.string()
      .email("Ingrese un correo electrónico válido")
      .required("El correo electrónico es obligatorio"),
    nombre_usuario: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Ingrese solo letras")
      .required("Ingrese un nombre de usuario"),
    clave: Yup.string()
      .required("Ingrese su contraseña")
      .min(4, "La contraseña debe tener al menos 4 caracteres"),
    confirmarClave: Yup.string().oneOf(
      [Yup.ref("clave"), null], "Las contraseñas deben coincidir")
      .required("Confirme su contraseña")
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  const sendData = async (data) => {
    const userData = {
      correo: data.correo,
      nombre_usuario: data.nombre_usuario,
      clave: data.clave,
    };

    api_cuenta.registro_cuenta(userData).then((datos) => {
      if (datos.code === 200) {
        mensajes(
          "Registro Exitoso!",
          datos.tag,
          "success"
        );
        router.push("/");
      } else {
        mensajes(
          "Error al registrarlo",
          datos.tag,
          "error"
        );
      }
    });
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleInicioSesionClick = () => {
    router.push("/");
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundImage: 'url("../fondo.png")',
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <section className="vh-100 gradient-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div
                className="card"
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.8)",
                  borderRadius: "1rem",
                  backgroundColor: "rgba(250, 250, 250, 0.2)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
                }}
              >
                <div className="card-body p-5 text-center">
                  <form onSubmit={handleSubmit(sendData)}>
                    <h2 className="fw-bold mb-2 text-uppercase">
                      Registro de Usuarios
                    </h2>
                    <p className="text-dark-50 mb-4">
                      Ingrese su usuario y contraseña para registrarse
                    </p>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label">Correo electrónico</label>
                      <input
                        {...register("correo")}
                        name="correo"
                        id="correo"
                        className={`form-control ${errors.correo ? "is-invalid" : ""
                          }`}
                        placeholder={`Ingrese su correo electrónico`}
                      />

                      <div className="alert alert-danger invalid-feedback">
                        {errors.correo?.message}
                      </div>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label">Nombre de usuario</label>
                      <input
                        {...register("nombre_usuario")}
                        name="nombre_usuario"
                        id="nombre_usuario"
                        className={`form-control ${errors.nombre_usuario ? "is-invalid" : ""
                          }`}
                        placeholder={`Utilizar el formato "Nombre Apellido"`}
                      />

                      <div className="alert alert-danger invalid-feedback">
                        {errors.nombre_usuario?.message}
                      </div>
                    </div>

                    <div className="form-outline form-white mb-3">
                      <label className="form-label">Contraseña</label>
                      <div className="input-group">
                        <input
                          {...register("clave")}
                          name="clave"
                          type={showPassword ? "text" : "password"}
                          id="clave"
                          className={`form-control ${errors.clave ? "is-invalid" : ""
                            }`}
                          placeholder={`Ingrese una contraseña`}
                        />
                      </div>

                      {errors.clave && (
                        <div className="alert alert-danger mt-2">
                          {errors.clave.message}
                        </div>
                      )}
                    </div>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label">Confirmar Contraseña</label>
                      <input
                        {...register("confirmarClave")}
                        name="confirmarClave"
                        type={showPassword ? "text" : "password"}
                        id="confirmarClave"
                        className={`form-control ${errors.confirmarClave ? "is-invalid" : ""}`}
                        placeholder="Confirme la contraseña"
                      />

                      {errors.confirmarClave && (
                        <div className="alert alert-danger mt-2">
                          {errors.confirmarClave.message}
                        </div>
                      )}

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
                          Mostrar contraseñas
                        </label>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-dark btn-lg px-5"
                      type="submit"
                    >
                      Registrarme
                    </button>

                    <p className="mt-3">
                      Ya tienes una cuenta?{" "}
                      <span
                        className="text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={handleInicioSesionClick}
                      >
                        Inicia Sesión
                      </span>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
