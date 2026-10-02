const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const ts = require('typescript');
const {FormBuilder} = require('@angular/forms');
const {Subject} = require('rxjs');
const source = fs.readFileSync('src/app/login/login.component.ts', 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, experimentalDecorators: true}}).outputText;
const exported = {};
vm.runInNewContext(compiled, {exports: exported, require: name => name === 'angularfire2/auth' ? {AngularFireAuth: class {}} : require(name)});
const Login = exported.LoginComponent;
async function run() {
  const state = new Subject();
  const calls = [];
  const auth = {
    setPersistence: async value => { calls.push(['persistence', value]); },
    signInWithEmailAndPassword: async (email, password) => { calls.push(['login', email, password]); state.next({email}); },
    sendPasswordResetEmail: async email => { calls.push(['reset', email]); },
    signOut: async () => { calls.push(['logout']); state.next(null); }
  };
  const login = new Login(new FormBuilder(), {auth, authState: state}, 'browser');
  login.ngOnInit();
  await login.ingresar();
  assert.strictEqual(calls.length, 0, 'No autenticar mientras se revisa la sesion');
  state.next(null);
  await login.ingresar();
  assert.strictEqual(calls.length, 0, 'Formulario vacio no debe invocar Firebase');
  login.formulario.patchValue({correo: 'incorrecto', password: 'prueba'});
  await login.ingresar();
  await login.recuperar();
  assert.strictEqual(calls.length, 0, 'Correo invalido no debe enviar solicitudes');
  login.formulario.patchValue({correo: ' prueba@example.com ', password: 'prueba', recordar: false});
  await login.ingresar();
  assert.strictEqual(calls[0][1], 'session');
  assert.strictEqual(calls[1][1], 'prueba@example.com');
  assert.strictEqual(login.sesionActiva, true);
  assert.strictEqual(login.formulario.value.password, '');
  await login.salir();
  assert.strictEqual(login.sesionActiva, false);
  assert.strictEqual(login.formulario.value.correo, '');
  login.formulario.patchValue({correo: 'prueba@example.com', password: 'prueba', recordar: true});
  auth.signInWithEmailAndPassword = async () => { throw {code: 'auth/wrong-password'}; };
  await login.ingresar();
  assert.strictEqual(calls[calls.length - 1][1], 'local');
  assert.ok(login.error.includes('Revisa tu correo'));
  assert.strictEqual(login.procesando, false);
  await login.recuperar();
  const resetMessage = login.mensaje;
  auth.sendPasswordResetEmail = async () => { throw {code: 'auth/user-not-found'}; };
  await login.recuperar();
  assert.strictEqual(login.mensaje, resetMessage, 'No revelar si la cuenta existe');
  const before = calls.length;
  login.procesando = true;
  await login.ingresar();
  await login.recuperar();
  assert.strictEqual(calls.length, before, 'Evitar solicitudes duplicadas');
  login.procesando = false;
  login.formulario.reset({correo: '', password: '', recordar: false});
  let popupCount = 0;
  auth.signInWithPopup = async provider => {
    assert.strictEqual(provider.providerId, 'google.com');
    popupCount++;
    state.next({email: 'google@example.com'});
  };
  await login.ingresarConGoogle();
  assert.strictEqual(popupCount, 1, 'Google debe funcionar con los campos de correo y password vacios');
  assert.strictEqual(login.sesionActiva, true);
  assert.strictEqual(login.correoUsuario, 'google@example.com');
  assert.strictEqual(login.procesando, false);
  auth.signInWithPopup = async () => { throw {code: 'auth/popup-blocked'}; };
  await login.ingresarConGoogle();
  assert.ok(login.error.includes('ventanas emergentes'));
  assert.strictEqual(login.procesando, false);
  auth.signInWithPopup = async () => { throw {code: 'auth/unauthorized-domain'}; };
  await login.ingresarConGoogle();
  assert.ok(login.error.includes('Dominios autorizados'));
  login.procesando = true;
  await login.ingresarConGoogle();
  assert.strictEqual(popupCount, 1);
  login.ngOnDestroy();
  assert.strictEqual(state.observers.length, 0);
  const server = new Login(new FormBuilder(), {auth, authState: state}, 'server');
  server.ngOnInit();
  await server.ingresar();
  await server.ingresarConGoogle();
  assert.strictEqual(state.observers.length, 0, 'SSR no debe suscribirse a autenticacion');
  console.log('OK: validaciones, persistencia, acceso, cierre, errores, recuperacion, duplicados y SSR. Firebase simulado; no se enviaron correos.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

