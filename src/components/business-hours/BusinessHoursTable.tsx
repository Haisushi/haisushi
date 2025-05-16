
import { BusinessHour, dayNames } from '@/types/businessHours';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BusinessHoursTableProps {
  businessHours: BusinessHour[];
  onEdit: (hour: BusinessHour) => void;
  onToggleStatus: (hour: BusinessHour) => void;
}

const BusinessHoursTable = ({ 
  businessHours, 
  onEdit, 
  onToggleStatus 
}: BusinessHoursTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dia da Semana</TableHead>
          <TableHead>Horário de Abertura</TableHead>
          <TableHead>Horário de Fechamento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businessHours.map((hour) => (
          <TableRow key={hour.id}>
            <TableCell className="font-medium">
              {dayNames[hour.weekday]}
            </TableCell>
            <TableCell>{hour.open_time}</TableCell>
            <TableCell>{hour.close_time}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={hour.is_open}
                  onCheckedChange={() => onToggleStatus(hour)}
                />
                <span
                  className={`text-sm ${
                    hour.is_open ? 'text-green-600' : 'text-red-600'
                  }`}
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
