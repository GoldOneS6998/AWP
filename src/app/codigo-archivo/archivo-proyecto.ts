export interface ArchivoProyecto {
  id: string;
  path: string;
  folder: string;
  name: string;
  viewName: string;
  viewable: boolean;
}

export interface IndiceProyecto {
  updatedAt: string;
  files: ArchivoProyecto[];
}
