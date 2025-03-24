const { sql, poolPromise } = require("../config/db");
const { registrarBitacora } = require("../services/bitacoraService");

class PagoService {
    static async crearPago(numFactura, cedula, periodo) {
        const pool = await poolPromise;

        try {
            // 🔹 Verificar si la factura existe y pertenece al estudiante
            const factura = await pool
                .request()
                .input("numFactura", sql.Int, numFactura)
                .input("cedula", sql.VarChar, cedula)
                .query("SELECT * FROM Facturas WHERE numFactura = @numFactura AND cedulaEstudiante = @cedula");

            if (factura.recordset.length === 0) {
                throw new Error("La factura no existe o no pertenece al estudiante.");
            }

            // 🔹 Verificar si la factura ya tiene un pago registrado
            const pagoExistente = await pool
                .request()
                .input("numFactura", sql.Int, numFactura)
                .query("SELECT * FROM Pagos WHERE numFactura = @numFactura AND estado = 'pagado'");

            if (pagoExistente.recordset.length > 0) {
                throw new Error("Esta factura ya ha sido pagada.");
            }

            // 🔹 Insertar el pago si pasa ambas validaciones
            const result = await pool
                .request()
                .input("numFactura", sql.Int, numFactura)
                .input("cedula", sql.VarChar, cedula)
                .input("estado", sql.VarChar, "pagado")
                .input("periodo", sql.VarChar, periodo)
                .query(`
                    INSERT INTO Pagos (numFactura, cedula, estado, periodo) 
                    OUTPUT INSERTED.*
                    VALUES (@numFactura, @cedula, @estado, @periodo)
                `);

            const pago = result.recordset[0];

            // 🔹 Registrar en la bitácora
            await registrarBitacora("CREAR_PAGO", pago);

            return pago;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async reversarPago(id) {
        const pool = await poolPromise;

        try {
            // 🔹 Verificar si el pago existe antes de anularlo
            const pago = await pool
                .request()
                .input("id", sql.Int, id)
                .query("SELECT * FROM Pagos WHERE id = @id");

            if (pago.recordset.length === 0) {
                throw new Error("Pago no encontrado.");
            }

            // 🔹 Actualizar el estado del pago a 'anulado'
            const result = await pool
                .request()
                .input("id", sql.Int, id)
                .query("UPDATE Pagos SET estado = 'anulado' OUTPUT INSERTED.* WHERE id = @id");

            const pagoAnulado = result.recordset[0];

            // 🔹 Registrar en la bitácora
            await registrarBitacora("REVERSAR_PAGO", pagoAnulado);

            return pagoAnulado;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async obtenerPago(id) {
        const pool = await poolPromise;

        try {
            const result = await pool
                .request()
                .input("id", sql.Int, id)
                .query("SELECT * FROM Pagos WHERE id = @id");

            if (result.recordset.length === 0) {
                throw new Error("Pago no encontrado.");
            }

            // 🔹 Registrar en la bitácora
            await registrarBitacora("OBTENER_PAGO", {
                pagoId: id,
                fecha: new Date().toISOString()
            });

            return result.recordset[0];
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async obtenerPagosPorPeriodo(periodo) {
        const pool = await poolPromise;

        try {
            const result = await pool
                .request()
                .input("periodo", sql.VarChar, periodo)
                .query("SELECT * FROM Pagos WHERE periodo = @periodo");

            // 🔹 Registrar en la bitácora
            await registrarBitacora("OBTENER_PAGOS_POR_PERIODO", {
                periodo,
                cantidad: result.recordset.length,
                fecha: new Date().toISOString()
            });

            return result.recordset;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = PagoService;
 