import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';
import { Product, ProductType, ToleranceSpec } from '../types/product-library';

interface ProductLibraryState {
  products: Product[];
  
  // CRUD Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductByType: (type: ProductType) => Product | undefined;
  
  // Tolerance Operations
  addTolerance: (productId: string, tolerance: ToleranceSpec) => void;
  updateTolerance: (productId: string, toleranceIndex: number, tolerance: ToleranceSpec) => void;
  deleteTolerance: (productId: string, toleranceIndex: number) => void;
  
  // Queries
  getActiveProducts: () => Product[];
  getAllProductTypes: () => ProductType[];
  
  // Utility
  clearAllProducts: () => void;
  initializeDefaultProducts: () => void;
}

export const useProductLibraryStore = create<ProductLibraryState>()(
  persist(
    (set, get) => ({
      products: [],
      
      // CRUD Operations
      addProduct: (product) => {
        const id = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newProduct: Product = {
          ...product,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          products: [...state.products, newProduct],
        }));
        
        return id;
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: Date.now() }
              : product
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },
      
      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },
      
      getProductByType: (type) => {
        return get().products.find((product) => product.name === type);
      },
      
      // Tolerance Operations
      addTolerance: (productId, tolerance) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  tolerances: [...product.tolerances, tolerance],
                  updatedAt: Date.now(),
                }
              : product
          ),
        }));
      },
      
      updateTolerance: (productId, toleranceIndex, tolerance) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  tolerances: product.tolerances.map((t, i) =>
                    i === toleranceIndex ? tolerance : t
                  ),
                  updatedAt: Date.now(),
                }
              : product
          ),
        }));
      },
      
      deleteTolerance: (productId, toleranceIndex) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  tolerances: product.tolerances.filter((_, i) => i !== toleranceIndex),
                  updatedAt: Date.now(),
                }
              : product
          ),
        }));
      },
      
      // Queries
      getActiveProducts: () => {
        return get().products.filter((product) => product.isActive);
      },
      
      getAllProductTypes: () => {
        return get().products.map((product) => product.name);
      },
      
      // Utility
      clearAllProducts: () => {
        set({ products: [] });
      },
      
      initializeDefaultProducts: () => {
        const state = get();
        
        if (state.products.length === 0) {
          const defaultProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
              name: 'Beams',
              description: 'Precast concrete beams for structural support',
              tolerances: [
                { dimension: 'Length', value: '±1/2 inch', notes: 'Overall length tolerance' },
                { dimension: 'Width', value: '±1/4 inch', notes: 'Cross-section width' },
                { dimension: 'Depth', value: '±1/4 inch', notes: 'Cross-section depth' },
                { dimension: 'Camber', value: '+1/2, -0', notes: 'Upward deflection' },
              ],
              isActive: true,
            },
            {
              name: 'Hollow Core Slabs',
              description: 'Prestressed hollow core concrete slabs',
              tolerances: [
                { dimension: 'Length', value: '±1/4 inch', notes: 'Overall length' },
                { dimension: 'Width', value: '±1/8 inch', notes: 'Standard width tolerance' },
                { dimension: 'Thickness', value: '±1/8 inch', notes: 'Slab thickness' },
                { dimension: 'Camber', value: '+1/4, -0', notes: 'Maximum upward bow' },
              ],
              isActive: true,
            },
            {
              name: 'Solid Slabs',
              description: 'Solid precast concrete slabs',
              tolerances: [
                { dimension: 'Length', value: '±1/4 inch', notes: 'Overall length' },
                { dimension: 'Width', value: '±1/8 inch', notes: 'Overall width' },
                { dimension: 'Thickness', value: '±1/8 inch', notes: 'Slab thickness' },
              ],
              isActive: true,
            },
            {
              name: 'Stadia',
              description: 'Stadium riser slabs and components',
              tolerances: [
                { dimension: 'Length', value: '±3/8 inch', notes: 'Overall length' },
                { dimension: 'Width', value: '±1/4 inch', notes: 'Overall width' },
                { dimension: 'Riser Height', value: '±1/8 inch', notes: 'Step height tolerance' },
                { dimension: 'Tread Depth', value: '±1/4 inch', notes: 'Step depth tolerance' },
              ],
              isActive: true,
            },
            {
              name: 'Columns',
              description: 'Precast concrete columns',
              tolerances: [
                { dimension: 'Length', value: '±1/2 inch', notes: 'Overall height/length' },
                { dimension: 'Cross Section', value: '±1/4 inch', notes: 'Width and depth' },
                { dimension: 'Plumbness', value: '±1/4 inch per 10 ft', notes: 'Vertical alignment' },
              ],
              isActive: true,
            },
            {
              name: 'Wall Panels',
              description: 'Architectural and structural wall panels',
              tolerances: [
                { dimension: 'Length', value: '±1/4 inch', notes: 'Panel length' },
                { dimension: 'Height', value: '±1/4 inch', notes: 'Panel height' },
                { dimension: 'Thickness', value: '±1/8 inch', notes: 'Panel thickness' },
                { dimension: 'Squareness', value: '±1/8 inch', notes: 'Diagonal measurement difference' },
              ],
              isActive: true,
            },
            {
              name: 'Stairs',
              description: 'Precast concrete stair units',
              tolerances: [
                { dimension: 'Length', value: '±1/2 inch', notes: 'Overall run length' },
                { dimension: 'Width', value: '±1/4 inch', notes: 'Stair width' },
                { dimension: 'Riser Height', value: '±1/8 inch', notes: 'Individual step height' },
                { dimension: 'Tread Depth', value: '±1/8 inch', notes: 'Individual step depth' },
              ],
              isActive: true,
            },
          ];
          
          defaultProducts.forEach((product) => {
            state.addProduct(product);
          });
        }
      },
    }),
    {
      name: 'product-library-storage',
      storage: persistStorage,
    }
  )
);
