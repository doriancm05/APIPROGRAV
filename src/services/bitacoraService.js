const axios = require("axios");

// ID de usuario fijo (puedes cambiarlo si es dinámico)
const ID_USUARIO_FIJO = 1;

// Función para registrar eventos en la bitácora
const registrarBitacora = async (accion, detalle) => {
    try {
        const response = await axios.post("http://localhost:63839/api/bitacora", {
            idusuario: ID_USUARIO_FIJO, 
            descripcion: JSON.stringify({ accion, detalle })
        });

        return response.data;
    } catch (error) {
        console.error("Error al registrar en bitácora:", error.message);
        throw new Error("No se pudo registrar en bitácora.");
    }
};

module.exports = { registrarBitacora };