"use client";

import React, { useEffect, useReducer } from 'react';
import { TrendingUp, ArrowUpRight, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
// Importation des composants Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Type pour les données du graphique
interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface Mission {
  name: string;
  netIncome: number;
}

// Couleurs pro pour le graphique (dégradés de bleu/cyan)
const COLORS = ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'];

interface DashboardState {
  totalNet: number;
  chartData: ChartData[];
}

type DashboardAction = { type: 'SET_DATA'; payload: { totalNet: number; chartData: ChartData[] } };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA':
      return { totalNet: action.payload.totalNet, chartData: action.payload.chartData };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, { totalNet: 0, chartData: [] });
  const goal = 2000; // Objectif de dépenses

  useEffect(() => {
    const savedMissions = localStorage.getItem('netflow_missions');
    if (savedMissions) {
      const missions: Mission[] = JSON.parse(savedMissions);
      
      // 1. Calcul du Total Net
      const total = missions.reduce((acc: number, curr: Mission) => acc + curr.netIncome, 0);

      // 2. Préparation des données pour le PieChart (Grouper par Entreprise)
      const groupedData = missions.reduce((acc: Record<string, number>, mission: Mission) => {
        acc[mission.name] = (acc[mission.name] || 0) + mission.netIncome;
        return acc;
      }, {});

      // Transformer l'objet en tableau pour Recharts
      const formattedData = Object.keys(groupedData).map((name, index) => ({
        name: name,
        value: Number(groupedData[name].toFixed(2)),
        fill: COLORS[index % COLORS.length]
      }));

      dispatch({ type: 'SET_DATA', payload: { totalNet: total, chartData: formattedData } });
    }
  }, []);

  const { totalNet, chartData } = state;
  const progress = Math.min((totalNet / goal) * 100, 100);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-poppins animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B]">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Aperçu global de votre activité freelance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* CARTE PRINCIPALE : TOTAL INCOME */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-8 md:p-10 rounded-xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative z-10">
              <p className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-widest mb-2 sm:mb-4">Total Estimated Net Income</p>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1E293B] mb-6 sm:mb-10 tracking-tighter">
                {totalNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </h2>
            </div>
            
            {/* PROGRESS BAR (FIXED EXPENSES GOAL) */}
            <div className="space-y-2 sm:space-y-3 bg-slate-50 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-2xl border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0">
                <div>
                  <span className="text-[#1E293B] font-bold text-sm sm:text-base">Fixed Expenses Goal</span>
                </div>
                <span className="text-blue-600 font-black text-sm sm:text-base">{progress.toFixed(0)}% Complete</span>
              </div>
              <div className="h-3 sm:h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>0€</span>
                <span>Target: {goal}€</span>
              </div>
            </div>
            {/* Décoration en fond */}
            <TrendingUp className="absolute -right-10 -top-10 w-64 h-64 text-slate-50 opacity-[0.03]" />
          </div>

          {/* CARTE STATS RAPIDE */}
          <div className="bg-[#1E293B] p-4 sm:p-6 rounded-lg sm:rounded-2xl text-white flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start gap-3">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-700 rounded-lg sm:rounded-2xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                <DollarSign size={18} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex items-center gap-1 text-green-400 font-bold text-xs sm:text-sm bg-green-500/10 px-2 sm:px-3 py-1 rounded-full">
                <ArrowUpRight size={14} className="sm:w-4 sm:h-4" /> +12%
              </div>
            </div>
            <div className="mt-3 sm:mt-0">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">Performance mensuelle</p>
              <h3 className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 tracking-tight">En progression</h3>
            </div>
          </div>
        </div>

        {/* SECTION DU BAS : LE GRAPHIQUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          <div className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <h3 className="font-bold text-[#1E293B] mb-3 sm:mb-4 uppercase text-[10px] sm:text-xs tracking-widest text-slate-400">
              Income Breakdown (by company)
            </h3>
            
            <div className="flex-1 w-full h-[350px]">
              {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
               innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={5}
                          cornerRadius={8}
                      >
                          {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                      </Pie>
                      <Tooltip 
                          contentStyle={{ border: 'none', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(value) => [`${(value as number).toFixed(2)} €`, 'Net']}
                      />
                      <Legend 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '10px' }}
                      />
                      </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="text-center h-full flex flex-col items-center justify-center">
                      <PieChartIcon size={48} className="text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium text-sm">Aucune donnée disponible.</p>
                      <span className="text-xs text-slate-300">Ajoutez des missions pour générer le graphique.</span>
                  </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-3 sm:gap-4">
              <h4 className="font-black text-slate-800 tracking-tight text-lg sm:text-xl">Analyse financière</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Pensez à mettre de côté au moins <span className="font-bold text-teal-600">23%</span> de vos revenus pour vos futures cotisations sociales. Utilisez l&apos;onglet <strong className="text-blue-600">Missions</strong> pour valider vos paiements reçus.
              </p>
               <button className="self-start text-[10px] sm:text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                  Voir les rapports détaillés <ArrowUpRight size={12} className="sm:w-4 sm:h-4"/>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
