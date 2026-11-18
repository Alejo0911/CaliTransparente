import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let mensaje = "Error de conexión con el servidor de CaliTransparente";
    if (error.response) {
      mensaje = error.response.data?.detail || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      mensaje = "No se recibió respuesta del backend. Verifica que el servidor FastAPI esté encendido en http://localhost:8000.";
    } else if (error.message) {
      mensaje = error.message;
    }
    console.error("[API Error]", mensaje);
    return Promise.reject(new Error(mensaje));
  }
);

