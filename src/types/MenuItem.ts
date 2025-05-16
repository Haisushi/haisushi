
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  embedding?: any;
};

export type MenuItemFormValues = {
  name: string;
  description: string;
  price: number;
  is_available: boolean;
};
