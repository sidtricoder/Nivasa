import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppointmentSchedulerProps {
  onSchedule: (date: Date, time: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ onSchedule }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handleSchedule = () => {
    if (date && time) {
      onSchedule(date, time);
      setIsOpen(false);
      setDate(undefined);
      setTime(undefined);
    }
  };

  // Generate time slots (9 AM to 8 PM)
  const timeSlots = [];
  for (let i = 9; i <= 20; i++) {
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${hour}:00 ${ampm}`);
    timeSlots.push(`${hour}:30 ${ampm}`);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium leading-none mb-2">Schedule Viewing</h4>
          <div className="space-y-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Select onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[200px]">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSchedule}
            disabled={!date || !time}
          >
            Request Appointment
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
