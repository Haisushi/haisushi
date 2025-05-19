
import { BusinessHour, dayNames } from '@/types/businessHours';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type BusinessHoursTableProps = {
  businessHours: BusinessHour[];
  onEdit: (hour: BusinessHour) => void;
  onToggleStatus: (hour: BusinessHour) => void;
};

const BusinessHoursTable = ({ businessHours, onEdit, onToggleStatus }: BusinessHoursTableProps) => {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    
    try {
      // Convert "HH:MM:SS" to "HH:MM"
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dia</TableHead>
          <TableHead>Horário de Abertura</TableHead>
          <TableHead>Horário de Fechamento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businessHours.map((hour) => (
          <TableRow key={hour.id}>
            <TableCell className="font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-restaurant-primary" />
              {dayNames[hour.weekday]}
            </TableCell>
            <TableCell>{formatTime(hour.open_time)}</TableCell>
            <TableCell>{formatTime(hour.close_time)}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={hour.is_open}
                  onCheckedChange={() => onToggleStatus(hour)}
                />
                <span
                  className={
                    hour.is_open
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {hour.is_open ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(hour)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BusinessHoursTable;
