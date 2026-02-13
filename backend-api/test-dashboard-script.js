const assert = require('assert');
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';

const TEST_ADMIN = {
    email: 'testdashboard@example.com',
    password: 'SecurePassword123!'
};

const TEST_CLIENTE = {
    nombre: 'Cliente Dashboard',
    documento: '5555555555',
    telefono: '3005555555',
    email: 'dashboard@prueba.com'
};

async function runTests() {
    console.log('--- EMPEZANDO TESTS DE DASHBOARD Y EXTENDIDOS ---');
    try {
        // 0. Register/Login Admin
        console.log('0. Login Admin...');
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...TEST_ADMIN, fullName: 'Test Dashboard' })
        }).catch(() => { });

        let res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_ADMIN)
        });
        if (!res.ok) throw new Error('Login falló');
        const { access_token: token } = await res.json();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('   Login exitoso.');

        // 1. Setup Datos
        // Cliente
        console.log('1. Creando datos de prueba...');
        // Buscar cliente si existe
        res = await fetch(`${BASE_URL}/clientes/documento/${TEST_CLIENTE.documento}`, { headers });
        let clienteId;
        if (res.ok) {
            clienteId = (await res.json()).id;
        } else {
            res = await fetch(`${BASE_URL}/clientes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(TEST_CLIENTE)
            });
            clienteId = (await res.json()).id;
        }

        // Crear 3 Pedidos
        const pedidosIds = [];
        for (let i = 1; i <= 3; i++) {
            const payload = {
                clienteId,
                tipoTrabajo: `Trabajo Dash ${i}`,
                descripcion: `Descripción única ${i} para búsqueda`,
                precioTotal: 100000 * i,
                fechaEntrega: '2026-05-01'
            };
            res = await fetch(`${BASE_URL}/pedidos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            const p = await res.json();
            pedidosIds.push(p.id);
        }
        console.log('   3 Pedidos creados.');

        // Cambiar estado a LISTO del segundo pedido
        await fetch(`${BASE_URL}/pedidos/${pedidosIds[1]}/estado/LISTO`, { method: 'PATCH', headers });

        // Crear Abono para el primer pedido (50000)
        await fetch(`${BASE_URL}/abonos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                pedidoId: pedidosIds[0],
                monto: 50000,
                metodoPago: 'EFECTIVO'
            })
        });
        console.log('   Estado cambiado y abono registrado.');

        // 2. Probar Dashboard Stats
        console.log('2. Probando Dashboard Stats...');
        res = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
        if (!res.ok) throw new Error('Fallo stats');
        const stats = await res.json();
        console.log('   Stats:', JSON.stringify(stats, null, 2));

        // Validaciones aproximadas (puede haber datos previos en DB)
        if (typeof stats.pedidosActivos !== 'number') throw new Error('pedidosActivos debe ser numero');
        // Debe ser al menos 3
        if (stats.pedidosActivos < 3) throw new Error('Debería haber al menos 3 pedidos activos');

        if (typeof stats.ingresosMes !== 'number') throw new Error('ingresosMes debe ser numero');
        if (stats.ingresosMes < 50000) throw new Error('Ingresos mes debe ser al menos 50000');

        console.log('   Stats OK.');

        // 3. Probar Paginación Pedidos
        console.log('3. Probando Paginación...');
        res = await fetch(`${BASE_URL}/pedidos?page=1&limit=1`, { headers });
        const pag1 = await res.json();
        if (pag1.data.length !== 1) throw new Error('Paginación limit 1 falló');
        if (pag1.total < 3) throw new Error('Total incorrecto en paginación');

        res = await fetch(`${BASE_URL}/pedidos?page=2&limit=1`, { headers });
        const pag2 = await res.json();
        if (pag2.data.length !== 1) throw new Error('Paginación página 2 falló');
        if (pag1.data[0].id === pag2.data[0].id) throw new Error('Paginación devolvió mismo item en pag 2');
        console.log('   Paginación OK.');

        // 4. Probar Búsqueda
        console.log('4. Probando Búsqueda...');
        const term = 'Descripción única 3';
        res = await fetch(`${BASE_URL}/pedidos?termino=${encodeURIComponent(term)}`, { headers });
        const searchRes = await res.json();
        if (searchRes.data.length === 0) throw new Error('Búsqueda no encontró nada');
        if (!searchRes.data[0].descripcion.includes(term)) throw new Error(`Búsqueda encontró item incorrecto: ${searchRes.data[0].descripcion}`);
        console.log('   Búsqueda OK.');


        // Cleanup
        console.log('Limpiando...');
        // Borrar el cliente borra pedidos y abonos (CASCADE)
        await fetch(`${BASE_URL}/clientes/${clienteId}`, { method: 'DELETE', headers });
        console.log('--- TODOS LOS TESTS DE DASHBOARD Y EXTENDIDOS PASARON ---');

    } catch (err) {
        console.error('TEST FALLÓ:', err);
        process.exit(1);
    }
}

runTests();
