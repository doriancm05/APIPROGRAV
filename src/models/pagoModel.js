const { sql, poolPromise } = require("../config/db");

class PagoModel {
    static async crearPago(numFactura, cedula, periodo) {
        const pool = await poolPromise;

        // Verificar si la factura existe y pertenece al estudiante
        const factura = await pool
            .request()
            .input("numFactura", sql.Int, numFactura)
            .input("cedula", sql.VarChar, cedula)
            .query("SELECT * FROM Facturas WHERE numFactura = @numFactura AND cedulaEstudiante = @cedula");

        if (factura.recordset.length === 0) {
            throw new Error("La factura no existe o no pertenece al estudiante.");
        }

        // Verificar si la factura ya tiene un pago registrado
        const pagoExistente = await pool
            .request()
            .input("numFactura", sql.Int, numFactura)
            .query("SELECT * FROM Pagos WHERE numFactura = @numFactura AND estado = 'pagado'");

        if (pagoExistente.recordset.length > 0) {
            throw new Error("Esta factura ya ha sido pagada.");
        }

        // Insertar el pago si pasa ambas validaciones
        const result = await pool
            .request()
            .input("numFactura", sql.Int, numFactura)
            .input("cedula", sql.VarChar, cedula)
            .input("estado", sql.VarChar, "pagado")
            .input("periodo", sql.VarChar, periodo)
            .query(`
                INSERT INTO Pagos (numFactura, cedula, estado, periodo) 
                OUTPUT INSERTED.id 
                VALUES (@numFactura, @cedula, @estado, @periodo)
            `);

        return result.recordset[0];
    }

    static async reversarPago(id) {
        const pool = await poolPromise;
        await pool
            .request()
            .input("id", sql.Int, id)
            .query("UPDATE Pagos SET estado = 'anulado' WHERE id = @id");
    }

    static async obtenerPago(id) {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM Pagos WHERE id = @id");
        return result.recordset[0];
    }

    static async obtenerPagosPorPeriodo(periodo) {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("periodo", sql.VarChar, periodo)
            .query("SELECT * FROM Pagos WHERE periodo = @periodo");
        return result.recordset;
    }
}

module.exports = PagoModel;
