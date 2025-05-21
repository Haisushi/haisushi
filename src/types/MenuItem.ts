export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean | null;
  embedding?: any;
  category_name?: string | null;
  display_order?: number;
};

export type MenuItemFormValues = {
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  category_name: string | null;
  display_order: number;
};

// Keep the MenuCategory type for backward compatibility with any code that might still use it
export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
};
