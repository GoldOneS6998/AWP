import {CodigoArchivoComponent} from './codigo-archivo/codigo-archivo.component';
import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {RegistroComponent} from './registro/registro.component';
import {InformacionPaginaComponent} from './informacion-pagina/informacion-pagina.component';

export const routers: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'},
  { path: 'login', component: LoginComponent},
  { path: 'registro', component: RegistroComponent},
  { path: 'informacion_pagina/archivo/:id', component: CodigoArchivoComponent},
  { path: 'informacion_pagina', component: InformacionPaginaComponent},
  { path: 'lazy', loadChildren: './lazy/lazy.module#LazyModule'},
  { path: 'lazy/nested', loadChildren: './lazy/lazy.module#LazyModule'}
];





