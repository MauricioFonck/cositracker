# 📋 Plan de Tareas del Proyecto - Sistema de Gestión de Pedidos

## Fase 1: Configuración Inicial y Fundamentos

### 1.1 Configuración del Entorno de Desarrollo
- [x] Instalar Node.js v18+ o v20+
- [x] Instalar Angular CLI globalmente
- [x] Instalar NestJS CLI globalmente
- [X] Configurar Git y crear repositorio del proyecto
- [X] Crear cuenta en Supabase para la base de datos PostgreSQL

### 1.2 Configuración de la Base de Datos
- [X] Crear proyecto en Supabase
- [X] Ejecutar script SQL para crear todas las tablas (clientes, pedidos, abonos, admins) - *Realizado vía TypeORM Code-First*
- [X] Crear índices para optimización de consultas - *Definidos en Entidades*
- [X] Configurar triggers para actualización automática de saldo pendiente - *Script SQL generado en db/init_triggers.sql*
- [X] **TEST:** Probar conexión a la base de datos
- [X] **TEST:** Verificar que las tablas se crearon correctamente
- [X] **TEST:** Probar que el trigger de saldo pendiente funciona insertando un abono de prueba

### 1.3 Configuración del Backend (NestJS)
- [X] Crear proyecto NestJS
- [X] Instalar dependencias necesarias (TypeORM, Passport, JWT, bcrypt, class-validator)
- [X] Configurar archivo de variables de entorno (.env)
- [X] Configurar conexión a base de datos con TypeORM
- [X] Configurar CORS para permitir peticiones del frontend
- [X] **TEST:** Ejecutar proyecto y verificar que inicia sin errores
- [X] **TEST:** Verificar conexión exitosa a la base de datos

### 1.4 Configuración del Frontend (Angular)
- [X] Crear proyecto Angular con routing y SCSS
- [X] Configurar estructura de carpetas (core, shared, features)
- [X] Configurar archivo de ambientes (environment.ts)
- [X] Configurar proxy para desarrollo local
- [X] **TEST:** Ejecutar proyecto y verificar que carga en el navegador

---

## Fase 2: Desarrollo del Backend - Core Funcional

### 2.1 Implementación de Autenticación
- [x] Crear módulo de autenticación (auth)
- [x] Crear entidad Admin con TypeORM
- [x] Implementar hash de contraseñas con bcrypt
- [x] Implementar estrategia JWT
- [x] Crear guards de autenticación
- [x] Crear decoradores personalizados (@Public)
- [x] Crear endpoints de login y validación de token
- [x] **TEST:** Probar registro de admin en base de datos
- [x] **TEST:** Verificar que la contraseña se guarde hasheada
- [x] **TEST:** Probar login con credenciales correctas
- [x] **TEST:** Probar login con credenciales incorrectas
- [x] **TEST:** Verificar que se genera el token JWT correctamente
- [x] **TEST:** Probar acceso a ruta protegida con token válido
- [x] **TEST:** Probar acceso a ruta protegida sin token (debe denegar)
- [x] **TEST:** Probar acceso a ruta pública sin token (debe permitir)

### 2.2 Implementación del Módulo de Clientes
- [x] Crear módulo, controlador y servicio de clientes
- [x] Crear entidad Cliente con TypeORM
- [x] Crear DTOs para validación (crear y actualizar cliente)
- [x] Implementar CRUD completo de clientes
- [x] Implementar búsqueda de clientes por documento
- [x] Implementar validaciones de datos únicos
- [x] **TEST:** Crear un cliente y verificar que se guarda en BD
- [x] **TEST:** Probar que no se puede crear cliente con documento duplicado
- [x] **TEST:** Obtener listado de todos los clientes
- [x] **TEST:** Buscar cliente por ID
- [x] **TEST:** Buscar cliente por documento
- [x] **TEST:** Actualizar datos de un cliente
- [x] **TEST:** Eliminar un cliente
- [x] **TEST:** Verificar validaciones de campos requeridos

