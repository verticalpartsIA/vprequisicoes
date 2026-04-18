import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export const calculateDaysUntilDeparture = (requestDate: Date | string, departureDate: Date | string): number => {
  if (!departureDate) return 100;

  const start = startOfDay(typeof requestDate === 'string' ? parseISO(requestDate) : requestDate);
  const end = startOfDay(typeof departureDate === 'string' ? parseISO(departureDate) : departureDate);
  
  return differenceInDays(end, start);
};

export const isUrgentTravel = (requestDate: Date | string, departureDate: Date | string): boolean => {
  const days = calculateDaysUntilDeparture(requestDate, departureDate);
  return days <= 5;
};
