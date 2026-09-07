/** Categoria personalizada criada pelo usuário (ex: "Trabalho", "Receitas", "Viagens"...). */
export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export type CategoryFormValues = Pick<Category, "name">;

export interface RenameCategoryValues {
  id: string;
  name: string;
}

/** Valor especial usado nos filtros para representar "mostrar todas as categorias". */
export type CategoriaFiltro = "Todas" | string;
