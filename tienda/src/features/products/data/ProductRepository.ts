// src/features/products/data/ProductRepository.ts
import { Product } from "../api/types";
import { RemoteProductDataSource } from "./RemoteProductDataSource";

export const ProductRepository = {
  async list(): Promise<Product[]> {
    return RemoteProductDataSource.list();
  },

  async getById(id: string): Promise<Product | undefined> {
    // Si el id está vacío o es un id "local-..." que no existe en la BD,
    // no llamamos al backend y devolvemos undefined.
    if (!id) return undefined;
    if (id.startsWith("local-")) return undefined;

    // Solo llamamos al backend si el id es numérico
    if (!/^\d+$/.test(id)) return undefined;

    const product = await RemoteProductDataSource.getById(id);
    return product;
  },

  async listPaged(page = 1, pageSize = 50) {
    return RemoteProductDataSource.listPaged(page, pageSize);
  },
};
