"use client";

import React, { useEffect, useReducer, useState } from 'react';
import { TrendingUp, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Target } from 'lucide-react';
// Import dynamique ou gestion du montage pour éviter les erreurs de serveur
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface Mission {
  name: string;
  netIncome: number;
}

const COLORS = ['#0077B6', '#00B4D8', '#90E0EF', '#48CAE4'];

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
  // ÉTAPE 1 : On ajoute un état pour vérifier si le composant est monté (client-side)
  const [isMounted, setIsMounted] = useState(false);
  
  const goal = 2500;

  useEffect(() => {
    // ÉTAPE 2 : On confirme que nous sommes sur le navigateur
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    const savedMissions = localStorage.getItem('netflow_missions');
    if (savedMissions) {
      const missions: Mission[] = JSON.parse(savedMissions);
      const total = missions.reduce((acc: number, curr: Mission) => acc + curr.netIncome, 0);

      const groupedData = missions.reduce((acc: Record<string, number>, mission: Mission) => {
        acc[mission.name] = (acc[mission.name] || 0) + mission.netIncome;
        return acc;
      }, {});

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

  // ÉTAPE 3 : Si on n'est pas encore sur le client, on affiche un squelette vide 
  // pour éviter que Recharts ne casse le rendu initial.
  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-12 pb-24 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Vos finances en temps réel.</p>
          </div>
          <div className="hidden sm:flex bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl items-center gap-2 font-bold text-sm">
            <Target size={16} /> Objectif : {goal}€
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1E293B] p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Revenu Net Estimé</span>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                  Mars 2026
                </div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                {totalNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </h2>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-end">
                  <p className="text-slate-400 text-sm font-bold">Objectif de revenus</p>
                  <p className="text-cyan-400 font-black text-lg">{progress.toFixed(0)}%</p>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <TrendingUp className="absolute -right-8 -bottom-8 w-64 h-64 text-white opacity-[0.03] rotate-12" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 font-black text-sm bg-green-50 px-3 py-1 rounded-full">
                  <ArrowUpRight size={16} /> +12%
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Tendance</p>
                <h3 className="text-2xl font-black text-[#1E293B] mt-1">En hausse</h3>
              </div>
            </div>
            
            <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-blue-100">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={24} />
               </div>
               <p className="text-sm font-bold leading-snug">Mettez de côté 23% pour vos cotisations.</p>
            </div>
          </div>
        </div>

        {/* SECTION GRAPHIQUE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[450px]">
            <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-widest mb-8">
              Répartition des revenus
            </h3>
            
            <div className="flex-1 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={8}
                      cornerRadius={10}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    {/* Le Tooltip est souvent la source de l'erreur, on s'assure qu'il n'est rendu que sur le client */}
                    <Tooltip 
                      contentStyle={{ border: 'none', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <PieChartIcon size={40} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Données insuffisantes</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <h4 className="font-black text-slate-800 text-2xl tracking-tight mb-4 italic">Analyse</h4>
            <p className="text-slate-500 leading-relaxed font-medium mb-8">
              Votre moyenne par mission s&apos;élève à <span className="text-blue-600 font-bold">{(totalNet / (chartData.length || 1)).toFixed(0)} €</span>. 
              Pensez à bien déclarer vos revenus chaque mois.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase">Missions</p>
                <p className="text-lg font-black text-slate-800">{chartData.length}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase">Taxe Est.</p>
                <p className="text-lg font-black text-red-500">{(totalNet * 0.23).toFixed(0)}€</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}