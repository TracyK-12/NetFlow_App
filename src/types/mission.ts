// types/mission.ts
// export interface Mission {
//   id: string;
//   name: string;
//   grossRate: number;
//   taxPercentage: number;
//   totalHours: number;
//   netIncome: number;
//   createdAt: number;
// }

export interface Mission {
  id: string;
  name: string;
  grossRate: number;
  totalHours: number;
  netIncome: number;
  taxPercentage: number;
  date: string; // ex: "2024-05" pour le mois
  status: 'en_cours' | 'perçu'; 
  realAmount?: number; // Montant réellement reçu si différent
  createdAt: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}