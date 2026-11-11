import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AngularFireAuth} from 'angularfire2/auth';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-home',
  template: `
    <main class="home-card">
      <p class="eyebrow">MI ESPACIO PERSONAL</p>
      <h1>What to do</h1>
      <p *ngIf="nombre">Hola, <strong>{{ nombre }}</strong>. Organiza aquí tus pendientes.</p>
      <a *ngIf="nombre" class="btn blue light-text" routerLink="/listas"><i class="fa fa-list"></i> Mis Listas</a>
      <login *ngIf="!nombre"></login>
      <p *ngIf="!nombre"><a routerLink="/registro">Crear cuenta</a></p>
    </main>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  nombre = '';
  private suscripcion: Subscription;
  private navegador: boolean;
  constructor(private afAuth: AngularFireAuth, @Inject(PLATFORM_ID) plataforma: Object) {
    this.navegador = isPlatformBrowser(plataforma);
  }
  ngOnInit(): void {
    if (!this.navegador) { return; }
    this.suscripcion = this.afAuth.authState.subscribe(user => {
      this.nombre = user ? (user.displayName || user.email || 'usuario') : '';
    }, () => this.nombre = '');
  }
  ngOnDestroy(): void { if (this.suscripcion) { this.suscripcion.unsubscribe(); } }
}