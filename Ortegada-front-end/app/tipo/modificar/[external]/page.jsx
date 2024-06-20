"use client";

import * as Yup from "yup";
import { estaSesion, getToken } from "@/hooks/SessionUtil";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import mensajes from "@/componentes/Mensajes";
import Link from "next/link";
import Menu from "@/componentes/menu";
import { api_tipo } from "@/hooks/Api";

export default function ModificarTipo() {
    const router = useRouter();
    const token = getToken();
    const { external } = useParams();

    const validationSchema = Yup.object().shape({
        nombre: Yup.string()
            .matches(/^[\w\sáéíóúÁÉÍÓÚüÜñÑ]+$/, "Ingrese solo letras")
            .required("Ingrese el nombre del tipo del plato")
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState, reset } = useForm(formOptions);
    const { errors } = formState;

    useEffect(() => {

        api_tipo.obtener_tipo_plato(external, token).then(response => {
            if (response.code === 200) {
                const tipoData = response.datos;
                reset({
                    nombre: tipoData.nombre,
                });
            } else {
                mensajes("Error", "Error al cargar los datos", "error");
            }
        });
    }, [external, reset, token]);

    if (!estaSesion()) {
        router.push("/");
        return null;
    }

    const enviarDatos = async (formData) => {
        const datos = {
            nombre: formData.nombre,
        };

        api_tipo.modificar_tipo_plato(external, datos, token).then(response => {
            if (response.code === 200) {
                mensajes("OK", response.tag, "success");
                router.push("/tipo");
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
                                <h2 className="mb-4">Modificar Tipo de Plato</h2>
                                <form onSubmit={handleSubmit(enviarDatos)}>
                                    <div className="mb-4">
                                        <label htmlFor="nombre" className="form-label">Nombre</label>
                                        <input
                                            {...register("nombre")}
                                            name="nombre"
                                            id="nombre"
                                            className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                                            placeholder={`Ingrese el nombre del tipo de plato`}
                                        />
                                        <div className="invalid-feedback">
                                            {errors.nombre?.message}
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-success">
                                            Guardar cambios
                                        </button>
                                        <Link href="/tipo" className="btn btn-danger">
                                            Volver
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