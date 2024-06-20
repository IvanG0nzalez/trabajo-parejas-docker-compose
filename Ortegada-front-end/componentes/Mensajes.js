import swal from "sweetalert";
const mensajes = (texto, titulo, tipo) =>
  swal(titulo, texto, tipo, {
    button: "ACEPTAR",
    timer: 4000,
    closeOnEsc: true,
  });

export default mensajes;
