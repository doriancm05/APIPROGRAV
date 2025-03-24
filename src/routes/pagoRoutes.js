const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pagoController");
const validateToken = require("../middlewares/validate"); // Middleware de autenticación

router.post("/", validateToken, pagoController.crearPago);
router.patch("/:id", validateToken, pagoController.reversarPago);
router.get("/:id", validateToken, pagoController.obtenerPago);
router.get("/periodo/:periodo", validateToken, pagoController.obtenerPagosPorPeriodo);

module.exports = router;