### 2.3 Implementación del Módulo de Pedidos
- [x] Crear módulo, controlador y servicio de pedidos
- [x] Crear entidad Pedido con TypeORM
- [x] Crear DTOs para validación (crear y actualizar pedido)
- [x] Implementar generación automática de código único
- [x] Implementar CRUD completo de pedidos
- [x] Implementar cambio de estados del pedido
- [x] Implementar consulta pública por código único (sin autenticación)
- [x] Implementar filtros por estado y cliente
- [x] **TEST:** Crear un pedido y verificar que se guarda en BD
- [x] **TEST:** Verificar que el código único se genera automáticamente
- [x] **TEST:** Verificar que el código único es realmente único
- [x] **TEST:** Verificar que el saldo pendiente inicial es igual al precio total
- [x] **TEST:** Obtener listado de todos los pedidos
- [x] **TEST:** Buscar pedido por ID
- [x] **TEST:** Buscar pedido por código único (ruta pública, sin auth)
- [x] **TEST:** Actualizar datos de un pedido
- [x] **TEST:** Cambiar estado de un pedido
- [x] **TEST:** Filtrar pedidos por estado
- [x] **TEST:** Filtrar pedidos por cliente
- [x] **TEST:** Eliminar un pedido
- [x] **TEST:** Verificar que al eliminar cliente se eliminan sus pedidos (CASCADE)

### 2.4 Implementación del Módulo de Abonos
- [x] Crear módulo, controlador y servicio de abonos
- [x] Crear entidad Abono con TypeORM
- [x] Crear DTOs para validación (crear abono)
- [x] Implementar creación de abonos
- [x] Implementar cálculo automático de saldo pendiente
- [x] Implementar listado de abonos por pedido
- [x] Implementar eliminación de abonos (con recálculo de saldo)
- [x] **TEST:** Crear un abono y verificar que se guarda en BD
- [x] **TEST:** Verificar que el saldo pendiente se actualiza automáticamente al crear abono
- [x] **TEST:** Crear múltiples abonos y verificar cálculo correcto del saldo
- [x] **TEST:** Crear abono que cubra el total y verificar que saldo quede en 0
- [x] **TEST:** Obtener listado de abonos de un pedido específico
- [x] **TEST:** Eliminar un abono y verificar que el saldo se recalcula
- [x] **TEST:** Verificar que al eliminar pedido se eliminan sus abonos (CASCADE)
- [x] **TEST:** Probar que no se puede crear abono para pedido inexistente

### 2.5 Implementación de Endpoints Adicionales
- [x] Crear endpoint para estadísticas del dashboard (pedidos activos, ingresos, etc.)
- [x] Crear endpoint para obtener resumen de pedidos listos
- [x] Crear endpoint para búsqueda avanzada de pedidos
- [x] Implementar paginación en listados
- [x] **TEST:** Probar endpoint de estadísticas con datos reales
- [x] **TEST:** Verificar cálculo correcto de ingresos del mes
- [x] **TEST:** Verificar conteo correcto de pedidos por estado
- [x] **TEST:** Probar paginación con diferentes tamaños de página
- [x] **TEST:** Probar búsqueda avanzada con múltiples filtros

### 2.6 Implementación de Seguridad y Validaciones
- [x] Configurar pipes de validación global
- [x] Implementar interceptor de errores
- [x] Implementar sanitización de datos
- [x] Configurar rate limiting básico
- [x] Implementar logging de acciones críticas
- [x] **TEST:** Enviar datos inválidos y verificar que se rechacen
- [x] **TEST:** Verificar que errores se manejen correctamente
- [x] **TEST:** Probar límite de peticiones (rate limiting)

---

## Fase 3: Desarrollo del Frontend - Funcionalidad Core

### 3.1 Implementación de Servicios Core
- [x] Crear servicio de autenticación (manejo de tokens, login, logout)
- [x] Crear servicio de clientes (CRUD)
- [x] Crear servicio de pedidos (CRUD, consultas)
- [x] Crear servicio de abonos (CRUD)
- [x] Crear interceptor HTTP para agregar token JWT automáticamente
- [x] Crear interceptor para manejo de errores HTTP
- [x] Crear modelos TypeScript para todas las entidades
- [x] **TEST:** Probar que el token se guarda correctamente en localStorage
- [x] **TEST:** Probar que el interceptor agrega el token a las peticiones
- [x] **TEST:** Probar que el servicio de auth detecta si hay sesión activa
- [x] **TEST:** Verificar que logout limpia el token correctamente

### 3.2 Implementación de Guards y Utilidades
- [x] Crear AuthGuard para proteger rutas administrativas
- [x] Crear guard para redirección si ya está autenticado
- [x] Crear pipes y validadores personalizados
- [x] Crear utilidades para formateo de fechas y montos
- [x] **TEST:** Probar que AuthGuard bloquea acceso sin autenticación
- [x] **TEST:** Probar que AuthGuard permite acceso con token válido
- [x] **TEST:** Verificar redirección a login cuando no hay token

