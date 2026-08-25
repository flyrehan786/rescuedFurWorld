export interface HealthEvent {
  date: string;
  title: string;
  description: string;
  type: 'rescue' | 'checkup' | 'treatment' | 'surgery' | 'milestone';
}

export interface Cat {
  id: string;
  name: string;
  emoji: string;
  photo?: string;
  tagline: string;
  bio: string;
  rescueDate: string;
  status: 'Thriving' | 'Under care' | 'Looking for a home';
  healthJourney: HealthEvent[];
}
