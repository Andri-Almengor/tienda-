// src/features/news/newsApi.ts
import { api } from "@/lib/api/client";

export type Noticia = {
  id: number;
  titulo: string;
  contenido?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  creadoEn: string;
  actualizadoEn: string;
};

// Obtener todas las noticias (uso público y admin)
export async function getNoticias(): Promise<Noticia[]> {
  const { data } = await api.get<Noticia[]>("/noticias");
  return data;
}

// Crear noticia (solo admin, requiere token configurado en api client)
export async function crearNoticia(input: {
  titulo: string;
  contenido?: string;
  imageUrl?: string;
  fileUrl?: string;
}): Promise<Noticia> {
  const { data } = await api.post<Noticia>("/admin/noticias", input);
  return data;
}

// Actualizar noticia
export async function actualizarNoticia(
  id: number,
  input: {
    titulo: string;
    contenido?: string;
    imageUrl?: string;
    fileUrl?: string;
  }
): Promise<Noticia> {
  const { data } = await api.put<Noticia>(`/admin/noticias/${id}`, input);
  return data;
}

// Eliminar noticia
export async function eliminarNoticia(id: number): Promise<void> {
  await api.delete(`/admin/noticias/${id}`);
}
