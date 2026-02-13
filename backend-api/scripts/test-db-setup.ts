
import { DataSource } from 'typeorm';
import { Pedido, EstadoPedido } from '../src/pedidos/entities/pedido.entity';
import { Abono, MetodoPago } from '../src/abonos/entities/abono.entity';
import { Cliente } from '../src/clientes/entities/cliente.entity';
import { Admin } from '../src/admins/entities/admin.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function runTests() {
    console.log('\n🔵 INICIANDO TEST DE BASE DE DATOS Y TRIGGERS...\n');

    const appDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [Pedido, Abono, Cliente, Admin],
        synchronize: true, // Esto creará las tablas si no existen
        ssl: { rejectUnauthorized: false },
        logging: false
    });

    try {
        // 1. TEST CONEXIÓN
        console.log('1️⃣  Probando conexión a la base de datos...');
        await appDataSource.initialize();
        console.log('✅  Conexión exitosa a Supabase.\n');

        // 2. TEST TABLAS
        console.log('2️⃣  Verificando creación de tablas...');
        const queryRunner = appDataSource.createQueryRunner();
        const tables = await queryRunner.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('clientes', 'pedidos', 'abonos', 'admins');
        `);

        const tableNames = tables.map((t: any) => t.table_name);
        if (tableNames.includes('clientes') && tableNames.includes('pedidos') && tableNames.includes('abonos')) {
            console.log(`✅  Tablas encontradas: ${tableNames.join(', ')}\n`);
        } else {
            console.error(`❌  Faltan tablas. Encontradas: ${tableNames.join(', ')}`);
        }

        // 3. APLICAR TRIGGERS (Si es necesario)
        console.log('3️⃣  Verificando/Aplicando Triggers...');
        const sqlPath = path.join(__dirname, '../db/init_triggers.sql');
        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await queryRunner.query(sql);
            console.log('✅  Script de Triggers ejecutado correctamente.\n');
        } else {
            console.error('❌  No se encontró db/init_triggers.sql\n');
        }

        // 4. TEST TRIGGER SALDO PENDIENTE
        console.log('4️⃣  Probando Trigger de Saldo Pendiente...');

        const clientRepo = appDataSource.getRepository(Cliente);
        const pedidoRepo = appDataSource.getRepository(Pedido);
        const abonoRepo = appDataSource.getRepository(Abono);

        // Limpiar datos de prueba anteriores
        // Orden inverso para respetar FKs
        await abonoRepo.createQueryBuilder().delete().execute();
        await pedidoRepo.createQueryBuilder().delete().execute();
        await clientRepo.delete({ documento: 'TEST-DOC-123' });

        // Crear Cliente
        const cliente = clientRepo.create({
            nombre: 'Cliente Test Trigger',
            documento: 'TEST-DOC-123',
            telefono: '1234567890'
        });
        await clientRepo.save(cliente);

        // Crear Pedido
        const precioTotal = 1500.00;
        const pedido = pedidoRepo.create({
            codigo: 'PED-TEST-TRIGGER',
            descripcion: 'Pedido de prueba para trigger',
            precioTotal: precioTotal,
            saldoPendiente: precioTotal, // Inicialmente igual al total
            cliente: cliente,
            estado: EstadoPedido.PENDIENTE
        });
        await pedidoRepo.save(pedido);
        console.log(`   🔸 Pedido creado. Total: ${precioTotal}, Saldo: ${pedido.saldoPendiente}`);

        // Insertar Abono 1
        const montoAbono1 = 500.00;
        const abono1 = abonoRepo.create({
            monto: montoAbono1,
            pedido: pedido,
            metodoPago: MetodoPago.EFECTIVO,
            nota: 'Primer abono test'
        });
        await abonoRepo.save(abono1);
        console.log(`   🔸 Abono insertado: ${montoAbono1}`);

        // Verificar Saldo
        let pedidoActual = await pedidoRepo.findOneBy({ id: pedido.id });
        let esperado = precioTotal - montoAbono1;

        if (Number(pedidoActual?.saldoPendiente) === esperado) {
            console.log(`   ✅  Saldo actualizado correctamente a ${pedidoActual?.saldoPendiente} (Esperado: ${esperado})`);
        } else {
            console.error(`   ❌  ERROR: Saldo es ${pedidoActual?.saldoPendiente}, se esperaba ${esperado}`);
        }

        // Insertar Abono 2
        const montoAbono2 = 200.00;
        const abono2 = abonoRepo.create({
            monto: montoAbono2,
            pedido: pedido, // Referencia necesaria
            metodoPago: MetodoPago.TRANSFERENCIA
        });
        await abonoRepo.save(abono2);
        console.log(`   🔸 Segundo abono insertado: ${montoAbono2}`);

        // Verificar Saldo Final
        pedidoActual = await pedidoRepo.findOneBy({ id: pedido.id });
        esperado = precioTotal - montoAbono1 - montoAbono2;

        if (Number(pedidoActual?.saldoPendiente) === esperado) {
            console.log(`   ✅  Saldo final actualizado correctamente a ${pedidoActual?.saldoPendiente} (Esperado: ${esperado})`);
            console.log('\n🎉  TODOS LOS TESTS COMPLETADOS CON ÉXITO.');
        } else {
            console.error(`   ❌  ERROR FINAL: Saldo es ${pedidoActual?.saldoPendiente}, se esperaba ${esperado}`);
        }

        // Limpieza final (opcional)
        // await abonoRepo.remove([abono1, abono2]);
        // await pedidoRepo.remove(pedido);
        // await clientRepo.remove(cliente);

    } catch (error) {
        console.error('\n❌  Error durante los tests:', error);
    } finally {
        if (appDataSource.isInitialized) {
            await appDataSource.destroy();
        }
    }
}

runTests();