### 3.3 Desarrollo de la Sección Pública (Consulta de Pedidos)
- [x] Crear componente de consulta inicial (formulario de búsqueda)
- [x] Implementar búsqueda por código único o documento
- [x] Crear componente de detalle de pedido
- [x] Mostrar información del cliente
- [x] Mostrar detalles del pedido (descripción, precio, estado)
- [x] Mostrar listado de abonos realizados
- [x] Mostrar saldo pendiente
- [x] Implementar diseño responsive para móviles
- [x] **TEST:** Buscar pedido con código válido y verificar que se muestra
- [x] **TEST:** Buscar pedido con código inválido y verificar mensaje de error
- [x] **TEST:** Verificar que el cálculo de saldo pendiente se muestra correctamente
- [x] **TEST:** Verificar visualización correcta en móvil (Chrome DevTools)

### 3.4 Desarrollo de la Sección de Autenticación
- [x] Crear componente de login
- [x] Crear componente de registro (registro de administradores)
- [x] Implementar formulario de inicio de sesión y registro
- [x] Implementar validaciones en ambos formularios
- [x] Implementar manejo de errores de autenticación y registro
- [x] Implementar redirección automática tras login exitoso
- [x] **TEST:** Probar login con credenciales correctas
- [x] **TEST:** Probar registro de nuevo administrador
- [x] **TEST:** Verificar validaciones de campos vacíos y correos duplicados
- [x] **TEST:** Verificar redirección al dashboard tras login exitoso (Temporalmente redirige a consulta)

### 3.5 Desarrollo del Panel Administrativo - Dashboard
- [x] Crear estructura del layout administrativo (sidebar, header)
- [x] Crear componente de dashboard
- [x] Mostrar tarjetas con estadísticas principales
- [x] Implementar contador de pedidos por estado
- [x] Implementar cálculo de ingresos del mes
- [x] Mostrar gráficos básicos de métricas (Simplificado con tarjetas estadísticas)
- [x] **TEST:** Verificar que las estadísticas se cargan correctamente
- [x] **TEST:** Verificar cálculos de totales con datos de prueba
- [x] **TEST:** Probar que el dashboard es responsive

### 3.6 Desarrollo del Panel Administrativo - Gestión de Clientes
- [x] Crear componente de listado de clientes
- [x] Implementar tabla con todos los clientes
- [x] Crear componente de formulario para crear cliente
- [x] Crear componente de formulario para editar cliente
- [x] Implementar búsqueda y filtrado de clientes
- [x] Implementar paginación
- [x] Implementar modales de confirmación para eliminar
- [x] **TEST:** Crear un cliente y verificar que aparece en la lista
- [x] **TEST:** Editar un cliente y verificar que se actualiza
- [x] **TEST:** Eliminar un cliente y verificar que desaparece
- [x] **TEST:** Probar búsqueda de clientes por nombre/documento
- [x] **TEST:** Verificar validaciones de formulario (campos requeridos)
- [x] **TEST:** Probar que no permite duplicar documentos

### 3.7 Desarrollo del Panel Administrativo - Gestión de Pedidos
- [ ] Crear componente de listado de pedidos
- [ ] Implementar tabla con todos los pedidos
- [ ] Implementar filtros por estado, cliente y fechas
- [ ] Crear componente de formulario para crear pedido
- [ ] Implementar selección de cliente existente o crear nuevo
- [ ] Crear componente de formulario para editar pedido
- [ ] Implementar cambio rápido de estados
- [ ] Crear componente para ver detalle completo del pedido
- [ ] Mostrar timeline de cambios de estado
- [ ] Mostrar historial de abonos
- [ ] **TEST:** Crear un pedido y verificar que aparece en la lista
- [ ] **TEST:** Verificar que el código único se genera y muestra
- [ ] **TEST:** Editar un pedido y verificar que se actualiza
- [ ] **TEST:** Cambiar estado de un pedido y verificar cambio visual
- [ ] **TEST:** Eliminar un pedido y verificar que desaparece
- [ ] **TEST:** Probar filtros por estado (ver solo pendientes, listos, etc.)
- [ ] **TEST:** Probar filtro por cliente
- [ ] **TEST:** Verificar que saldo pendiente se muestra correctamente

