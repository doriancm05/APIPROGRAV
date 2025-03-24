const axios = require("axios");
require("dotenv").config();

const SERVER = process.env.AUTH_SERVER; // URL del servidor de autenticación

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const refreshToken = req.header("x-refresh-token");

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    // 🔹 Validar el token con el servicio externo
    const validateResponse = await axios.get(`${SERVER}/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (validateResponse.data === true) {
      console.log("✔ Token válido, permitiendo acceso.");
      return next(); // Token válido, continuar
    }

    // 🔹 Si el token es inválido, intentar refrescarlo
    if (!refreshToken) {
      return res.status(401).json({ message: "Token expirado y no hay refresh token." });
    }

    console.log("🔄 Intentando refrescar el token...");
    const refreshResponse = await axios.post(`${SERVER}/refresh`, { refresh_token: refreshToken });

    if (refreshResponse.data?.access_token) {
      req.headers.authorization = `Bearer ${refreshResponse.data.access_token}`; // Actualizar token
      console.log("✔ Token refrescado, permitiendo acceso.");
      return next();
    }

    return res.status(401).json({ message: "No se pudo refrescar el token." });

  } catch (error) {
    console.error("❌ Error en validación de token:", error.message);
    return res.status(401).json({ message: "No autorizado.", error: error.message });
  }
};
