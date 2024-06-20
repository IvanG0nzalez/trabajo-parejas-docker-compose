import { FaUtensils, FaSpinner } from "react-icons/fa";
import * as Yup from "yup";
import mensajes from "./Mensajes";
import React, { useState } from "react";
import { api_cuenta_plato } from "@/hooks/Api";

const schema = Yup.object().shape({
  cantidad: Yup.string()
    .matches(/^[1-9]\d*$/, "Debe ingresar un número entero positivo")
    .required("Debe ingresar un número"),
});

const PlatoCard = ({ plato, external_usuario, token, updatePedidos }) => {
  const [cantidad, setCantidad] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChangeCantidad = async (e) => {
    const { value } = e.target;
    setCantidad(value);

    try {
      await schema.validate({ cantidad: value }, { abortEarly: false });
      setErrors({});
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await schema.validate({ cantidad }, { abortEarly: false });
      setErrors({});
      const data = {
        cantidad: cantidad,
      };

      api_cuenta_plato
        .guardar_cuenta_plato(external_usuario, plato.external_id, data, token)
        .then((response) => {
          if (response.code === 200) {
            mensajes("Sigue pidiendo!", `${response.tag}`, "success");
            updatePedidos();
            setCantidad("");
          } else {
            mensajes(
              "Prueba de nuevo más tarde",
              "Error guardando la selección",
              "error"
            );
          }
        });
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="plato-item">
        <div className="plato-header">
          <h3>{plato.nombre}</h3>
          <FaUtensils className="plato-icon" />
        </div>
        <div className="separador"></div>
        <h6>Precio unitario: ${plato.precio}</h6>
        <div className="separador"></div>
        <div className="input-container">
          <input
            type="text"
            value={cantidad}
            onChange={handleChangeCantidad}
            placeholder="Ingrese la cantidad"
            className={`form-control ${errors.cantidad ? "is-invalid" : ""}`}
          />
          <button
            className="btn btn-primary align-right"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinner" /> : "Guardar"}
          </button>
        </div>
        {errors.cantidad && (
          <div className="error-message">{errors.cantidad}</div>
        )}
      </div>

      <style jsx>{`
        .plato-item {
          display: flex;
          flex-direction: column;
          padding: 20px;
          margin: 10px;
          border: 1px solid #4caf50;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #e7f7e4;
          transition: transform 0.3s, box-shadow 0.3s;
          min-height: 220px;
          width: 310px;
          justify-content: space-between;
          align-items: left;
        }

        .plato-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-container {
          display: flex;
          align-items: center;
          margin-top: 5px;
        }

        .input-container input {
          flex: 1;
          margin-right: 10px;
        }

        h3 {
          margin-bottom: 10px;
          color: #333;
        }

        strong {
          color: #333;
        }

        .align-right {
          margin-left: auto;
        }

        input {
          margin: 5px 0;
        }

        .error-message {
          color: red;
          font-size: 14px;
          margin-top: 1px;
          margin-bottom: 5px;
        }

        .separador {
          border-bottom: 1px solid #ccc;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default PlatoCard;
