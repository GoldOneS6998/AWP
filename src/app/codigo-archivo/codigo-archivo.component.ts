import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subscription, of} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {ArchivoProyecto, IndiceProyecto} from './archivo-proyecto';

@Component({
  selector: 'app-codigo-archivo',
  templateUrl: './codigo-archivo.component.html',
  styleUrls: ['./codigo-archivo.component.css']
})
export class CodigoArchivoComponent implements OnInit, OnDestroy {
  archivo: ArchivoProyecto;
  codigo = '';
  cargando = true;
  error = '';
  actualizado = '';
  private lectura: Subscription;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.lectura = this.route.paramMap.pipe(switchMap(params => {
      this.cargando = true;
      this.error = '';
      this.codigo = '';
      this.archivo = null;
      return this.http.get<IndiceProyecto>('/assets/project-code/index.json').pipe(
        switchMap(indice => {
          this.actualizado = indice.updatedAt;
          this.archivo = indice.files.find(item => item.id === params.get('id') && item.viewable);
          if (!this.archivo) {
            this.error = 'No se encontró este archivo en la estructura del proyecto.';
            return of('');
          }
          return this.http.get('/assets/project-code/' + this.archivo.id + '.txt', {responseType: 'text'});
        }),
        catchError(() => {
          this.error = 'No se pudo cargar el código. Vuelve a la estructura e inténtalo de nuevo.';
          return of('');
        })
      );
    })).subscribe(codigo => {
      this.codigo = codigo;
      this.cargando = false;
    });
  }

  ngOnDestroy(): void {
    if (this.lectura) this.lectura.unsubscribe();
  }
}