### 3.8 Desarrollo del Panel Administrativo - Gestión de Abonos
- [ ] Crear componente para registrar nuevo abono
- [ ] Implementar formulario con validación de monto
- [ ] Implementar selección de método de pago
- [ ] Mostrar saldo actualizado en tiempo real
- [ ] Implementar confirmación de registro de abono
- [ ] Crear vista de historial de abonos por pedido
- [ ] **TEST:** Registrar un abono y verificar que aparece en la lista
- [ ] **TEST:** Verificar que el saldo del pedido se actualiza automáticamente
- [ ] **TEST:** Registrar múltiples abonos y verificar cálculo correcto
- [ ] **TEST:** Intentar registrar abono mayor al saldo y verificar validación
- [ ] **TEST:** Eliminar un abono y verificar que el saldo se recalcula

### 3.9 Implementación de Componentes Compartidos
- [ ] Crear componente de botón reutilizable
- [ ] Crear componente de tabla reutilizable
- [ ] Crear componente de formulario base
- [ ] Crear componente de modal reutilizable
- [ ] Crear componente de loader/spinner
- [ ] Crear componente de alerta/notificación
- [ ] Crear componente de confirmación
- [ ] **TEST:** Verificar que los componentes compartidos se renderizan correctamente
- [ ] **TEST:** Probar interacciones con modales (abrir, cerrar, confirmar)

---

## Fase 4: Funcionalidades PWA y Optimización

### 4.1 Configuración PWA
- [ ] Agregar soporte PWA al proyecto Angular
- [ ] Configurar manifest.json con información de la app
- [ ] Configurar iconos para diferentes tamaños de pantalla
- [ ] Configurar service worker para caché de assets
- [ ] Configurar estrategias de caché para API
- [ ] **TEST:** Verificar que manifest.json es válido (usar Lighthouse)
- [ ] **TEST:** Probar instalación de la PWA en dispositivo móvil Android
- [ ] **TEST:** Probar instalación de la PWA en dispositivo iOS
- [ ] **TEST:** Verificar que los iconos se muestran correctamente al instalar

### 4.2 Funcionalidades Offline
- [ ] Implementar caché de datos críticos
- [ ] Implementar fallback para cuando no hay conexión
- [ ] Mostrar indicador de estado de conexión
- [ ] Implementar sincronización cuando se recupere la conexión
- [ ] **TEST:** Desconectar internet y verificar que la app muestra datos cacheados
- [ ] **TEST:** Verificar indicador de "sin conexión"
- [ ] **TEST:** Reconectar y verificar sincronización de datos

### 4.3 Optimización del Rendimiento
- [ ] Implementar lazy loading de módulos
- [ ] Optimizar imágenes y assets
- [ ] Implementar virtual scroll en listados largos
- [ ] Minimizar y comprimir archivos CSS/JS
- [ ] Implementar preload de rutas críticas
- [ ] **TEST:** Medir tiempo de carga inicial (debe ser < 3 segundos)
- [ ] **TEST:** Verificar lazy loading con Chrome DevTools (Network tab)
- [ ] **TEST:** Ejecutar Lighthouse y verificar score > 90 en Performance

---

## Fase 5: Testing y Validación

### 5.1 Testing Backend
- [ ] Escribir pruebas unitarias de servicios críticos
- [ ] Escribir pruebas de integración de endpoints principales
- [ ] Probar autenticación y autorización
- [ ] Probar cálculo de saldos y triggers de base de datos
- [ ] Realizar pruebas de carga básicas
- [ ] **TEST:** Ejecutar suite completa de tests y verificar que todos pasen
- [ ] **TEST:** Verificar cobertura de código > 70%

### 5.2 Testing Frontend
- [ ] Escribir pruebas unitarias de servicios críticos
- [ ] Escribir pruebas de componentes principales
- [ ] Probar guards y interceptores
- [ ] Probar formularios y validaciones
- [ ] Realizar pruebas de usabilidad
- [ ] **TEST:** Ejecutar suite completa de tests y verificar que todos pasen
- [ ] **TEST:** Verificar cobertura de código > 60%

### 5.3 Validación Manual
- [ ] Probar flujo completo de creación de pedido
- [ ] Probar flujo de registro de abonos
- [ ] Probar consulta pública de pedidos
- [ ] Probar cambios de estado
- [ ] Validar cálculos de saldos
- [ ] Probar en diferentes dispositivos y navegadores
- [ ] Validar responsive design en móviles y tablets
- [ ] **TEST:** Crear pedido desde cero con cliente nuevo
- [ ] **TEST:** Registrar 3 abonos y verificar que el saldo final es correcto
- [ ] **TEST:** Buscar pedido desde dispositivo móvil sin autenticación
- [ ] **TEST:** Probar en Chrome, Firefox, Safari y Edge
- [ ] **TEST:** Probar en móvil Android
- [ ] **TEST:** Probar en móvil iOS

