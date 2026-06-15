import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isBefore, startOfToday, addMonths, subMonths
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorSchedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(startOfToday()));
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  
  // Forms state
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('09:30');
  
  const doctorId = user?.doctor?.id;

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => (await api.get(`/doctors/${doctorId}`)).data.data,
    enabled: !!doctorId,
  });

  const addSlotMutation = useMutation({
    mutationFn: async (slots: { date: string, startTime: string, endTime: string }[]) => {
      return api.post(`/doctors/${doctorId}/slots`, { slots });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      toast.success('Time slots added successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add time slots');
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      return api.delete(`/doctors/${doctorId}/slots/${slotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      toast.success('Time slot removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove time slot');
    }
  });

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const slotsForSelectedDate = useMemo(() => {
    if (!doctor?.timeSlots) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return doctor.timeSlots.filter((slot: any) => slot.date === dateStr);
  }, [doctor, selectedDate]);

  const handleAddSingleSlot = () => {
    if (newStartTime >= newEndTime) {
      toast.error('End time must be after start time');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    addSlotMutation.mutate([{
      date: dateStr,
      startTime: newStartTime,
      endTime: newEndTime
    }]);
  };

  const handleGenerateDay = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slots = [];
    let currentHour = 9;
    let currentMin = 0;
    
    while (currentHour < 17) {
      const startStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
      
      const endStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Check if this slot already exists
      const exists = doctor?.timeSlots?.some((s: any) => 
        s.date === dateStr && s.startTime === startStr
      );
      
      if (!exists) {
        slots.push({ date: dateStr, startTime: startStr, endTime: endStr });
      }
    }
    
    if (slots.length > 0) {
      addSlotMutation.mutate(slots);
    } else {
      toast.error('Standard slots (9 AM - 5 PM) already exist for this day');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>;

  return (
    <div className="page-container max-w-6xl">
      <div className="mb-8">
        <h1 className="section-title text-3xl">Manage Schedule</h1>
        <p className="section-subtitle">Set your availability and manage your appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Calendar */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary-600" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Pad start of month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 md:h-24 bg-slate-50/50 rounded-lg border border-transparent" />
            ))}
            
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, startOfToday());
              const isPast = isBefore(day, startOfToday());
              const dateStr = format(day, 'yyyy-MM-dd');
              const daySlots = doctor?.timeSlots?.filter((s: any) => s.date === dateStr) || [];
              const hasSlots = daySlots.length > 0;
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  disabled={isPast}
                  className={`
                    relative h-14 md:h-24 rounded-lg border transition-all p-2 flex flex-col items-start justify-start
                    ${isPast ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-transparent' : 'hover:border-primary-300 cursor-pointer'}
                    ${isSelected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-slate-200 bg-white'}
                  `}
                >
                  <span className={`text-sm font-medium ${isToday ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {hasSlots && !isPast && (
                    <div className="mt-auto w-full">
                      <div className="text-[10px] text-primary-600 font-semibold truncate hidden md:block">
                        {daySlots.length} slots
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 md:hidden mt-1" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-1 border-b pb-3 flex items-center justify-between">
              <span>{format(selectedDate, 'EEEE, MMMM d')}</span>
              {isSameDay(selectedDate, startOfToday()) && <span className="badge badge-blue">Today</span>}
            </h3>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Clock size={16} /> Existing Slots
              </h4>
              
              {slotsForSelectedDate.length === 0 ? (
                <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                  No availability set for this date.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {slotsForSelectedDate.map((slot: any) => (
                    <div 
                      key={slot.id} 
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-sm
                        ${slot.isBooked ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-primary-100 text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{slot.startTime}</span>
                        <span className="text-slate-400">-</span>
                        <span className="font-medium">{slot.endTime}</span>
                      </div>
                      {slot.isBooked ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">Booked</span>
                      ) : (
                        <button
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          disabled={deleteSlotMutation.isPending}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
             <h4 className="text-sm font-semibold text-slate-600 mb-4">Add Availability</h4>
             
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div>
                 <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                 <input 
                   type="time" 
                   value={newStartTime}
                   onChange={e => setNewStartTime(e.target.value)}
                   className="form-input text-sm p-2"
                 />
               </div>
               <div>
                 <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                 <input 
                   type="time" 
                   value={newEndTime}
                   onChange={e => setNewEndTime(e.target.value)}
                   className="form-input text-sm p-2"
                 />
               </div>
             </div>
             
             <button 
                onClick={handleAddSingleSlot}
                disabled={addSlotMutation.isPending}
                className="btn btn-primary w-full text-sm py-2 mb-3"
             >
               {addSlotMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
               Add Slot
             </button>
             
             <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
             </div>
             
             <button 
                onClick={handleGenerateDay}
                disabled={addSlotMutation.isPending}
                className="btn btn-outline w-full text-sm py-2 mt-3"
             >
               Generate 9 AM - 5 PM
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
