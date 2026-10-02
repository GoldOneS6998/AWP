import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AngularFireAuth} from 'angularfire2/auth';
import {Subscription} from 'rxjs';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  formulario: FormGroup;
  mostrarPassword = false;
  enviado = false;
  procesando = false;
  revisandoSesion = true;
  sesionActiva = false;
  correoUsuario = '';
  error = '';
  mensaje = '';
  accion = '';
  private suscripcion: Subscription;
  private navegador: boolean;

  constructor(
    private fb: FormBuilder,
    private autenticacion: AngularFireAuth,
    @Inject(PLATFORM_ID) plataforma: Object
  ) {
    this.navegador = isPlatformBrowser(plataforma);
    this.formulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      recordar: [false]
    });
  }

  ngOnInit(): void {
    if (!this.navegador) { return; }
    this.suscripcion = this.autenticacion.authState.subscribe(usuario => {
      this.sesionActiva = !!usuario;
      this.correoUsuario = usuario ? usuario.email || 'Cuenta autenticada' : '';
      this.revisandoSesion = false;
    }, () => {
      this.revisandoSesion = false;
      this.error = 'No se pudo comprobar tu sesión. Recarga la página e inténtalo de nuevo.';
    });
  }

  campoInvalido(nombre: string): boolean {
    const campo = this.formulario.get(nombre);
    return campo.invalid && (campo.touched || this.enviado);
  }

  async ingresar(): Promise<void> {
    if (!this.navegador || this.procesando || this.revisandoSesion) { return; }
    this.enviado = true;
    this.error = '';
    this.mensaje = '';
    const correo = this.formulario.get('correo');
    correo.setValue((correo.value || '').trim());
    if (this.formulario.invalid) { return; }
    this.procesando = true;
    this.accion = 'ingresar';
    try {
      await this.autenticacion.auth.setPersistence(this.formulario.value.recordar ? 'local' : 'session');
      await this.autenticacion.auth.signInWithEmailAndPassword(correo.value, this.formulario.value.password);
      this.formulario.get('password').reset('');
      this.mostrarPassword = false;
      this.enviado = false;
      this.mensaje = 'Has iniciado sesión correctamente.';
    } catch (fallo) {
      this.error = this.describirError(fallo);
    } finally {
      this.procesando = false;
      this.accion = '';
    }
  }

  async recuperar(): Promise<void> {
    if (!this.navegador || this.procesando || this.revisandoSesion) { return; }
    this.error = '';
    this.mensaje = '';
    const correo = this.formulario.get('correo');
    correo.setValue((correo.value || '').trim());
    correo.markAsTouched();
    if (correo.invalid) {
      this.error = 'Escribe un correo válido para recuperar tu contraseña.';
      return;
    }
    this.procesando = true;
    this.accion = 'recuperar';
    try {
      await this.autenticacion.auth.sendPasswordResetEmail(correo.value);
      this.confirmarRecuperacion();
    } catch (fallo) {
      if (fallo && fallo.code === 'auth/user-not-found') {
        this.confirmarRecuperacion();
      } else {
        this.error = this.describirError(fallo);
      }
    } finally {
      this.procesando = false;
      this.accion = '';
    }
  }

  async salir(): Promise<void> {
    if (!this.navegador || this.procesando) { return; }
    this.procesando = true;
    this.accion = 'salir';
    this.error = '';
    this.mensaje = '';
    try {
      await this.autenticacion.auth.signOut();
      this.formulario.reset({correo: '', password: '', recordar: false});
      this.enviado = false;
      this.mostrarPassword = false;
      this.mensaje = 'Sesión cerrada.';
    } catch (fallo) {
      this.error = this.describirError(fallo);
    } finally {
      this.procesando = false;
      this.accion = '';
    }
  }

  private confirmarRecuperacion(): void {
    this.mensaje = 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña. Revisa también el correo no deseado.';
  }

  private describirError(fallo: {code?: string}): string {
    switch (fallo && fallo.code) {
      case 'auth/invalid-email': return 'El formato del correo no es válido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials': return 'No se pudo iniciar sesión. Revisa tu correo y contraseña.';
      case 'auth/user-disabled': return 'Esta cuenta está deshabilitada. Contacta al administrador.';
      case 'auth/too-many-requests': return 'Demasiados intentos. Espera un momento antes de volver a intentar.';
      case 'auth/network-request-failed': return 'No se pudo conectar. Revisa tu conexión a internet.';
      case 'auth/operation-not-allowed': return 'El acceso con correo y contraseña todavía no está habilitado en Firebase.';
      case 'auth/web-storage-unsupported': return 'El navegador no permite guardar la sesión. Revisa sus ajustes de almacenamiento.';
      default: return 'No se pudo completar la operación. Inténtalo de nuevo más tarde.';
    }
  }

  ngOnDestroy(): void {
    if (this.suscripcion) { this.suscripcion.unsubscribe(); }
  }
}
