
import BusinessHoursTable from '@/components/business-hours/BusinessHoursTable';
import BusinessHourForm from '@/components/business-hours/BusinessHourForm';
import VacationSettings from '@/components/admin/VacationSettings';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

const BusinessHours = () => {
  const { businessHours, loading, toggleOpenStatus, fetchBusinessHours } = useBusinessHours();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Horários de Funcionamento</h1>
      <button className="bg-restaurant-primary text-white px-4 py-2 rounded" onClick={() => setDialogOpen(true)}>
        Adicionar Horário
      </button>
      <BusinessHoursTable 
        businessHours={businessHours || []} 
        onEdit={() => {}} 
        onToggleStatus={toggleOpenStatus} 
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <BusinessHourForm 
            currentHour={null} 
            onSubmitSuccess={() => { 
              setDialogOpen(false); 
              fetchBusinessHours(); 
            }} 
          />
        </DialogContent>
      </Dialog>
      {/* Vacation Settings */}
      <div className="mt-10">
        <VacationSettings />
      </div>
    </div>
  );
};

export default BusinessHours;
