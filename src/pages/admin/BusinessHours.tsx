
import BusinessHoursTable from '@/components/business-hours/BusinessHoursTable';
import BusinessHourForm from '@/components/business-hours/BusinessHourForm';
import VacationSettings from '@/components/admin/VacationSettings';

const BusinessHours = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Horários de Funcionamento</h1>
      
      {/* Business Hours Management */}
      <BusinessHoursTable />
      <BusinessHourForm />
      
      {/* Vacation Settings */}
      <div className="mt-10">
        <VacationSettings />
      </div>
    </div>
  );
};

export default BusinessHours;
