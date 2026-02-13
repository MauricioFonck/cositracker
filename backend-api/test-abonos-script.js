const assert = require('assert');
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';

const TEST_ADMIN = {
    email: 'testabono@example.com',
    password: 'SecurePassword123!'
};

const TEST_CLIENTE = {
    nombre: 'Cliente Abono',
    documento: '1122334455',
    telefono: '3001122334',
    email: 'cliente.abono@prueba.com'
};

const TEST_PEDIDO = {
    tipoTrabajo: 'Traje de Novio',
    descripcion: 'Traje completo azul marino',
    precioTotal: 100000,
    fechaEntrega: '2026-04-01',
    notas: 'Prioridad alta'
};

async function runTests() {
    console.log('--- EMPEZANDO TESTS DE ABONOS ---');
    try {
        // 0. Register Admin (if not exists) & Login
        console.log('0. Register/Login Admin...');
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...TEST_ADMIN, fullName: 'Test Admin Abonos' })
        }).catch(() => { });

        let res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_ADMIN)
        });

        if (!res.ok) throw new Error('Login falló');

        const loginData = await res.json();
        const token = loginData.access_token;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('   Login exitoso.');

        // 1. Crear Cliente
        console.log('1. Crear Cliente...');
        // Verificar si existe primero
        res = await fetch(`${BASE_URL}/clientes/documento/${TEST_CLIENTE.documento}`, { headers });
        let clienteId;
        if (res.ok) {
            const data = await res.json();
            clienteId = data.id;
        } else {
            res = await fetch(`${BASE_URL}/clientes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(TEST_CLIENTE)
            });
            const data = await res.json();
            clienteId = data.id;
        }
        console.log('   Cliente ID:', clienteId);

        // 2. Crear Pedido
        console.log('2. Crear Pedido...');
        const pedidoPayload = { ...TEST_PEDIDO, clienteId };
        res = await fetch(`${BASE_URL}/pedidos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(pedidoPayload)
        });
        if (!res.ok) throw new Error('Fallo al crear pedido');
        const pedido = await res.json();
        const pedidoId = pedido.id;
        console.log('   Pedido creado:', pedidoId);
        console.log('   Precio Total:', pedido.precioTotal);
        console.log('   Saldo Inicial:', pedido.saldoPendiente);

        if (Number(pedido.saldoPendiente) !== pedido.precioTotal) throw new Error('Saldo inicial incorrecto');

        // 3. Crear Primer Abono (30000)
        console.log('3. Crear Primer Abono (30000)...');
        const abono1Payload = {
            pedidoId,
            monto: 30000,
            metodoPago: 'EFECTIVO',
            nota: 'Primer pago'
        };
        res = await fetch(`${BASE_URL}/abonos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(abono1Payload)
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Fallo crear abono 1: ${err}`);
        }
        const abono1 = await res.json();
        console.log('   Abono 1 creado:', abono1.id);

        // Verificar Saldo
        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}`, { headers });
        const pedidoDespuesAbono1 = await res.json();
        console.log('   Saldo tras Abono 1:', pedidoDespuesAbono1.saldoPendiente);
        if (Number(pedidoDespuesAbono1.saldoPendiente) !== 70000) throw new Error(`Saldo incorrecto: ${pedidoDespuesAbono1.saldoPendiente} vs 70000`);

        // 4. Crear Segundo Abono (40000)
        console.log('4. Crear Segundo Abono (40000)...');
        const abono2Payload = {
            pedidoId,
            monto: 40000,
            metodoPago: 'TRANSFERENCIA',
            nota: 'Segundo pago'
        };
        res = await fetch(`${BASE_URL}/abonos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(abono2Payload)
        });
        if (!res.ok) throw new Error('Fallo crear abono 2');
        console.log('   Abono 2 creado.');

        // Verificar Saldo
        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}`, { headers });
        const pedidoDespuesAbono2 = await res.json();
        console.log('   Saldo tras Abono 2:', pedidoDespuesAbono2.saldoPendiente);
        if (Number(pedidoDespuesAbono2.saldoPendiente) !== 30000) throw new Error(`Saldo incorrecto: ${pedidoDespuesAbono2.saldoPendiente} vs 30000`);

        // 5. Validar Abono Excesivo (intentar pagar 50000, saldo es 30000)
        console.log('5. Validar Abono Excesivo...');
        const abonoExcesivo = {
            pedidoId,
            monto: 50000
        };
        res = await fetch(`${BASE_URL}/abonos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(abonoExcesivo)
        });
        if (res.status !== 400) throw new Error(`Debería fallar con 400, obtuvo: ${res.status}`);
        console.log('   Validación de exceso correcta (400).');

        // 6. Listar Abonos
        console.log('6. Listar Abonos...');
        res = await fetch(`${BASE_URL}/abonos/pedido/${pedidoId}`, { headers });
        if (!res.ok) throw new Error('Fallo listar abonos');
        const listaAbonos = await res.json();
        console.log('   Total abonos encontrados:', listaAbonos.length);
        if (listaAbonos.length !== 2) throw new Error('Debería haber 2 abonos');

        // 7. Eliminar Abono 1 (30000) y verificar recálculo
        console.log('7. Eliminar Abono 1...');
        res = await fetch(`${BASE_URL}/abonos/${abono1.id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Fallo eliminar abono');
        console.log('   Abono eliminado.');

        // Verificar Saldo (Debería subir de 30000 a 60000 porque quitamos el pago de 30000? No, quitamos UN pago.
        // Original: 100000. Pagamos 30000 -> 70000. Pagamos 40000 -> 30000.
        // Eliminamos pago de 30000. Queda solo pago de 40000. Saldo debe ser 60000.
        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}`, { headers });
        const pedidoDespuesBorrar = await res.json();
        console.log('   Saldo tras borrar abono:', pedidoDespuesBorrar.saldoPendiente);
        if (Number(pedidoDespuesBorrar.saldoPendiente) !== 60000) throw new Error(`Saldo incorrecto tras borrar: ${pedidoDespuesBorrar.saldoPendiente} vs 60000`);

        // 8. Borrar Pedido y verificar CASCADE
        console.log('8. Borrar Pedido (CASCADE check)...');
        // Crear un abono dummy para asegurar que hay algo que borrar
        // Ya tenemos el abono 2 (40000) ahí.

        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Fallo eliminar pedido');
        console.log('   Pedido eliminado.');

        // Verificar si existen abonos (no puedo consultar abono por ID facilmente sin saber ID del que quedó, pero puedo intentar listar por pedido)
        res = await fetch(`${BASE_URL}/abonos/pedido/${pedidoId}`, { headers });
        const abonosFantasma = await res.json();
        // Si el pedido no existe, el endpoint probablemente devuelva array vacio o error?
        // En typeorm find by relation ID usually works even if relation missing? No.
        // Si borramos pedido, abonos deben irse.
        if (abonosFantasma.length > 0) throw new Error('Los abonos no se eliminaron en cascada');
        console.log('   CASCADE verificado (0 abonos encontrados).');

        console.log('--- TODOS LOS TESTS DE ABONOS PASARON ---');

    } catch (err) {
        console.error('TEST FALLÓ:', err);
        process.exit(1);
    }
}

runTests();
