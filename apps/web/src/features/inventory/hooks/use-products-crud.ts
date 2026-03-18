'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { orgPath, toQueryParams, type PaginatedResponse } from '@/shared/lib/query-helpers';
import { productKeys, type ProductListParams } from '@/features/shared/hooks/use-products';

export interface ProductDetailDto {
  id: string;
  code: string;
  name: string;
  barcode: string | null;
  countingUnit: string;
  majorUnit: string | null;
  minorUnit: string | null;
  quantityInMajorUnit: number | null;
  salePrice1: string;
  salePrice2: string;
  salePrice3: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductWarehouseStockDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  purchasePrice: string;
  totalPrice: string;
}

export interface CreateProductPayload {
  code: string;
  name: string;
  barcode?: string;
  countingUnit: string;
  majorUnit?: string;
  minorUnit?: string;
  quantityInMajorUnit?: number;
  salePrice1?: string;
  salePrice2?: string;
  salePrice3?: string;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface SaveProductStocksPayload {
  stocks: {
    warehouseId: string;
    quantity: number;
    purchasePrice: string;
  }[];
}

export const productCrudKeys = {
  ...productKeys,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  stocks: (productId: string) => [...productKeys.all, 'stocks', productId] as const,
};

/** Fetch paginated product list (re-uses shared product keys). */
export function useProductsList(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productCrudKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductDetailDto>>(
        orgPath('/products'),
        toQueryParams(params),
      ),
  });
}

/** Fetch a single product by ID. */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productCrudKeys.detail(id),
    queryFn: () =>
      apiClient.get<ProductDetailDto>(orgPath(`/products/${id}`)),
    enabled: !!id,
  });
}

/** Create a new product. */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductPayload) =>
      apiClient.post<ProductDetailDto>(orgPath('/products'), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/** Update an existing product. */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      apiClient.patch<ProductDetailDto>(orgPath(`/products/${id}`), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productCrudKeys.detail(variables.id) });
    },
  });
}

/** Delete a product. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(orgPath(`/products/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/** Fetch warehouse stocks for a product (opening stock). */
export function useProductStocks(productId: string) {
  return useQuery({
    queryKey: productCrudKeys.stocks(productId),
    queryFn: () =>
      apiClient.get<ProductWarehouseStockDto[]>(orgPath(`/products/${productId}/stocks`)),
    enabled: !!productId,
  });
}

/** Save opening stock for a product across warehouses. */
export function useSaveProductStocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: SaveProductStocksPayload }) =>
      apiClient.put<ProductWarehouseStockDto[]>(orgPath(`/products/${productId}/stocks`), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productCrudKeys.stocks(variables.productId) });
    },
  });
}