---

## Fase 6: Deployment y Configuración de Producción

### 6.1 Preparación del Backend para Producción
- [ ] Configurar variables de entorno para producción
- [ ] Generar build de producción optimizado
- [ ] Configurar logging apropiado
- [ ] Configurar seguridad HTTPS
- [ ] Preparar scripts de inicio
- [ ] **TEST:** Ejecutar build de producción localmente y verificar que funciona
- [ ] **TEST:** Verificar que todas las variables de entorno están configuradas

### 6.2 Deployment del Backend
- [ ] Crear cuenta en Railway/Render
- [ ] Configurar proyecto en plataforma de hosting
- [ ] Subir código del backend
- [ ] Configurar variables de entorno en el hosting
- [ ] Configurar dominio personalizado (opcional)
- [ ] Verificar conexión a base de datos de Supabase
- [ ] **TEST:** Verificar que el backend inicia correctamente en producción
- [ ] **TEST:** Probar endpoint de health check
- [ ] **TEST:** Probar conexión a base de datos desde producción
- [ ] **TEST:** Hacer login desde Postman/Insomnia usando URL de producción

### 6.3 Preparación del Frontend para Producción
- [ ] Actualizar variables de entorno con URL de API en producción
- [ ] Generar build de producción optimizado
- [ ] Verificar que PWA esté correctamente configurada
- [ ] Validar que todos los assets estén incluidos
- [ ] **TEST:** Ejecutar build de producción localmente
- [ ] **TEST:** Servir build localmente y verificar funcionamiento

### 6.4 Deployment del Frontend
- [ ] Crear cuenta en Vercel/Netlify
- [ ] Conectar repositorio de Git
- [ ] Configurar build settings
- [ ] Configurar variables de entorno
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar redirecciones y reglas de ruteo
- [ ] **TEST:** Verificar que el frontend carga correctamente en producción
- [ ] **TEST:** Probar que se comunica correctamente con el backend
- [ ] **TEST:** Verificar que las rutas funcionan correctamente

### 6.5 Configuración Final
- [ ] Verificar comunicación entre frontend y backend
- [ ] Configurar CORS en backend con dominio de producción
- [ ] Configurar SSL/HTTPS en ambos servicios
- [ ] Configurar backups automáticos de base de datos en Supabase
- [ ] **TEST:** Hacer una petición completa desde el frontend en producción
- [ ] **TEST:** Verificar que SSL está activo (candado verde en navegador)
- [ ] **TEST:** Verificar que backups están configurados en Supabase

---

## Fase 7: Post-Deployment y Verificación

### 7.1 Verificación de Funcionalidad
- [ ] Probar login en producción
- [ ] Crear cliente de prueba en producción
- [ ] Crear pedido de prueba en producción
- [ ] Registrar abono de prueba en producción
- [ ] Verificar consulta pública desde dispositivo móvil
- [ ] Probar instalación de PWA en dispositivo móvil
- [ ] Verificar que notificaciones funcionen correctamente
- [ ] **TEST:** Completar flujo completo desde cero en producción
- [ ] **TEST:** Verificar que todos los cálculos son correctos
- [ ] **TEST:** Instalar PWA en móvil y verificar que funciona offline
- [ ] **TEST:** Verificar que la app se ve bien en diferentes tamaños de pantalla

### 7.2 Configuración de Monitoreo
- [ ] Configurar logging de errores
- [ ] Configurar alertas de downtime
- [ ] Configurar analytics básico
- [ ] Configurar monitoreo de rendimiento
- [ ] **TEST:** Generar un error intencional y verificar que se registra
- [ ] **TEST:** Verificar que las alertas funcionan

### 7.3 Documentación de Usuario
- [ ] Crear manual de usuario para la modista
- [ ] Documentar flujo de creación de pedidos
- [ ] Documentar flujo de registro de abonos
- [ ] Crear guía de consulta para clientes
- [ ] Crear FAQs
- [ ] **TEST:** Pedir a alguien sin conocimiento técnico que lea el manual y pruebe la app

