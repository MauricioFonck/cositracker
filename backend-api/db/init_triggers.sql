-- Function to update the pending balance of a order
CREATE OR REPLACE FUNCTION update_saldo_pendiente()
RETURNS TRIGGER AS $$
DECLARE
    total_abonado DECIMAL(10,2);
    precio_total_pedido DECIMAL(10,2);
BEGIN
    -- Calculate total paid for the order
    SELECT COALESCE(SUM(monto), 0) INTO total_abonado
    FROM abonos
    WHERE "pedidoId" = NEW."pedidoId";

    -- Get total price of the order
    SELECT "precioTotal" INTO precio_total_pedido
    FROM pedidos
    WHERE id = NEW."pedidoId";

    -- Update the order balance
    UPDATE pedidos
    SET "saldoPendiente" = precio_total_pedido - total_abonado
    WHERE id = NEW."pedidoId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT on abonos
DROP TRIGGER IF EXISTS trigger_update_saldo_insert ON abonos;
CREATE TRIGGER trigger_update_saldo_insert
AFTER INSERT ON abonos
FOR EACH ROW
EXECUTE FUNCTION update_saldo_pendiente();

-- Trigger for UPDATE on abonos
DROP TRIGGER IF EXISTS trigger_update_saldo_update ON abonos;
CREATE TRIGGER trigger_update_saldo_update
AFTER UPDATE ON abonos
FOR EACH ROW
EXECUTE FUNCTION update_saldo_pendiente();

-- Trigger for DELETE on abonos (needs special handling for OLD.pedidoId)
CREATE OR REPLACE FUNCTION update_saldo_pendiente_delete()
RETURNS TRIGGER AS $$
DECLARE
    total_abonado DECIMAL(10,2);
    precio_total_pedido DECIMAL(10,2);
BEGIN
    -- Calculate total paid (excluding the deleted one effectively)
    SELECT COALESCE(SUM(monto), 0) INTO total_abonado
    FROM abonos
    WHERE "pedidoId" = OLD."pedidoId";

    SELECT "precioTotal" INTO precio_total_pedido
    FROM pedidos
    WHERE id = OLD."pedidoId";

    UPDATE pedidos
    SET "saldoPendiente" = precio_total_pedido - total_abonado
    WHERE id = OLD."pedidoId";

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saldo_delete ON abonos;
CREATE TRIGGER trigger_update_saldo_delete
AFTER DELETE ON abonos
FOR EACH ROW
EXECUTE FUNCTION update_saldo_pendiente_delete();
