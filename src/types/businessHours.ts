
export type BusinessHour = {
  id: string;
  weekday: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
};

export type BusinessHourFormValues = {
  weekday: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
};

export const dayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
