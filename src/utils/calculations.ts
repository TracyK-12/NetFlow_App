// utils/calculations.ts

export const calculateNetRevenue = (
  hours: number, 
  grossRate: number, 
  taxPercentage: number
): number => {
  const gross = hours * grossRate;
  const net = gross * (1 - taxPercentage / 100);
  return Number(net.toFixed(2));
};

// Exemple d'utilisation : calculateNetRevenue(35, 15, 23) -> 404.25