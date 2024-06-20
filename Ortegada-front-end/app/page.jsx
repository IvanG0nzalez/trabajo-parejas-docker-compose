"use client";
import * as Yup from "yup";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { estaSesion } from "@/hooks/SessionUtil";
import mensajes from "@/componentes/Mensajes";
import { api_cuenta } from "@/hooks/Api";

export default function Home() {
  //router
  const router = useRouter();
  //validaciones
  const validationShema = Yup.object().shape({
    correo: Yup.string()
    .email("Ingrese un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
    clave: Yup.string().required("Ingrese su clave"),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  let { errors } = formState;

  const sendData = (data) => {
    var data = {
      correo: data.correo,
      clave: data.clave,
    };
    api_cuenta.inicio_sesion(data).then((datos) => {
      if (!estaSesion()) {
        mensajes(
          "Error al iniciar sesión",
          `${datos.tag}`,
          "error"
        );
      } else {
        mensajes("Has ingresado al sistema!", "Bienvenido", "success");
        router.push("/pedido");
      }
    });
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleRegistroClick = () => {
    router.push("/registro");
  };

  const handleClaveOlvidadaClick = () => {
    router.push("/cuenta/recuperar");
  }

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
                      Inicio de Sesión
                    </h2>
                    <p className="text-dark-50 mb-5">
                      Ingrese su correo electrónico y contraseña
                    </p>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label">Correo</label>
                      <input
                        {...register("correo")}
                        name="correo"
                        id="correo"
                        className={`form-control ${errors.correo ? "is-invalid" : ""
                          }`}
                        placeholder={`Ingrese su dirección de correo electrónico`}
                      />

                      <div className="alert alert-danger invalid-feedback">
                        {errors.correo?.message}
                      </div>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <label className="form-label">Contraseña</label>
                      <div className="input-group">
                        <input
                          {...register("clave")}
                          name="clave"
                          type={showPassword ? "text" : "password"}
                          id="clave"
                          className={`form-control ${errors.clave ? "is-invalid" : ""
                            }`}
                          placeholder={`Ingrese su contraseña`}
                        />
                      </div>

                      {errors.clave && (
                        <div className="alert alert-danger mt-1">
                          {errors.clave.message}
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="form-check">
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
                        <span className="text-primary small" style={{ cursor: "pointer" }} onClick={handleClaveOlvidadaClick}>¿Has olvidado tu contraseña?</span>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-dark btn-lg px-5"
                      type="submit"
                    >
                      Acceder
                    </button>

                    <p className="mt-3">Si no tienes una cuenta <span className="text-primary" style={{ cursor: "pointer" }} onClick={handleRegistroClick}>Regístrate</span></p>

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
