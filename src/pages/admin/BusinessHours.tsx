
import { useState } from 'react';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { BusinessHour } from '@/types/businessHours';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import BusinessHourForm from '@/components/business-hours/BusinessHourForm';
import BusinessHoursTable from '@/components/business-hours/BusinessHoursTable';

const BusinessHours = () => {
  const { businessHours, loading, fetchBusinessHours, toggleOpenStatus } = useBusinessHours();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHour, setCurrentHour] = useState<BusinessHour | null>(null);

  const openEditDialog = (hour: BusinessHour) => {
    setCurrentHour(hour);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentHour(null);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchBusinessHours();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Horários de Funcionamento</h1>
        <Button onClick={openCreateDialog} className="bg-restaurant-primary hover:bg-restaurant-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Horário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horários por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-restaurant-primary"></div>
            </div>
          ) : businessHours.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Nenhum horário definido</p>
              <Button onClick={openCreateDialog} className="mt-4">
                Adicionar Primeiro Horário
              </Button>
            </div>
          ) : (
            <BusinessHoursTable 
              businessHours={businessHours}
              onEdit={openEditDialog}
              onToggleStatus={toggleOpenStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Business Hours Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <BusinessHourForm 
            currentHour={currentHour} 
            onSubmitSuccess={handleFormSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessHours;
