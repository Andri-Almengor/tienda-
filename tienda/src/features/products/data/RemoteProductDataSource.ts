// src/features/products/data/RemoteProductDataSource.ts
import { api } from "../../../lib/api/client";
import { Product } from "../api/types";

type BackendProducto = {
  id: number;
  categoria: string;
  marca: string;
  detalle?: string | null;
  imgProd?: string | null;
  sello?: string | null;
  certifica?: string | null;
  pol?: string | null;
  logoSello?: string | null;
  gf?: string | null;
  logoGf?: string | null;
  tienda?: string | null;
  pesaj?: string | null;
};

type PagedBackendResponse = {
  items: BackendProducto[];
  total: number;
  page: number;
  pageSize: number;
};

function mapProducto(p: BackendProducto): Product {
  return {
    id: String(p.id),
    categoria: p.categoria,
    marca: p.marca,
    detalle: p.detalle ?? "",
    imgProd: p.imgProd ?? null,
    sello: p.sello ?? null,
    certifica: p.certifica ?? null,
    pol: p.pol ?? null,
    logoSello: p.logoSello ?? null,
    gf: p.gf ?? null,
    logoGf: p.logoGf ?? null,
    tienda: p.tienda ?? null,
    pesaj: p.pesaj ?? null,
  };
}

export const RemoteProductDataSource = {
  async list(): Promise<Product[]> {
    const { data } = await api.get<BackendProducto[]>("/productos");
    return data.map(mapProducto);
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<BackendProducto>(`/productos/${id}`);
    return mapProducto(data);
  },

  async listPaged(page = 1, pageSize = 50): Promise<{
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { data } = await api.get<PagedBackendResponse>("/productos/paged", {
      params: { page, pageSize },
    });

    return {
      items: data.items.map(mapProducto),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
    };
  },
};
