export type TravelType = 'visita_tecnica' | 'evento' | 'workshop' | 'curso' | 'outro';
export type TransportMode = 'aviao' | 'onibus' | 'carro_proprio' | 'carro_locado';

export interface TravelRequestInput {
  traveler_name: string;
  traveler_department: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travel_type: TravelType;
  is_international: boolean;
  transport_mode: TransportMode;
  needs_lodging: boolean;
  hotel_name?: string;
  nights?: number;
  needs_destination_car: boolean;
  pickup_location?: string;
  rental_days?: number;
  is_urgent: boolean;
  urgency_justification?: string;
}

export interface TravelRequest extends TravelRequestInput {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
}
