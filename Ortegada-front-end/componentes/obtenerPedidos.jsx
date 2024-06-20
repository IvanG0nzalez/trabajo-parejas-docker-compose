"use client";

import { getToken } from "@/hooks/SessionUtil";
import { useEffect, useState } from "react";
import LoadingScreen from "./loadingScreen";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import { api_cuenta_plato, api_tipo } from "@/hooks/Api";

const ObtenerPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [tiposPlatos, setTiposPlatos] = useState([]);
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [response_pedidos, response_tipos] = await Promise.all([
        api_cuenta_plato.listar_cuentas_platos(token),
        api_tipo.listar_tipos_platos_disponibles(token),
      ]);
      setPedidos(response_pedidos.datos);
      setTiposPlatos(response_tipos.datos);
      setUsuarios([...new Set(response_pedidos.datos.map((pedido) => pedido.usuario))]);
      setLoading(false);
    };

    if (typeof window !== "undefined") {
      fetchData();
    }
  }, [token]);

  const handleFiltroChange = (event) => {
    setFiltro(event.target.value);
    setFiltroTipo("");
  };

  const handleFiltroTipoChange = (selectedOption) => {
    setFiltroTipo(selectedOption ? selectedOption.value : "");
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === "Usuario") {
      return filtroTipo ? pedido.usuario === filtroTipo : true;
    } else if (filtro === "Tipo de plato") {
      return filtroTipo ? pedido.tipo_plato === filtroTipo : true;
    } else {
      return true;
    }
  });

  /*const exportToPdf = () => {
    const input = document.getElementById("pedidos-table");

    html2canvas(input, {
      windowWidth: document.getElementById("pedidos-table").scrollWidth,
      windowHeight: document.getElementById("pedidos-table").scrollHeight,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "px",
        format: [
          document.getElementById("pedidos-table").scrollWidth,
          document.getElementById("pedidos-table").scrollHeight,
        ],
      });
      pdf.addImage(imgData, "PNG", 0, 0);
      pdf.save("pedidos.pdf");
    });
  };*/

  const exportToPdf = () => {
    const pdf = new jsPDF();
    const headers = ["Número", "Usuario", "Nombre del plato", "Tipo del plato", "Precio", "Cantidad", "Total"];
    const data = pedidos.map((pedido, index) => [index + 1, pedido.usuario, pedido.nombre_plato, pedido.tipo_plato, `$${pedido.precio}`, pedido.cantidad, `$${pedido.total}`]);

    pdf.autoTable({ startY: 5, head: [headers], body: data });

    pdf.save("pedidos.pdf");
  };

  if (loading) {
    return LoadingScreen();
  }

  const filtroOptions = filtro === "Usuario"
    ? usuarios.map(usuario => ({ value: usuario, label: usuario }))
    : tiposPlatos.map(tipo => ({ value: tipo, label: tipo }));

  const customStyles = {
    container: (provided) => ({
      ...provided,
      maxWidth: '35%',
      width: '35%',
    }),
    control: (provided) => ({
      ...provided,
      maxWidth: '100%',
      width: '100%',
    }),
    menu: (provided) => ({
      ...provided,
      maxWidth: '100%',
      width: '100%',
    }),
    menuList: (provided) => ({
      ...provided,
      maxWidth: '100%',
      width: '100%',
    }),
  }

  return (
    <div>
      <div className="table-container">
        <div className="center-h1">
          <h1>Todos los pedidos</h1>
        </div>

        <div className="filtro-tipo">
          <label htmlFor="tipo">Filtrar por: </label>
          <select id="tipo" value={filtro} onChange={handleFiltroChange} className="form-select">
            <option value="">Todos</option>
            <option value="Usuario">Usuario</option>
            <option value="Tipo de plato">Tipo de plato</option>
          </select>
          {filtro && (
            <Select
              id="filtroTipo"
              value={filtroOptions.find(option => option.value === filtroTipo)}
              onChange={handleFiltroTipoChange}
              options={filtroOptions}
              isClearable
              placeholder="Seleccione o escriba para buscar"
              styles={customStyles}
              noOptionsMessage={() => "Sin coincidencias"}
            />
          )}
          <button className="btn btn-success" onClick={exportToPdf}>Exportar todo a PDF</button>
        </div>

        <table className="table" id="pedidos-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Correo Electrónico</th>
              <th>Usuario</th>
              <th>Nombre del plato</th>
              <th>Tipo del plato</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-pedidos-row">Aún no se ha hecho ningún pedido</td>
              </tr>
            ) : (
              pedidosFiltrados.map((pedido, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{pedido.correo}</td>
                  <td>{pedido.usuario}</td>
                  <td>{pedido.nombre_plato}</td>
                  <td>{pedido.tipo_plato}</td>
                  <td>${pedido.precio}</td>
                  <td>{pedido.cantidad}</td>
                  <td>${pedido.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
      <style jsx>{`
        .table-container {
          overflow-x: auto;
          width: 70%;
          margin: 20px auto;
          padding: 20px;
        }

        table {
          max-width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
          background-color: #fff;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          vertical-align: middle;
        }

        th {
          background-color: #f2f2f2;
        }

        .center-h1 {
          text-align: center;
          margin-bottom: 20px;
        }

        .filtro-tipo {
					display: flex;
					justify-content: left;
					gap: 15px;
        }

        .filtro-tipo label {
					margin-top: 7px;
        }

        .filtro-tipo select {
          padding: 5px;
          border-radius: 4px;
					max-width: 25%;
					max-height: 40px;
        }

				.filtro-tipo button {
					max-height: 40px;
				}

        @media (max-width: 768px) {
					.table-container {
						width: 100%;
						padding: 10px;
					}

				}

				@media (max-width: 1024px) {
				  .table-container {
						width: 100%;
						padding: 10px;
				  }

          .filtro-tipo button {
            max-height: 55px;
          }
				}
      `}</style>
    </div>
  );
}

export default ObtenerPedidos;