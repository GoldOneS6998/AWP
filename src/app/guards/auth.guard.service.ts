import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError, map, take, tap} from 'rxjs/operators';
import {AngularFireAuth} from 'angularfire2/auth';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Firebase comprueba la sesión en el navegador, no durante el renderizado del servidor.
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    return this.afAuth.authState.pipe(
      take(1),
      map(user => !!user),
      catchError(() => of(false)),
      tap((authenticated: boolean) => {
        if (!authenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}