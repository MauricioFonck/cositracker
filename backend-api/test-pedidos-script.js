const assert = require('assert');
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';

const TEST_ADMIN = {
    email: 'testauth@example.com',
    password: 'SecurePassword123!'
};

const TEST_CLIENTE = {
    nombre: 'Cliente Pedido',
    documento: '9876543210',
    telefono: '3009876543',
    email: 'cliente.pedido@prueba.com'
};

const TEST_PEDIDO = {
    tipoTrabajo: 'Confección',
    descripcion: 'Vestido de gala rojo',
    precioTotal: 150000,
    fechaEntrega: '2026-03-01',
    notas: 'Urgente'
};

async function runTests() {
    console.log('--- EMPEZANDO TESTS DE PEDIDOS ---');
    try {
        // 0. Register Admin (if not exists) & Login
        console.log('0. Register/Login Admin...');
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...TEST_ADMIN, fullName: 'Test Admin' })
        }).catch(() => { }); // Ignore error if exists

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

        // 1. Crear Cliente para el Pedido
        console.log('1. Crear Cliente para el Pedido...');
        // Verificamos si existe primero para no fallar
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
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Fallo al crear pedido: ${res.status} ${err}`);
        }
        const pedido = await res.json();
        const pedidoId = pedido.id;
        const codigoPedido = pedido.codigo;
        console.log('   Pedido creado:', pedidoId);
        console.log('   Código generado:', codigoPedido);

        // Validaciones
        if (!codigoPedido) throw new Error('No se generó código único');
        if (Number(pedido.saldoPendiente) !== TEST_PEDIDO.precioTotal) throw new Error(`Saldo pendiente incorrecto: ${pedido.saldoPendiente} vs ${TEST_PEDIDO.precioTotal}`);
        if (pedido.estado !== 'PENDIENTE') throw new Error('Estado inicial incorrecto');

        // 3. Consultar por Código (Público)
        console.log('3. Consultar por Código (Público)...');
        res = await fetch(`${BASE_URL}/pedidos/consulta/${codigoPedido}`);
        if (!res.ok) throw new Error('Fallo consulta pública');
        const publicPedido = await res.json();
        if (publicPedido.id !== pedidoId) throw new Error('ID no coincide en consulta pública');
        console.log('   Consulta pública exitosa.');

        // 4. Cambiar Estado
        console.log('4. Cambiar Estado...');
        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}/estado/EN_PROCESO`, {
            method: 'PATCH',
            headers
        });
        if (!res.ok) throw new Error('Fallo al cambiar estado');
        const estadoCambiado = await res.json();
        if (estadoCambiado.estado !== 'EN_PROCESO') throw new Error('Estado no actualizado');
        console.log('   Estado actualizado a EN_PROCESO.');

        // 5. Filtros
        console.log('5. Filtrar Pedidos...');
        // Por estado
        res = await fetch(`${BASE_URL}/pedidos?estado=EN_PROCESO`, { headers });
        const porEstado = await res.json();
        // Con paginacion, la respuesta es { data: [...], total: N }
        const listaEstado = porEstado.data || porEstado;
        const encontradoEnEstado = listaEstado.find(p => p.id === pedidoId);
        if (!encontradoEnEstado) throw new Error('No encontrado al filtrar por estado');
        console.log('   Filtro por estado OK.');

        // Por cliente
        res = await fetch(`${BASE_URL}/pedidos?clienteId=${clienteId}`, { headers });
        const porCliente = await res.json();
        const listaCliente = porCliente.data || porCliente;
        const encontradoEnCliente = listaCliente.find(p => p.id === pedidoId);
        if (!encontradoEnCliente) throw new Error('No encontrado al filtrar por cliente');
        console.log('   Filtro por cliente OK.');

        // 6. Eliminar Pedido
        console.log('6. Eliminar Pedido...');
        res = await fetch(`${BASE_URL}/pedidos/${pedidoId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Fallo al eliminar pedido');
        console.log('   Pedido eliminado.');

        // 7. Prueba de CASCADE (Eliminar cliente borra pedidos)
        console.log('7. Prueba de CASCADE...');
        // Creamos otro pedido
        res = await fetch(`${BASE_URL}/pedidos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(pedidoPayload)
        });
        const cascadePedido = await res.json();
        console.log('   Pedido temporal creado:', cascadePedido.id);

        // Eliminamos cliente
        res = await fetch(`${BASE_URL}/clientes/${clienteId}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Fallo al eliminar cliente');
        console.log('   Cliente eliminado.');

        // Verificar si existe el pedido
        res = await fetch(`${BASE_URL}/pedidos/${cascadePedido.id}`, { headers });
        if (res.status !== 404) throw new Error('El pedido debió eliminarse con el cliente (CASCADE)');
        console.log('   Pedido eliminado en cascada correctamente (404).');

        console.log('--- TODOS LOS TESTS DE PEDIDOS PASARON ---');

    } catch (err) {
        console.error('TEST FALLÓ:', err);
        process.exit(1);
    }
}

runTests();
