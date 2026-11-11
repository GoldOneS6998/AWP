import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestore} from 'angularfire2/firestore';
import {Subscription, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {firestore} from 'firebase/app';
import 'firebase/firestore';
@Component({selector:'app-listas',templateUrl:'./listas.component.html'})
export class ListasComponent implements OnInit,OnDestroy {
 formulario:FormGroup; tareaForm:FormGroup; listas:any[]=[]; tareas:any[]=[];
 uid=''; listaId=''; listaActiva:any=null; cargando=true; guardando=false; error=''; mensaje=''; mostrarFormularioTarea=true; elementoDeslizando='';
 private inicioDeslizamientoX=0; private inicioDeslizamientoY=0;
 private suscripcion:Subscription; private tareasSub:Subscription;
 constructor(private fb:FormBuilder,private afAuth:AngularFireAuth,private db:AngularFirestore,private route:ActivatedRoute,private router:Router) {
  this.formulario=fb.group({nombre:['',[Validators.required,Validators.maxLength(100)]]});
  this.tareaForm=fb.group({descripcion:['',[Validators.required,Validators.maxLength(300)]],pendientes:['',[Validators.maxLength(1000)]]});
 }
 ngOnInit():void {
  this.listaId=this.route.snapshot.paramMap.get('id')||'';
  this.suscripcion=this.afAuth.authState.pipe(tap(user=>{
   this.uid=user?user.uid:''; this.listas=[]; this.tareas=[]; this.listaActiva=null;
   this.error=''; this.mensaje=''; this.cargando=!!user;
   if(this.tareasSub){this.tareasSub.unsubscribe();this.tareasSub=null;}
  }),switchMap(user=>user?this.db.collection<any>('usuarios/'+user.uid+'/listas').valueChanges({idField:'id'}).pipe(catchError(()=>{this.error='No se pudieron leer tus listas. Revisa las reglas de Firestore.';return of([]);})):of([])))
  .subscribe(items=>{this.listas=items;this.cargando=false;
   if(this.listaId){this.listaActiva=this.listas.find(item=>item.id===this.listaId)||null;
    if(!this.listaActiva&&!this.error){this.error='No encontramos esa lista.';}
    if(this.listaActiva&&!this.tareasSub){this.escucharTareas();}
   }
  },()=>{this.uid='';this.cargando=false;this.error='No se pudo comprobar tu sesión.';});
 }
 private escucharTareas():void {
  const uid=this.uid,id=this.listaId;
  this.tareasSub=this.db.collection('usuarios/'+uid+'/listas/'+id+'/tareas',ref=>ref.orderBy('creadoEn','asc'))
   .valueChanges({idField:'id'}).pipe(catchError(()=>{this.error='No se pudieron consultar las tareas. Revisa Firestore.';return of([]);}))
   .subscribe(items=>this.tareas=items,()=>this.error='No se pudieron cargar las tareas.');
 }
 async crear():Promise<void>{
  const nombre=(this.formulario.value.nombre||'').trim();this.formulario.get('nombre').setValue(nombre);this.formulario.get('nombre').markAsTouched();
  if(!this.uid||this.formulario.invalid||this.guardando)return;
  this.guardando=true;this.error='';
  try{await this.db.collection('usuarios/'+this.uid+'/listas').add({nombre,creadoEn:firestore.FieldValue.serverTimestamp()});this.formulario.reset({nombre:''});this.mensaje='Lista guardada en Firebase.';}
  catch(e){this.error='No se pudo guardar la lista. Revisa permisos de Firestore.';}finally{this.guardando=false;}
 }
 abrir(lista:any):void{this.router.navigate(['/listas',lista.id]);}
 manejarDeslizamientoInicio(evento:TouchEvent,tipo:'lista'|'tarea',id:string):void {
  const toque=evento.changedTouches[0]; this.inicioDeslizamientoX=toque.clientX; this.inicioDeslizamientoY=toque.clientY;
  this.elementoDeslizando=tipo+':'+id;
 }
 cancelarDeslizamiento():void { this.elementoDeslizando=''; }
 async manejarDeslizamientoFin(evento:TouchEvent,tipo:'lista'|'tarea',id:string):Promise<void> {
  const toque=evento.changedTouches[0],desplazamientoX=toque.clientX-this.inicioDeslizamientoX,desplazamientoY=toque.clientY-this.inicioDeslizamientoY;
  this.elementoDeslizando='';
  if(desplazamientoX < -90 && Math.abs(desplazamientoY)<70){
   if(tipo==='lista') await this.eliminarLista(id); else await this.eliminarTarea(id);
  }
 }
 async eliminarLista(id:string):Promise<void> {
  if(!this.uid||this.guardando)return;
  this.guardando=true;this.error='';
  try {
   const listaRef=this.db.doc('usuarios/'+this.uid+'/listas/'+id).ref;
   const tareas=await listaRef.collection('tareas').get();
   for(let i=0;i<tareas.docs.length;i+=499){
    const batch=this.db.firestore.batch();
    tareas.docs.slice(i,i+499).forEach(doc=>batch.delete(doc.ref));
    if(i+499>=tareas.docs.length)batch.delete(listaRef);
    await batch.commit();
   }
   if(tareas.docs.length===0)await listaRef.delete();
   this.mensaje='Lista eliminada.';
  } catch(e){this.error='No se pudo eliminar la lista. Revisa permisos de Firestore.';}
  finally{this.guardando=false;}
 }
 async eliminarTarea(id:string):Promise<void> {
  if(!this.uid||!this.listaId||this.guardando)return;
  this.guardando=true;this.error='';
  try{await this.db.doc('usuarios/'+this.uid+'/listas/'+this.listaId+'/tareas/'+id).delete();this.mensaje='Tarea eliminada.';}
  catch(e){this.error='No se pudo eliminar la tarea. Revisa permisos de Firestore.';}
  finally{this.guardando=false;}
 }
 async crearTarea():Promise<void>{
  const descripcion=(this.tareaForm.value.descripcion||'').trim(),pendientes=(this.tareaForm.value.pendientes||'').trim();
  this.tareaForm.get('descripcion').setValue(descripcion);this.tareaForm.get('descripcion').markAsTouched();
  if(!this.uid||!this.listaId||this.tareaForm.invalid||this.guardando)return;
  this.guardando=true;this.error='';
  try{await this.db.collection('usuarios/'+this.uid+'/listas/'+this.listaId+'/tareas').add({descripcion,pendientes,creadoEn:firestore.FieldValue.serverTimestamp()});this.tareaForm.reset({descripcion:'',pendientes:''});this.mensaje='Tarea guardada en Firebase.';}
  catch(e){this.error='No se pudo guardar la tarea. Revisa permisos de Firestore.';}finally{this.guardando=false;}
 }
 ngOnDestroy():void{if(this.suscripcion)this.suscripcion.unsubscribe();if(this.tareasSub)this.tareasSub.unsubscribe();}
}
