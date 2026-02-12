import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './admins/admins.module';
import { ClientesModule } from './clientes/clientes.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AbonosModule } from './abonos/abonos.module';
import { Admin } from './admins/entities/admin.entity';
import { Cliente } from './clientes/entities/cliente.entity';
import { Pedido } from './pedidos/entities/pedido.entity';
import { Abono } from './abonos/entities/abono.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        // In production, you should run migrations instead of synchronize
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        // When using 'autoLoadEntities: true', you don't need to specify entities manually if modules are imported
        // However, explicitly listing them is safer for clarity or if modules are not standard
        entities: [Admin, Cliente, Pedido, Abono],
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AdminsModule,
    ClientesModule,
    PedidosModule,
    AbonosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
