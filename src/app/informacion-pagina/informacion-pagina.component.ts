import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ArchivoProyecto, IndiceProyecto} from '../codigo-archivo/archivo-proyecto';

@Component({
  selector: 'app-informacion-pagina',
  templateUrl: './informacion-pagina.component.html',
  styleUrls: ['./informacion-pagina.component.css']
})
export class InformacionPaginaComponent implements OnInit {
  grupos: {carpeta: string; archivos: ArchivoProyecto[]}[] = [];
  actualizado = '';
  cargando = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<IndiceProyecto>('/assets/project-code/index.json').subscribe(indice => {
      this.actualizado = indice.updatedAt;
      indice.files.forEach(archivo => {
        let grupo = this.grupos.find(item => item.carpeta === archivo.folder);
        if (!grupo) {
          grupo = {carpeta: archivo.folder, archivos: []};
          this.grupos.push(grupo);
        }
        grupo.archivos.push(archivo);
      });
      this.cargando = false;
    }, () => {
      this.error = 'No se pudo cargar la estructura. Actualiza la página para intentar de nuevo.';
      this.cargando = false;
    });
  }
}
