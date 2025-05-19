
export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean | null;
  embedding?: any;
  category_id?: string | null;
  display_order?: number;
};

export type MenuItemFormValues = {
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  category_id: string | null;
  display_order: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
};
