require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

const pagoRoutes = require("./src/routes/pagoRoutes");
app.use("/pago", pagoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
