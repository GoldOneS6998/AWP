# Entorno para la clase

Versiones instaladas:
- Node.js 16.20.2 y npm 8.19.4 (npm16.cmd los selecciona para este proyecto).
- Angular y Angular CLI 7.1.4, incluidos en el ZIP original.
- AngularFire2 5.4.2, que conserva las importaciones desde angularfire2 y utiliza @angular/fire 5.4.2.
- Firebase 7.24.0.
- @angular/service-worker 7.1.4.

## Comandos en PowerShell

Ejecutar desde esta carpeta:

```powershell
.\npm16.cmd start
```

Abrir http://localhost:4200 y detener con Ctrl+C.

```powershell
.\npm16.cmd run build -- --prod
.\npm16.cmd run build:ssr
.\npm16.cmd run serve:ssr
```

El servidor SSR utiliza http://localhost:4000.

Para reinstalar exactamente las dependencias del package-lock.json:

```powershell
.\npm16.cmd ci
```

## Ajustes respecto a las fotos

Firebase 5.9.4 fallo al instalar grpc 1.19.0 en Node.js 16. Firebase 7.24.0 evita esa dependencia nativa. AngularFire2 5.0.0-rc.10 presento un error de tipos con Firebase 7; la revision 5.4.2 admite Angular 7 y Firebase 7.

.npmrc activa legacy-peer-deps para las dependencias antiguas del starter y omite paquetes opcionales, incluido node-sass 4.10.0. El proyecto actual utiliza CSS. Si la clase incorpora Sass, habra que ajustar su compilador.

Se comprobaron los tipos de AngularFire (Auth, Database y Firestore), la carga de los modulos de Firebase con Node 16, la compilacion de produccion y SSR, y una respuesta HTTP 200 con HTML renderizado.

## Configuracion pendiente de la aplicacion

Firebase esta configurado en environment.ts y environment.prod.ts con los datos del proyecto aplicacioneswebprogresiv-ec189. AppModule registra AngularFireModule.initializeApp(environment.firebase). Aun falta proporcionar databaseURL para Realtime Database; no se ha comprobado una conexion a los servicios de Firebase.

El paquete de service worker esta instalado. Para convertir la aplicacion en una PWA instalable todavia faltan el manifiesto, iconos, configuracion de cache y registro del service worker.

La auditoria de npm reporto 140 vulnerabilidades (26 criticas) en las dependencias antiguas. Este entorno reproduce el starter de clase; requiere una actualizacion antes de publicarlo en produccion. No ejecutar npm audit fix --force sin revisar los cambios de versiones.


## Login (2 de octubre de 2026)

El componente Login usa AngularFireAuth y formularios reactivos. Incluye correo y contraseña, validaciones, mostrar contraseña, persistencia opcional, recuperación por correo y cierre de sesión. La ruta /login y Home reutilizan el mismo componente.

Para usar cuentas reales, habilita el proveedor Correo/contraseña en Authentication de tu proyecto Firebase. Debe existir una cuenta de prueba; Registro todavía no crea usuarios. No se han enviado correos ni probado credenciales reales durante la implementación. La contraseña no se guarda manualmente: la sesión la administra Firebase.

### Acceso con Google

El botón Continuar con Google abre el selector de cuentas de Google usando Firebase. No necesita llenar el correo ni la contraseña del formulario. Respeta la opción Mantener mi sesión.
En Firebase Authentication debe estar habilitado Google y el dominio desde el que se abre la página debe figurar en Configuración > Dominios autorizados. Revisa localhost para desarrollo y el dominio exacto del túnel si lo utilizas. Permite ventanas emergentes cuando el navegador lo solicite. El acceso real se completa personalmente con la cuenta de Google del usuario.

## Estructura de clase (6 de octubre de 2026)

- src/app/structures/app.module.ts: módulo principal.
- src/app/structures/app.server.module.ts: módulo del servidor.
- src/app/structures/routers.ts: rutas existentes.
- src/base/app.component.ts y app.component.html: componente raíz y navegación.
- src/base/colors.css y defaults.css: colores y presentación del componente raíz.
- src/app/guards/auth.guard.service.ts: AuthGuard preparado para comprobar la sesión.

El guard no está asignado a ninguna ruta todavía. Cuando se decida cuál debe ser privada,
se importa AuthGuard en routers.ts desde ../guards/auth.guard.service y se agrega
canActivate: [AuthGuard] a esa ruta. Login debe permanecer público.
En el servidor el guard deniega el acceso y en el navegador comprueba Firebase;
si no hay sesión o falla la consulta, navega a /login.
Font Awesome 4.7.0 se carga desde angular.json para el icono de Home.
## Mis Listas (20 de octubre de 2026)
El menú muestra Mis Listas y Salir al autenticarte; de lo contrario muestra Iniciar sesión.
La ruta /listas usa AuthGuard. Permite crear y consultar listas en Cloud Firestore:
usuarios/{uid}/listas/{id}. El nombre se valida y la fecha se genera en el servidor.
Para utilizarla, Cloud Firestore debe estar creado en el proyecto Firebase.
firestore.rules contiene reglas propuestas para que cada usuario acceda solo a sus listas.
Esas reglas NO se han publicado: deben integrarse con las reglas existentes en Firebase
antes de comprobar el acceso con una cuenta real. No usar reglas públicas.
Se conserva el login de Google y correo; la disponibilidad depende de los proveedores habilitados.
