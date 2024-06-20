"use client";

import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import mensajes from "@/componentes/Mensajes";
import { api_cuenta } from "@/hooks/Api";

export default function RecuperarClave() {
    const router = useRouter();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object().shape({
        clave: Yup.string()
            .required("Debe ingresar su nueva contraseña")
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
        confirmarClave: Yup.string().oneOf(
            [Yup.ref("clave"), null], "Las contraseñas deben coincidir")
            .required("Debe confirmar su nueva contraseña")
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;

    const sendData = async (data) => {
        const userData = {
            clave: data.clave,
            token: token,
        };

        api_cuenta.actualizar_clave_cuenta(userData).then((response) => {
            if (response.code === 200) {
                mensajes("OK!", `${response.tag}. Ya puede cerrar esta ventana.`, "success");
            } else {
                mensajes("Error!", response.tag, "error");
            }
        });
    };

    useEffect(() => {
        if (!token) {
            mensajes("Error", "Token no proporcionado", "error");
            router.push("/");
        }
    }, [token]);

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
                                            Restablecer Contraseña
                                        </h2>
                                        <p className="text-dark-50 mb-4">
                                            Ingrese su nueva contraseña
                                        </p>

                                        <div className="form-outline form-white mb-4">
                                            <label className="form-label">Nueva Contraseña</label>
                                            <input
                                                {...register("clave")}
                                                name="clave"
                                                type={showPassword ? "text" : "password"}
                                                id="clave"
                                                className={`form-control ${errors.clave ? "is-invalid" : ""}`}
                                                placeholder={`Ingrese su nueva contraseña`}
                                            />
                                            <div className="alert alert-danger invalid-feedback">
                                                {errors.clave?.message}
                                            </div>
                                        </div>

                                        <div className="form-outline form-white mb-4">
                                            <label className="form-label">Confirmar Contraseña</label>
                                            <input
                                                {...register("confirmarClave")}
                                                name="confirmarClave"
                                                type={showPassword ? "text" : "password"}
                                                id="confirmarClave"
                                                className={`form-control ${errors.confirmarClave ? "is-invalid" : ""}`}
                                                placeholder={`Confirme su nueva contraseña`}
                                            />
                                            <div className="alert alert-danger invalid-feedback">
                                                {errors.confirmarClave?.message}
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
                                                    Mostrar contraseñas
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-outline-dark btn-lg px-5"
                                            type="submit"
                                        >
                                            Restablecer
                                        </button>
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