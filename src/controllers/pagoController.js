const PagoService = require("../services/pagoService");

exports.crearPago = async (req, res) => {
    try {
        const { numFactura, cedula, periodo } = req.body;
        if (!numFactura || !cedula || !periodo) {
            return res.status(400).json({ error: "numFactura, cedula y periodo son obligatorios" });
        }

        const pago = await PagoService.crearPago(numFactura, cedula, periodo);
        res.status(201).json(pago); // Devuelve el pago creado
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.reversarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const pagoAnulado = await PagoService.reversarPago(id);
        res.status(200).json(pagoAnulado); // Devuelve el pago anulado
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerPago = async (req, res) => {
    try {
        const { id } = req.params;
        const pago = await PagoService.obtenerPago(id);
        res.json(pago);
    } catch (error) {
        res.status(404).json({ error: "Pago no encontrado" });
    }
};

exports.obtenerPagosPorPeriodo = async (req, res) => {
    try {
        const { periodo } = req.params;
        const pagos = await PagoService.obtenerPagosPorPeriodo(periodo);
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
