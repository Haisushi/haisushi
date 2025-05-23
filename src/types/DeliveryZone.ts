export type DeliveryZone = {
  id: string;
  min_distance: number;
  max_distance: number;
  delivery_fee: number;
};

export type DeliveryZoneFormValues = {
  min_distance: number;
  max_distance: number;
  delivery_fee: number;
};