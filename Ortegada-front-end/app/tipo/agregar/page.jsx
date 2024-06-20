"use client";

import * as Yup from "yup";
import { estaSesion, getToken } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Menu from "@/componentes/menu";
import mensajes from "@/componentes/Mensajes";
import { api_tipo } from "@/hooks/Api";

export default function AgregarTipo() {
    const router = useRouter();
    const token = getToken();

    const validationSchema = Yup.object().shape({
        nombre: Yup.string()
            .matches(/^[\w\sáéíóúÁÉÍÓÚüÜñÑ]+$/, "Debe ingresar un nombre válido")
            .required("Ingrese el nombre del tipo de plato"),
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;

    const enviarDatos = async (formData) => {
        const datos = {
            nombre: formData.nombre,
        };

        api_tipo.guardar_tipo_plato(datos, token).then(response => {
            if (response.code === 200) {
                mensajes("OK", response.tag, "success");
                router.back();
            } else {
                mensajes("Error", response.tag, "error");
            }
        });
    };

    useEffect(() => {
        if (!estaSesion()) {
            router.push('/');
        }
    }, [router]);

    if (!estaSesion()) {
        return null;
    }

    return (
        <div>
            <Menu></Menu>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card">
                            <div className="card-body p-5 text-center">
                                <h2 className="mb-4">Nuevo Tipo de Plato</h2>
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
                                        <button type="button" className="btn btn-danger" onClick={() => router.back()}>
                                            Volver
                                        </button>
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