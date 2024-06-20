"use client";

import * as Yup from "yup";
import { estaSesion, getToken, save } from "@/hooks/SessionUtil";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Menu from "@/componentes/menu";
import Link from "next/link";
import mensajes from "@/componentes/Mensajes";
import { api_plato, api_tipo } from "@/hooks/Api";

export default function AgregarPlato() {
  const router = useRouter();
  const token = getToken();
  const [tiposPlatos, setTiposPlatos] = useState([]);
  const [tipoPlatoSeleccionado, setTipoPlatoSeleccionado] = useState("");
  
  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .matches(/^[\w\sáéíóúÁÉÍÓÚüÜñÑ]+$/, "Debe ingresar un nombre válido")
      .required("Ingrese el nombre del plato"),
    precio: Yup.number()
      .typeError("El precio debe ser un número")
      .positive("El precio debe ser positivo")
      .required("Ingrese el precio del plato"),
    tipo: Yup.string()
      .test("tipo", "Debe seleccionar un tipo de plato", value => value !== "Seleccione un tipo")
      .required("Seleccione un tipo de plato")
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState, setValue, trigger } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {

    api_tipo.listar_tipos_platos_disponibles(token).then(response => {
      if (response.code === 200) {
        const tiposPlatosConDefault = ["Seleccione un tipo", "Crear nuevo tipo", ...response.datos];
        setTiposPlatos(tiposPlatosConDefault);
        setTipoPlatoSeleccionado("Seleccione un tipo");
        setValue("tipo", "Seleccione un tipo");
      } else {
        mensajes("Prueba de nuevo más tarde", "Error al cargar los datos", "error");
      }
    });
  }, [token]);

  const enviarDatos = async (formData) => {
    const datos = {
      nombre: formData.nombre,
      precio: parseFloat(formData.precio),
      tipo: formData.tipo,
    };

    api_plato.guardar_plato(datos, token).then((response) => {
      if (response.code === 200) {
        mensajes("OK", response.tag, "success");
        router.push("/plato");
      } else {
        mensajes("Error", response.tag, "error");
      }
    });
  };

  const handleTipoChange = (e) => {
    const value = e.target.value;
    setTipoPlatoSeleccionado(value);
    setValue("tipo", value);
    trigger("tipo");

    if(value === "Crear nuevo tipo") {
      const formData = {
        nombre: document.getElementById("nombre").value,
        precio: document.getElementById("precio").value,
      };
      localStorage.setItem("formData", JSON.stringify(formData));
      router.push("/tipo/agregar");
    }
  };

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("formData"));
    if(savedFormData){
      setValue("nombre", savedFormData.nombre);
      setValue("precio", savedFormData.precio);
      localStorage.removeItem("formData");
    }
  }, [setValue]);

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
                <h2 className="mb-4">Nuevo Plato</h2>
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
                      className={`form-select ${errors.tipo ? "is-invalid" : ""}`}
                      {...register("tipo")}
                      value={tipoPlatoSeleccionado}
                      onChange={handleTipoChange}
                    >
                      {tiposPlatos.map((tipo, i) => (
                        <option key={i} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    <div className="invalid-feedback">
                      {errors.tipo?.message}
                    </div>
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