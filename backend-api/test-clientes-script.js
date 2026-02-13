const assert = require('assert');
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';

const TEST_ADMIN = {
    email: 'testauth@example.com',
    password: 'SecurePassword123!'
};

const TEST_CLIENTE = {
    nombre: 'Cliente Prueba',
    documento: '1234567890',
    telefono: '3001234567',
    email: 'cliente@prueba.com'
};

async function runTests() {
    console.log('--- EMPEZANDO TESTS DE CLIENTES ---');
    try {
        // 0. Login Admin
        console.log('0. Login Admin...');
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
        res = await fetch(`${BASE_URL}/clientes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(TEST_CLIENTE)
        });

        let clienteId;
        if (res.ok) {
            const data = await res.json();
            clienteId = data.id;
            console.log('   Cliente creado:', clienteId);
        } else {
            // Si ya existe (conflicto), intentamos buscarlo o borrarlo primero?
            const err = await res.json();
            if (res.status === 409) {
                console.log('   Cliente ya existía (Conflicto esperado si se corre 2 veces). Buscando...');
                // Buscarlo para continuar
                const searchRes = await fetch(`${BASE_URL}/clientes/documento/${TEST_CLIENTE.documento}`, { headers });
                const searchData = await searchRes.json();
                clienteId = searchData.id;
                console.log('   Cliente encontrado:', clienteId);

                // Limpiar para test limpio? No, usaremos este.
            } else {
                throw new Error(`Fallo al crear cliente: ${res.status} ${JSON.stringify(err)}`);
            }
        }

        // 2. Crear Cliente Duplicado (Debe fallar)
        console.log('2. Crear Cliente Duplicado...');
        res = await fetch(`${BASE_URL}/clientes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(TEST_CLIENTE)
        });
        if (res.status !== 409) throw new Error(`Debería haber fallado con 409, pero devolvió ${res.status}`);
        console.log('   Correctamente rechazado (409).');

        // 3. Obtener Todos
        console.log('3. Obtener todos los clientes...');
        res = await fetch(`${BASE_URL}/clientes`, { headers });
        const jsonResponse = await res.json();
        // Con paginacion, la respuesta es { data: [...], total: N }
        const list = jsonResponse.data || jsonResponse;

        if (!Array.isArray(list)) throw new Error('No devolvió un array');
        if (list.length === 0) throw new Error('Array vacío');
        console.log('   Listado obtenido. Cantidad:', list.length);

        // 4. Buscar por ID
        console.log('4. Buscar por ID...');
        res = await fetch(`${BASE_URL}/clientes/${clienteId}`, { headers });
        if (!res.ok) throw new Error('No encontrado por ID');
        const foundById = await res.json();
        if (foundById.documento !== TEST_CLIENTE.documento) throw new Error('Datos incorrectos por ID');
        console.log('   Encontrado por ID.');

        // 5. Buscar por Documento
        console.log('5. Buscar por Documento...');
        res = await fetch(`${BASE_URL}/clientes/documento/${TEST_CLIENTE.documento}`, { headers });
        if (!res.ok) throw new Error('No encontrado por Documento');
        const foundByDoc = await res.json();
        if (foundByDoc.id !== clienteId) throw new Error('ID incorrecto por Documento');
        console.log('   Encontrado por Documento.');

        // 6. Actualizar Cliente
        console.log('6. Actualizar Cliente...');
        const nuevoNombre = 'Cliente Actualizado';
        res = await fetch(`${BASE_URL}/clientes/${clienteId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        if (!res.ok) throw new Error('Fallo al actualizar');
        const updated = await res.json();
        if (updated.nombre !== nuevoNombre) throw new Error('Nombre no actualizado');
        console.log('   Actualizado correctamente.');

        // 7. Eliminar Cliente
        console.log('7. Eliminar Cliente...');
        res = await fetch(`${BASE_URL}/clientes/${clienteId}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Fallo al eliminar');
        console.log('   Eliminado correctamente.');

        // Verificar eliminación
        res = await fetch(`${BASE_URL}/clientes/${clienteId}`, { headers });
        if (res.status !== 404) throw new Error('Debería retornar 404 después de eliminar');
        console.log('   Verificación de eliminación exitosa (404).');

        console.log('--- TODOS LOS TESTS DE CLIENTES PASARON ---');

    } catch (err) {
        console.error('TEST FALLÓ:', err);
        process.exit(1);
    }
}

runTests();
