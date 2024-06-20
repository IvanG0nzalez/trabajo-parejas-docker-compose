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
import { api_plato, api_tipo } from "@/hooks/Api";

export default function ModificarPlato() {
  const router = useRouter();
  const token = getToken();
  const { external } = useParams();
  const [plato, setPlato] = useState({});
  const [tiposPlatos, setTiposPlatos] = useState([]);
  const [tipoPlatoSeleccionado, setTipoPlatoSeleccionado] = useState("");

  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .matches(/^[\w\sáéíóúÁÉÍÓÚüÜñÑ]+$/, "Ingrese solo letras en el campo de nombres")
      .required("Ingrese el nombre del plato"),
    precio: Yup.number()
      .typeError("El precio debe ser un número")
      .positive("El precio debe ser positivo")
      .required("Ingrese el precio del plato")
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState, reset } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {
    const cargarDatos = async () => {

      const [response_platos, response_tipos] = await Promise.all([
        api_plato.obtener_plato(external, token),
        api_tipo.listar_tipos_platos_disponibles(token),
      ]);

      if (response_platos.code === 200 && response_tipos.code === 200) {
        const platoData = response_platos.datos;
        setPlato(platoData);
        setTiposPlatos(response_tipos.datos);
        setTipoPlatoSeleccionado(platoData.tipo);
        reset({ 
          nombre: platoData.nombre,
          precio: platoData.precio
        });
      } else {
        mensajes("Error", "Error al cargar los datos","error");
      }
    };

    cargarDatos();
  }, [external, reset, token]);

  if (!estaSesion()) {
    router.push("/");
    return null;
  }

  const enviarDatos = async (formData) => {
    const datos = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      precio: parseFloat(formData.precio)
    };

    api_plato.modificar_plato(external, datos, token).then((response) => {
      if (response.code === 200) {
        mensajes("OK", response.tag, "success");
        router.push("/plato");
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
                <h2 className="mb-4">Modificar Plato</h2>
                <form onSubmit={handleSubmit(enviarDatos)}>
                  <div className="mb-4">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input
                      {...register("nombre")}
                      name="nombre"
                      id="nombre"
                      className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                      placeholder={`Ingrese el nombre del plato`}
                    />
                    <div className="invalid-feedback">
                      {errors.nombre?.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="precio" className="form-label">Precio</label>
                    <input
                      {...register("precio")}
                      name="precio"
                      id="precio"
                      className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                      placeholder={`Ingrese el precio del plato`}
                    />
                    <div className="invalid-feedback">
                      {errors.precio?.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="tipo" className="form-label">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      className="form-select"
                      {...register("tipo")}
                      value={tipoPlatoSeleccionado}
                      onChange={(e) => setTipoPlatoSeleccionado(e.target.value)}
                    >
                      {tiposPlatos.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      Guardar cambios
                    </button>
                    <Link href="/plato" className="btn btn-danger">
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