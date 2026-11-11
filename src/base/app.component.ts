import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AngularFireAuth} from 'angularfire2/auth';
import {Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
@Component({selector: 'app-root', templateUrl: './app.component.html'})
export class AppComponent {
  usuario$: Observable<any>;
  cerrando = false;
  error = '';
  constructor(public afAuth: AngularFireAuth, private router: Router,
    @Inject(PLATFORM_ID) plataforma: Object) {
    this.usuario$ = isPlatformBrowser(plataforma)
      ? afAuth.authState.pipe(catchError(() => of(null))) : of(null);
  }
  async logout(): Promise<void> {
    if (this.cerrando) { return; }
    this.cerrando = true;
    this.error = '';
    try {
      await this.afAuth.auth.signOut();
      await this.router.navigate(['/login']);
    } catch (error) { this.error = 'No se pudo cerrar la sesión. Inténtalo de nuevo.'; }
    finally { this.cerrando = false; }
  }
}