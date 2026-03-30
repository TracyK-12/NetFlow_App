"use client";

import React, { useEffect, useReducer, useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';

interface Mission {
  id: string;
  name: string;
  grossRate: number;
  totalHours: number;
  netIncome: number;
  createdAt: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: number;
}

interface ReportsState {
  missions: Mission[];
  expenses: Expense[];
}

type ReportsAction = 
  | { type: 'SET_MISSIONS'; payload: Mission[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] };

function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
  switch (action.type) {
    case 'SET_MISSIONS':
      return { ...state, missions: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    default:
      return state;
  }
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'missions' | 'expenses'>('missions');
  const [state, dispatch] = useReducer(reportsReducer, { missions: [], expenses: [] });
  const { missions, expenses } = state;

  useEffect(() => {
    const savedMissions = localStorage.getItem('netflow_missions');
    if (savedMissions) {
      const parsedMissions: Mission[] = JSON.parse(savedMissions);
      dispatch({ type: 'SET_MISSIONS', payload: parsedMissions });
    }
    
    const savedExpenses = localStorage.getItem('netflow_expenses');
    if (savedExpenses) {
      const parsedExpenses: Expense[] = JSON.parse(savedExpenses);
      dispatch({ type: 'SET_EXPENSES', payload: parsedExpenses });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (tab === 'missions') {
      if (missions.length === 0) return;
      
      const headers = ["Date", "Entreprise", "Heures", "Taux Brut", "Net Estimé"];
      const rows = missions.map(m => [
        new Date(m.createdAt).toLocaleDateString('fr-FR'),
        m.name,
        m.totalHours,
        m.grossRate,
        m.netIncome.toFixed(2)
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rapport_missions_${new Date().getMonth() + 1}.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      if (expenses.length === 0) return;
      
      const headers = ["Date", "Description", "Catégorie", "Montant"];
      const rows = expenses.map(e => [
        new Date(e.createdAt).toLocaleDateString('fr-FR'),
        e.description,
        e.category,
        e.amount.toFixed(2)
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rapport_sorties_${new Date().getMonth() + 1}.csv`);
      document.body.appendChild(link);
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 pb-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B]">Rapports</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Générez vos documents comptables et exports.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={exportCSV}
              className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex-shrink-0"
            >
              <Download size={16} /> <span className="hidden sm:inline">CSV</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#1E293B] px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex-shrink-0"
            >
              <Printer size={16} /> <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setTab('missions')}
            className={`px-4 py-3 font-bold text-sm transition-all ${
              tab === 'missions'
                ? 'text-[#0077B6] border-b-2 border-[#0077B6]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Missions ({missions.length})
          </button>
          <button
            onClick={() => setTab('expenses')}
            className={`px-4 py-3 font-bold text-sm transition-all ${
              tab === 'expenses'
                ? 'text-[#0077B6] border-b-2 border-[#0077B6]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sorties ({expenses.length})
          </button>
        </div>

        {/* FILTRES (Visuels pour le design) */}
        <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-2 sm:gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm border border-slate-100">
              <Calendar size={14} />
              <span className="font-bold text-slate-600 italic">Mars 2026</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm border border-slate-100">
              <Filter size={14} />
              <span className="font-bold text-slate-600">{tab === 'missions' ? 'Toutes les missions' : 'Toutes les sorties'}</span>
          </div>
        </div>

        {/* TABLEAU MISSIONS */}
        {tab === 'missions' && (
          <div className="bg-white rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={16} />
                </div>
                <h3 className="font-black text-[#1E293B] uppercase tracking-wider text-xs sm:text-sm">Récapitulatif des revenus</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                    <th className="px-3 sm:px-8 py-2 sm:py-4">Date</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4">Désignation</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4 text-center">Volume (h)</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4 text-right">Montant Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {missions.map((mission, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors text-xs sm:text-sm">
                      <td className="px-3 sm:px-8 py-3 sm:py-5 font-bold text-slate-500">
                        {new Date(mission.createdAt).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5">
                        <span className="font-black text-[#1E293B] truncate">{mission.name}</span>
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5 text-center font-bold text-slate-600">
                        {mission.totalHours}h
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5 text-right font-black text-[#1E293B]">
                        {mission.netIncome.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                  ))}
                  {missions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-8 py-6 sm:py-10 text-center text-slate-400 italic text-xs sm:text-sm">
                        Aucune donnée à exporter pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
                {missions.length > 0 && (
                    <tfoot>
                        <tr className="bg-slate-50/50">
                            <td colSpan={3} className="px-3 sm:px-8 py-3 sm:py-6 text-right font-bold text-slate-400 uppercase text-[8px] sm:text-[10px] tracking-widest">Total</td>
                            <td className="px-3 sm:px-8 py-3 sm:py-6 text-right font-black text-lg sm:text-xl text-blue-600">
                                {missions.reduce((acc, curr) => acc + curr.netIncome, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </td>
                        </tr>
                    </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* TABLEAU SORTIES */}
        {tab === 'expenses' && (
          <div className="bg-white rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-50 text-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={16} />
                </div>
                <h3 className="font-black text-[#1E293B] uppercase tracking-wider text-xs sm:text-sm">Historique des sorties</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                    <th className="px-3 sm:px-8 py-2 sm:py-4">Date</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4">Description</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4">Catégorie</th>
                    <th className="px-3 sm:px-8 py-2 sm:py-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map((expense, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors text-xs sm:text-sm">
                      <td className="px-3 sm:px-8 py-3 sm:py-5 font-bold text-slate-500">
                        {new Date(expense.createdAt).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5">
                        <span className="font-black text-[#1E293B] truncate">{expense.description}</span>
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">{expense.category}</span>
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5 text-right font-black text-red-600">
                        −{expense.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-8 py-6 sm:py-10 text-center text-slate-400 italic text-xs sm:text-sm">
                        Aucune donnée à exporter pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
                {expenses.length > 0 && (
                    <tfoot>
                        <tr className="bg-slate-50/50">
                            <td colSpan={3} className="px-3 sm:px-8 py-3 sm:py-6 text-right font-bold text-slate-400 uppercase text-[8px] sm:text-[10px] tracking-widest">Total</td>
                            <td className="px-3 sm:px-8 py-3 sm:py-6 text-right font-black text-lg sm:text-xl text-red-600">
                                −{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </td>
                        </tr>
                    </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        <div className="bg-blue-600 p-4 sm:p-8 rounded-lg sm:rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl shadow-blue-200">
          <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-black">Prêt pour votre déclaration ?</h4>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                {tab === 'missions' 
                  ? 'Toutes vos cotisations (23%) sont déjà calculées dans ce rapport.'
                  : 'Gardez une trace de toutes vos dépenses professionnelles.'}
              </p>
          </div>
          <button className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm hover:scale-105 transition-transform flex-shrink-0">
              Contacter comptable
          </button>
        </div>
      </div>
    </div>
  );
}