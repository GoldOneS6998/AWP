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

