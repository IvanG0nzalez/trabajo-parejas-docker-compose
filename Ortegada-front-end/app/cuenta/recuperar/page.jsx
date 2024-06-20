"use client";

import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import mensajes from "@/componentes/Mensajes";
import { api_cuenta } from "@/hooks/Api";

export default function Registro() {
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    correo: Yup.string()
	    .email("Ingrese un correo electrónico válido")
        .required("El correo electrónico es obligatorio"),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  const sendData = async (data) => {
    const userData = {
      correo: data.correo,
    };

    api_cuenta.recuperar_clave_cuenta(userData).then((response) => {
      if (response.code === 200) {
        mensajes(
          "OK!",
          response.tag,
          "success");
      } else {
        mensajes(
          "Error",
          response.tag,
          "error"
        );
      }
    });
  };


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
                      Recuperar mi Contraseña
                    </h2>
                    <p className="text-dark-50 mb-4">
                      Ingrese su dirección de correo electrónico
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

                    <button
                      className="btn btn-outline-dark btn-lg px-5"
                      type="submit"
                    >
                      Enviar
                    </button>

                    <p className="mt-3">
                      Volver a {" "}
                      <span
                        className="text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={handleInicioSesionClick}
                      >
                        Iniciar Sesión
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
