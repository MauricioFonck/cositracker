
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function probe() {
    console.log('🔍 Iniciando diagnóstico de conexión...\n');

    const basicConfig = {
        type: 'postgres' as const,
        database: 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        logging: false
    };

    // 1. Probar Configuración Actual (.env)
    console.log('🔹 Intento 1: Usando configuración de .env (Pooler)');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   User: ${process.env.DB_USERNAME}`);
    console.log(`   Port: ${process.env.DB_PORT}`);

    const dsEnv = new DataSource({
        ...basicConfig,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
    });

    try {
        await dsEnv.initialize();
        console.log('   ✅ Conexión EXITOSA con .env!\n');
        await dsEnv.destroy();
        return;
    } catch (e: any) {
        console.log(`   ❌ Falló: ${e.message}\n`);
    }

    // 2. Probar Conexión Directa (Direct Connection)
    // Extraer Project Ref del usuario del pooler si es posible
    // Usuario pooler formato: postgres.ref
    const userParts = (process.env.DB_USERNAME || '').split('.');
    let projectRef = '';
    if (userParts.length === 2 && userParts[0] === 'postgres') {
        projectRef = userParts[1];
    }

    if (!projectRef) {
        console.log('⚠️ No se pudo deducir el Project Ref del DB_USERNAME. Saltando prueba directa.');
        return;
    }

    const directHost = `db.${projectRef}.supabase.co`;
    console.log('🔹 Intento 2: Probando Conexión Directa (Standard)');
    console.log(`   Host: ${directHost}`);
    console.log(`   User: postgres`);
    console.log(`   Port: 5432`);

    const dsDirect = new DataSource({
        ...basicConfig,
        host: directHost,
        port: 5432,
        username: 'postgres',
    });

    try {
        await dsDirect.initialize();
        console.log('   ✅ Conexión Directa EXITOSA!');
        console.log('   💡 SUGERENCIA: Tu .env tiene mal la región del Pooler o el puerto.');
        console.log('   Puedes usar la conexión directa actualizando tu .env a:');
        console.log(`   DB_HOST=${directHost}`);
        console.log(`   DB_PORT=5432`);
        console.log(`   DB_USERNAME=postgres`);
        await dsDirect.destroy();
    } catch (e: any) {
        console.log(`   ❌ Falló Conexión Directa: ${e.message}`);
        console.log('\n⚠️ CONCLUSIÓN: Es probable que la contraseña sea incorrecta o el Project ID no exista.');
    }
}

probe();