### 7.4 Capacitación
- [ ] Realizar sesión de capacitación con la modista
- [ ] Demostrar creación de clientes
- [ ] Demostrar gestión de pedidos
- [ ] Demostrar registro de abonos
- [ ] Explicar consulta pública para compartir con clientes
- [ ] **TEST:** Que la modista realice todas las operaciones de forma autónoma
- [ ] **TEST:** Resolver dudas y documentar preguntas frecuentes

---

## Fase 8: Mejoras Visuales y Experiencia de Usuario (UI/UX)

### 8.1 Refinamiento del Diseño Visual
- [ ] Definir y aplicar paleta de colores corporativa
- [ ] Elegir y aplicar tipografías consistentes
- [ ] Crear sistema de espaciado consistente
- [ ] Implementar animaciones y transiciones suaves
- [ ] Agregar micro-interacciones en botones y elementos
- [ ] **TEST:** Verificar que los colores tienen buen contraste (herramientas de accesibilidad)
- [ ] **TEST:** Verificar que las animaciones no son muy lentas ni muy rápidas

### 8.2 Mejoras en la Interfaz Pública
- [ ] Diseñar pantalla de bienvenida atractiva
- [ ] Mejorar diseño del formulario de consulta
- [ ] Diseñar card de detalle de pedido más visual
- [ ] Agregar indicadores visuales de progreso de pedido
- [ ] Implementar badges de estado con colores distintivos
- [ ] **TEST:** Pedir feedback a usuarios sobre el diseño
- [ ] **TEST:** Verificar que es fácil de usar en móvil

### 8.3 Mejoras en el Panel Administrativo
- [ ] Diseñar sidebar con iconografía clara
- [ ] Mejorar diseño de tarjetas del dashboard
- [ ] Implementar gráficos visuales atractivos
- [ ] Mejorar diseño de tablas (striped, hover effects)
- [ ] Diseñar modales más atractivos y claros
- [ ] Agregar iconos a botones de acción
- [ ] **TEST:** Probar usabilidad con la modista
- [ ] **TEST:** Verificar que todo es intuitivo

### 8.4 Mejoras Responsive
- [ ] Optimizar layout para tablets
- [ ] Mejorar menú de navegación móvil
- [ ] Ajustar tamaños de fuente para diferentes pantallas
- [ ] Mejorar usabilidad de formularios en móviles
- [ ] Optimizar tablas para pantallas pequeñas
- [ ] **TEST:** Probar en tablet (iPad o similar)
- [ ] **TEST:** Probar en móvil pequeño (iPhone SE o similar)
- [ ] **TEST:** Probar en móvil grande (iPhone Pro Max o similar)
- [ ] **TEST:** Probar en desktop con diferentes resoluciones

### 8.5 Pulimiento Final
- [ ] Agregar loading states con skeletons
- [ ] Implementar toasts/notificaciones elegantes
- [ ] Agregar empty states con ilustraciones
- [ ] Implementar tooltips explicativos
- [ ] Agregar favicon y splash screens
- [ ] Verificar accesibilidad básica (contraste, tamaños)
- [ ] Realizar ajustes finales de estilo según feedback
- [ ] **TEST:** Ejecutar Lighthouse y verificar scores altos en todas las categorías
- [ ] **TEST:** Probar con lector de pantalla básico
- [ ] **TEST:** Verificar que todos los loading states funcionan
- [ ] **TEST:** Hacer recorrido completo y verificar que todo se ve profesional

---

## 🎯 Notas Importantes

- **MARCA CADA TAREA** cuando la completes usando `[x]` en lugar de `[ ]`
- **IDIOMA OBLIGATORIO**: Todo el código (nombre de carpetas y archivos, variables, métodos, comentarios) debe estar en **ESPAÑOL**.
- Las fases 1-3 son **CRÍTICAS** y deben completarse antes de avanzar
- La fase 4 es importante para la experiencia móvil
- La fase 5 asegura la calidad del producto
- Las fases 6-7 llevan el producto a los usuarios
- La fase 8 es la última, enfocada en que todo se vea profesional y pulido
- **No omitas los TESTS** - son fundamentales para asegurar que todo funcione correctamente
- Los tests marcados con **TEST:** son verificaciones prácticas que debes realizar
- Si un test falla, regresa y corrige antes de continuar

## ⏱️ Estimación de Tiempos

- Fase 1: 3-5 días
- Fase 2: 7-10 días
- Fase 3: 10-14 días
- Fase 4: 3-5 días
- Fase 5: 5-7 días
- Fase 6: 3-5 días
- Fase 7: 2-3 días
- Fase 8: 5-7 días

**Total estimado: 6-8 semanas**
