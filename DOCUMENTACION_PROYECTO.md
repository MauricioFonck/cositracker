# 📋 Documentación del Proyecto: Sistema de Gestión de Pedidos para Modistería

## 📑 Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Especificaciones Técnicas](#3-especificaciones-técnicas)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Funcionalidades Detalladas](#6-funcionalidades-detalladas)
7. [Diseño de Interfaces](#7-diseño-de-interfaces)
8. [Plan de Implementación](#8-plan-de-implementación)
9. [Seguridad y Autenticación](#9-seguridad-y-autenticación)
10. [Configuración del Entorno](#10-configuración-del-entorno)

---

## 1. Visión General del Proyecto

### 1.1 Descripción
Sistema web progresivo (PWA) para gestión de pedidos de modistería que permite a la administradora gestionar pedidos, abonos y estados, mientras los clientes pueden consultar el estado de sus pedidos en tiempo real.

### 1.2 Objetivos del Sistema
- ✅ Digitalizar la gestión de pedidos y abonos
- ✅ Reducir interrupciones al negocio
- ✅ Mejorar la experiencia del cliente
- ✅ Proporcionar transparencia en pagos y estados
- ✅ Optimizar tiempos de entrega y comunicación

### 1.3 Usuarios del Sistema
- **Administrador (Modista)**: Gestión completa del sistema
- **Clientes**: Consulta de pedidos (sin autenticación)

### 1.4 Estándares de Código e Idioma
- **Idioma Obligatorio**: Todo el código, incluyendo nombres de variables, métodos, clases, comentarios, documentación y mensajes de commit debe estar estrictamente en **ESPAÑOL**.
- **Excepción**: Palabras reservadas del lenguaje (ej. `if`, `else`, `return`) o librerías externas que requieran configuración en inglés.

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│           CLIENTE (Navegador)               │
├─────────────────────────────────────────────┤
│         Angular 17+ PWA                     │
│  - Componentes                              │
│  - Servicios                                │
│  - Guards                                   │
│  - Interceptors                             │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────┐
│         API REST (NestJS)                   │
├─────────────────────────────────────────────┤
│  - Controllers                              │
│  - Services                                 │
│  - Guards (Auth)                            │
│  - Pipes (Validation)                       │
│  - DTOs                                     │
└──────────────────┬──────────────────────────┘
                   │ TypeORM
                   │
┌──────────────────▼──────────────────────────┐
│         Supabase PostgreSQL (Cloud)         │
│  - Tablas                                   │
│  - Relaciones                               │
│  - Triggers                                 │
└─────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | Angular | 17+ |
| Backend | NestJS | 10+ |
| Base de Datos | PostgreSQL (Supabase) | 15+ |
| ORM | TypeORM | 0.3+ |
| Autenticación | JWT | - |
| Hosting Frontend | Vercel/Netlify | - |
| Hosting Backend | Railway/Render | - |

---

## 3. Especificaciones Técnicas

### 3.1 Requisitos Funcionales

#### RF-001: Gestión de Clientes
- **Descripción**: El administrador puede registrar y gestionar clientes
- **Prioridad**: Alta
- **Campos**: Nombre completo, documento, teléfono, email (opcional)

#### RF-002: Gestión de Pedidos
- **Descripción**: El administrador puede crear, editar y eliminar pedidos
- **Prioridad**: Alta
- **Campos**: Cliente, tipo de trabajo, descripción, precio total, fecha entrega estimada, estado

#### RF-003: Gestión de Abonos
- **Descripción**: Registro de pagos parciales
- **Prioridad**: Alta
- **Campos**: Pedido, monto, fecha, método de pago

#### RF-004: Actualización de Estados
- **Descripción**: Cambio de estado del pedido
- **Prioridad**: Alta
- **Estados**: Pendiente, En Proceso, Listo, Entregado

#### RF-005: Consulta Pública de Pedidos
- **Descripción**: Los clientes pueden consultar sus pedidos sin autenticación
- **Prioridad**: Alta
- **Búsqueda por**: Número de pedido, documento, código único

#### RF-006: Dashboard Administrativo
- **Descripción**: Panel con estadísticas y resumen
- **Prioridad**: Media
- **Métricas**: Pedidos pendientes, ingresos del mes, pedidos listos

#### RF-007: Notificaciones (Opcional - Fase 2)
- **Descripción**: Alertas cuando el pedido está listo
- **Prioridad**: Baja
- **Canales**: Email, SMS, WhatsApp

### 3.2 Requisitos No Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-001 | Usabilidad | Interfaz intuitiva para usuarios no técnicos |
| RNF-002 | Rendimiento | Carga de página < 3 segundos |
| RNF-003 | Seguridad | Autenticación JWT, encriptación HTTPS |
| RNF-004 | Disponibilidad | 99% uptime |
| RNF-005 | Responsive | Compatible con móviles, tablets y desktop |
| RNF-006 | PWA | Instalable, funciona offline (caché) |
| RNF-007 | Escalabilidad | Soportar hasta 1000 pedidos activos |

---

## 4. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

```
┌─────────────────┐         ┌─────────────────┐
│    CLIENTES     │         │    PEDIDOS      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ id (PK)         │
│ nombre          │    1:N  │ cliente_id (FK) │
│ documento       │         │ tipo_trabajo    │
│ telefono        │         │ descripcion     │
│ email           │         │ precio_total    │
│ created_at      │         │ saldo_pendiente │
└─────────────────┘         │ fecha_ingreso   │
                            │ fecha_entrega   │
                            │ estado          │
                            │ codigo_unico    │
                            │ created_at      │
                            │ updated_at      │
                            └────────┬────────┘
                                     │ 1:N
                            ┌────────▼────────┐
                            │     ABONOS      │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ pedido_id (FK)  │
                            │ monto           │
                            │ metodo_pago     │
                            │ fecha           │
                            │ created_at      │
                            └─────────────────┘

┌─────────────────┐
│     ADMIN       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password (hash) │
│ nombre          │
│ created_at      │
└─────────────────┘
```

### 4.2 Esquema de Base de Datos (Referencial)
> **Nota:** La estructura de tablas es gestionada automáticamente por TypeORM (Code-First) sincronizado con Supabase. Los scripts a continuación son solo de referencia. Los Triggers deben ejecutarse manualmente en el SQL Editor de Supabase.

### 4.2 Esquema de Base de Datos (SQL)

```sql
-- Tabla de Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    tipo_trabajo VARCHAR(50) NOT NULL, -- 'uniforme', 'arreglo', 'confeccion'
    descripcion TEXT NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_ingreso TIMESTAMP DEFAULT NOW(),
    fecha_entrega_estimada DATE,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'en_proceso', 'listo', 'entregado'
    codigo_unico VARCHAR(10) UNIQUE NOT NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Abonos
CREATE TABLE abonos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL, -- 'efectivo', 'transferencia', 'tarjeta'
    fecha TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Administradores
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash bcrypt
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_clientes_documento ON clientes(documento);
CREATE INDEX idx_pedidos_codigo ON pedidos(codigo_unico);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);

-- Trigger para actualizar saldo pendiente
CREATE OR REPLACE FUNCTION actualizar_saldo_pendiente()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos
    SET saldo_pendiente = precio_total - (
        SELECT COALESCE(SUM(monto), 0)
        FROM abonos
        WHERE pedido_id = NEW.pedido_id
    ),
    updated_at = NOW()
    WHERE id = NEW.pedido_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_saldo
AFTER INSERT ON abonos
FOR EACH ROW
EXECUTE FUNCTION actualizar_saldo_pendiente();
```

---

## 5. Estructura del Proyecto

### 5.1 Estructura del Frontend (Angular)

```
modisteria-frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Servicios singleton, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── cliente.service.ts
│   │   │   │   ├── pedido.service.ts
│   │   │   │   └── abono.service.ts
│   │   │   └── models/
│   │   │       ├── cliente.model.ts
│   │   │       ├── pedido.model.ts
│   │   │       └── abono.model.ts
│   │   │
│   │   ├── shared/                    # Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── loader/
│   │   │   │   └── modal/
│   │   │   ├── pipes/
│   │   │   │   ├── currency.pipe.ts
│   │   │   │   └── estado.pipe.ts
│   │   │   └── directives/
│   │   │
│   │   ├── features/                  # Módulos de funcionalidades
│   │   │   ├── public/               # Área pública (consulta pedidos)
│   │   │   │   ├── consulta/
│   │   │   │   │   ├── consulta.component.ts
│   │   │   │   │   ├── consulta.component.html
│   │   │   │   │   └── consulta.component.scss
│   │   │   │   └── detalle/
│   │   │   │       ├── detalle.component.ts
│   │   │   │       ├── detalle.component.html
│   │   │   │       └── detalle.component.scss
│   │   │   │
│   │   │   ├── auth/                 # Login
│   │   │   │   └── login/
│   │   │   │       ├── login.component.ts
│   │   │   │       ├── login.component.html
│   │   │   │       └── login.component.scss
│   │   │   │
│   │   │   └── admin/                # Área administrativa
│   │   │       ├── dashboard/
│   │   │       │   ├── dashboard.component.ts
│   │   │       │   ├── dashboard.component.html
│   │   │       │   └── dashboard.component.scss
│   │   │       ├── clientes/
│   │   │       │   ├── lista-clientes/
│   │   │       │   └── form-cliente/
│   │   │       ├── pedidos/
│   │   │       │   ├── lista-pedidos/
│   │   │       │   ├── form-pedido/
│   │   │       │   └── detalle-pedido/
│   │   │       └── abonos/
│   │   │           ├── lista-abonos/
│   │   │           └── form-abono/
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.routes.ts             # Rutas de la aplicación
│   │   └── app.config.ts
│   │
│   ├── assets/                        # Recursos estáticos
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html
│   ├── manifest.webmanifest           # Configuración PWA
│   ├── ngsw-config.json               # Service Worker
│   └── styles.scss                    # Estilos globales
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

### 5.2 Estructura del Backend (NestJS)

```
modisteria-backend/
├── src/
│   ├── main.ts                        # Punto de entrada
│   │
│   ├── auth/                          # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   │
│   ├── clientes/                      # Módulo de clientes
│   │   ├── clientes.module.ts
│   │   ├── clientes.controller.ts
│   │   ├── clientes.service.ts
│   │   ├── entities/
│   │   │   └── cliente.entity.ts
│   │   └── dto/
│   │       ├── create-cliente.dto.ts
│   │       └── update-cliente.dto.ts
│   │
│   ├── pedidos/                       # Módulo de pedidos
│   │   ├── pedidos.module.ts
│   │   ├── pedidos.controller.ts
│   │   ├── pedidos.service.ts
│   │   ├── entities/
│   │   │   └── pedido.entity.ts
│   │   └── dto/
│   │       ├── create-pedido.dto.ts
│   │       ├── update-pedido.dto.ts
│   │       └── consulta-pedido.dto.ts
│   │
│   ├── abonos/                        # Módulo de abonos
│   │   ├── abonos.module.ts
│   │   ├── abonos.controller.ts
│   │   ├── abonos.service.ts
│   │   ├── entities/
│   │   │   └── abono.entity.ts
│   │   └── dto/
│   │       └── create-abono.dto.ts
│   │
│   ├── admin/                         # Módulo de administradores
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── entities/
│   │       └── admin.entity.ts
│   │
│   ├── common/                        # Recursos compartidos
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   │
│   ├── config/                        # Configuraciones
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   └── app.module.ts                  # Módulo raíz
│
├── test/
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. Funcionalidades Detalladas

### 6.1 Módulo de Autenticación

#### Endpoints:
```
POST /api/auth/login
Request Body:
{
  "email": "admin@modisteria.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@modisteria.com",
    "nombre": "María García"
  }
}
```

### 6.2 Módulo de Clientes

#### Endpoints:
```
GET    /api/clientes              # Listar todos (Protegido)
GET    /api/clientes/:id          # Obtener uno (Protegido)
POST   /api/clientes              # Crear (Protegido)
PATCH  /api/clientes/:id          # Actualizar (Protegido)
DELETE /api/clientes/:id          # Eliminar (Protegido)
GET    /api/clientes/documento/:documento  # Buscar por documento (Protegido)
```

#### Ejemplo Create:
```json
POST /api/clientes
{
  "nombre": "Juan Pérez",
  "documento": "1234567890",
  "telefono": "+573001234567",
  "email": "juan@email.com"
}
```

### 6.3 Módulo de Pedidos

#### Endpoints:
```
GET    /api/pedidos                    # Listar todos (Protegido)
GET    /api/pedidos/:id                # Obtener uno (Protegido)
POST   /api/pedidos                    # Crear (Protegido)
PATCH  /api/pedidos/:id                # Actualizar (Protegido)
PATCH  /api/pedidos/:id/estado         # Cambiar estado (Protegido)
DELETE /api/pedidos/:id                # Eliminar (Protegido)
GET    /api/pedidos/consulta/:codigo   # Consulta pública por código (Público)
POST   /api/pedidos/consulta/documento # Consulta pública por documento (Público)
```

#### Ejemplo Create:
```json
POST /api/pedidos
{
  "cliente_id": "uuid-del-cliente",
  "tipo_trabajo": "uniforme",
  "descripcion": "Uniforme escolar talla 8, pantalón azul y camisa blanca",
  "precio_total": 80000,
  "fecha_entrega_estimada": "2026-02-20",
  "notas": "Cliente prefiere entrega antes del 20"
}
```

#### Consulta Pública:
```
GET /api/pedidos/consulta/ABC12345

Response:
{
  "id": "uuid",
  "codigo_unico": "ABC12345",
  "tipo_trabajo": "uniforme",
  "descripcion": "Uniforme escolar...",
  "estado": "en_proceso",
  "precio_total": 80000,
  "saldo_pendiente": 30000,
  "fecha_ingreso": "2026-02-11T10:00:00Z",
  "fecha_entrega_estimada": "2026-02-20",
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "+573001234567"
  },
  "abonos": [
    {
      "monto": 50000,
      "fecha": "2026-02-11T10:00:00Z",
      "metodo_pago": "efectivo"
    }
  ]
}
```

### 6.4 Módulo de Abonos

#### Endpoints:
```
GET    /api/abonos                # Listar todos (Protegido)
GET    /api/abonos/pedido/:id    # Abonos de un pedido (Protegido)
POST   /api/abonos               # Registrar abono (Protegido)
DELETE /api/abonos/:id           # Eliminar abono (Protegido)
```

#### Ejemplo Create:
```json
POST /api/abonos
{
  "pedido_id": "uuid-del-pedido",
  "monto": 30000,
  "metodo_pago": "transferencia"
}
```

---

## 7. Diseño de Interfaces

### 7.1 Paleta de Colores

```scss
// Variables de color
$primary: #6366F1;      // Índigo - Botones principales
$secondary: #8B5CF6;    // Púrpura - Acentos
$success: #10B981;      // Verde - Estados positivos
$warning: #F59E0B;      // Ámbar - Advertencias
$danger: #EF4444;       // Rojo - Errores
$info: #3B82F6;         // Azul - Información

$background: #F9FAFB;   // Gris claro - Fondo
$surface: #FFFFFF;      // Blanco - Tarjetas
$text-primary: #111827; // Gris oscuro - Texto principal
$text-secondary: #6B7280; // Gris medio - Texto secundario
```

### 7.2 Wireframes Principales

#### Consulta Pública (Landing Page)
```
┌──────────────────────────────────────────┐
│           🧵 MODISTERÍA LÓPEZ            │
│      Consulta el estado de tu pedido     │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Buscar por:                       │ │
│  │  ( ) Número de pedido              │ │
│  │  (•) Documento                     │ │
│  │                                    │ │
│  │  [___________________________]     │ │
│  │            [Consultar]             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  💡 Ingresa tu documento o el número    │
│     de pedido para ver el estado        │
└──────────────────────────────────────────┘
```

#### Dashboard Administrativo
```
┌──────────────────────────────────────────────────────┐
│  📊 Dashboard  │  👥 Clientes  │  📦 Pedidos  │  💰  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ 📋 Pedidos  │  │ ⏱️ En Proceso│  │ ✅ Listos   ││
│  │     23      │  │      8       │  │      5      ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                      │
│  📈 Ingresos del mes: $1,250,000                    │
│                                                      │
│  ┌─ Pedidos Recientes ─────────────────────────┐   │
│  │ ABC123 │ Juan Pérez  │ Uniforme │ Listo ✓ │   │
│  │ ABC124 │ Ana López   │ Arreglo  │ En proceso│   │
│  │ ABC125 │ Pedro Ruiz  │ Confección│ Pendiente│   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

#### Detalle de Pedido (Cliente)
```
┌──────────────────────────────────────────┐
│          ← Volver a la búsqueda          │
├──────────────────────────────────────────┤
│                                          │
│  📦 Pedido #ABC12345                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                          │
│  Estado: 🟢 LISTO PARA RECOGER          │
│                                          │
│  👤 Cliente: Juan Pérez                  │
│  📱 Teléfono: +57 300 123 4567          │
│                                          │
│  🧵 Tipo: Uniforme Escolar              │
│  📝 Descripción:                         │
│      Uniforme talla 8, pantalón azul    │
│      y camisa blanca                     │
│                                          │
│  💰 Información de Pago                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Total: $80,000                          │
│  Abonado: $50,000                        │
│  Saldo: $30,000                          │
│                                          │
│  📅 Fechas                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Ingreso: 11 Feb 2026                    │
│  Entrega estimada: 20 Feb 2026           │
│                                          │
│  ✅ Tu pedido está listo                │
│     Puedes pasar a recogerlo             │
└──────────────────────────────────────────┘
```

### 7.3 Estados del Pedido (Visuales)

```
🔵 Pendiente    →  Pedido registrado, aún no iniciado
🟡 En Proceso   →  Se está trabajando en el pedido
🟢 Listo        →  Terminado, listo para recoger
⚫ Entregado    →  Cliente lo recogió
```

---

## 8. Plan de Implementación

### 8.1 Fases del Proyecto

#### **Fase 1: Configuración Inicial** (Semana 1)
- [ ] Configurar proyecto Angular con PWA
- [ ] Configurar proyecto NestJS
- [ ] Configurar base de datos en Supabase
- [ ] Implementar modelos y entities
- [ ] Configurar TypeORM
- [ ] Setup de variables de entorno

#### **Fase 2: Backend - API REST** (Semanas 2-3)
- [ ] Módulo de autenticación (JWT)
- [ ] Módulo de clientes (CRUD)
- [ ] Módulo de pedidos (CRUD)
- [ ] Módulo de abonos (CRUD)
- [ ] Endpoints de consulta pública
- [ ] Validaciones y DTOs
- [ ] Manejo de errores
- [ ] Documentación con Swagger

#### **Fase 3: Frontend - Área Pública** (Semana 4)
- [ ] Landing page de consulta
- [ ] Formulario de búsqueda
- [ ] Pantalla de detalle de pedido
- [ ] Diseño responsive
- [ ] Manejo de estados de carga

#### **Fase 4: Frontend - Área Administrativa** (Semanas 5-6)
- [ ] Login de administrador
- [ ] Dashboard con estadísticas
- [ ] CRUD de clientes
- [ ] CRUD de pedidos
- [ ] Registro de abonos
- [ ] Filtros y búsquedas

#### **Fase 5: PWA y Optimizaciones** (Semana 7)
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Caché offline
- [ ] Instalación en dispositivos
- [ ] Optimización de imágenes
- [ ] Lazy loading

#### **Fase 6: Testing y Deploy** (Semana 8)
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Testing E2E
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Configuración de dominio
- [ ] Monitoreo y logs

### 8.2 Cronograma Gantt

```
Semana │ Fase
───────┼────────────────────────────────────
   1   │ ████ Configuración Inicial
   2   │ ████████ Backend API
   3   │ ████████ Backend API
   4   │         ████████ Frontend Público
   5   │                 ████████ Admin
   6   │                 ████████ Admin
   7   │                         ████ PWA
   8   │                             ████ Deploy
```

---

## 9. Seguridad y Autenticación

### 9.1 Estrategia de Autenticación

```typescript
// JWT Payload
interface JwtPayload {
  sub: string;      // User ID
  email: string;
  nombre: string;
  iat: number;      // Issued at
  exp: number;      // Expiration
}

// Configuración JWT
{
  secret: process.env.JWT_SECRET,
  expiresIn: '7d'   // 7 días de validez
}
```

### 9.2 Protección de Rutas

#### Backend (NestJS)
```typescript
@Controller('pedidos')
@UseGuards(JwtAuthGuard)  // Protege todo el controlador
export class PedidosController {
  
  @Get('consulta/:codigo')
  @Public()  // Excepción: ruta pública
  consultarPorCodigo(@Param('codigo') codigo: string) {
    // Accesible sin autenticación
  }
}
```

#### Frontend (Angular)
```typescript
const routes: Routes = [
  { path: '', component: ConsultaComponent },
  { path: 'detalle/:codigo', component: DetalleComponent },
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/admin/admin.module')
  }
];
```

### 9.3 Variables de Entorno

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://tudominio.com
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com',
  apiVersion: 'v1'
};
```

---

## 10. Configuración del Entorno

### 10.1 Requisitos Previos

- **Node.js**: v18+ o v20+
- **npm** o **yarn**
- **Angular CLI**: `npm install -g @angular/cli`
- **NestJS CLI**: `npm install -g @nestjs/cli`
- **Supabase**: Cuenta y proyecto activo (no requiere PostgreSQL local)
- **Git**: Control de versiones

### 10.2 Instalación Backend

```bash
# Crear proyecto NestJS
nest new modisteria-backend
cd modisteria-backend

# Instalar dependencias
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install @nestjs/config

# Dependencias de desarrollo
npm install -D @types/passport-jwt @types/bcrypt

# Crear estructura de módulos
nest g module auth
nest g module clientes
nest g module pedidos
nest g module abonos
nest g module admin

# Crear controladores y servicios
nest g service auth
nest g controller auth
nest g service clientes
nest g controller clientes
# ... repetir para otros módulos
```

### 10.3 Instalación Frontend

```bash
# Crear proyecto Angular
ng new modisteria-frontend --routing --style=scss
cd modisteria-frontend

# Agregar PWA
ng add @angular/pwa

# Instalar dependencias (opcional)
npm install @angular/material
npm install chart.js ng2-charts  # Para gráficos en dashboard

# Generar módulos
ng g module core
ng g module shared
ng g module features/public
ng g module features/auth
ng g module features/admin

# Generar componentes
ng g c features/public/consulta
ng g c features/public/detalle
ng g c features/auth/login
ng g c features/admin/dashboard
# ... etc
```

### 10.4 Configuración de Supabase

```sql
-- 1. Crear proyecto en https://supabase.com
-- 2. Ir a Project Settings -> Database -> Connection Pooler
-- 3. Copiar las credenciales (Host: aws-0-us-west-1.pooler.supabase.com, Port: 6543)
-- 4. Actualizar el archivo .env con estas credenciales
-- 5. Ejecutar el script `db/init_triggers.sql` en el SQL Editor de Supabase

-- Ejemplo de configuración RLS (opcional)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consulta pública de pedidos"
ON pedidos FOR SELECT
USING (true);  -- Permite lectura pública

CREATE POLICY "Admin puede todo"
ON pedidos FOR ALL
USING (auth.role() = 'authenticated');
```

### 10.5 Scripts Útiles

#### package.json (Backend)
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "typeorm": "typeorm-ts-node-commonjs"
  }
}
```

#### package.json (Frontend)
```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Angular Docs](https://angular.io/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Supabase Docs](https://supabase.com/docs)
- [PWA Builder](https://www.pwabuilder.com)

### Tutoriales Recomendados
- Angular PWA: https://angular.io/guide/service-worker-getting-started
- NestJS Authentication: https://docs.nestjs.com/security/authentication
- TypeORM Relations: https://typeorm.io/relations

---

## 🎯 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de carga | < 3 segundos |
| Disponibilidad | > 99% |
| Pedidos gestionados | Sin límite práctico |
| Reducción de interrupciones | 70% menos llamadas |
| Satisfacción del cliente | > 4.5/5 |
| Tiempo de implementación | 8 semanas |

---

## 📞 Soporte y Mantenimiento

### Backup de Base de Datos
```bash
# Backup automático diario (configurar en Supabase)
# O manual con pg_dump
pg_dump -h hostname -U username -d database > backup.sql
```

### Monitoreo
- Logs: Winston (NestJS)
- Errores: Sentry
- Analytics: Google Analytics
- Uptime: UptimeRobot

---

## ✅ Checklist Final Pre-Lanzamiento

- [ ] Base de datos migrada y poblada
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y funcionando
- [ ] PWA instalable en móviles
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Documentación de usuario creada
- [ ] Capacitación a la modista realizada
- [ ] Pruebas de carga completadas
- [ ] Plan de contingencia establecido

---

**¡Listo para comenzar el desarrollo!** 🚀

Esta documentación debe ser tu guía principal durante todo el proyecto. Actualízala conforme avances y encuentres mejores prácticas.
