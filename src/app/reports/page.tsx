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
  const [activeTab, setActiveTab] = useState<'missions' | 'expenses'>('missions');
  const [state, dispatch] = useReducer(reportsReducer, { missions: [], expenses: [] });
  const { missions, expenses } = state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedMissions = localStorage.getItem('netflow_missions');
    if (savedMissions) dispatch({ type: 'SET_MISSIONS', payload: JSON.parse(savedMissions) });
    
    const savedExpenses = localStorage.getItem('netflow_expenses');
    if (savedExpenses) dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(savedExpenses) });
  }, []);

  const handlePrint = () => window.print();

  const exportCSV = () => {
    const isMissions = activeTab === 'missions';
    const data = isMissions ? missions : expenses;
    if (data.length === 0) return;

    const headers = isMissions 
      ? ["Date", "Entreprise", "Heures", "Taux Brut", "Net Reçu"]
      : ["Date", "Description", "Catégorie", "Montant"];

    const rows = isMissions
      ? missions.map(m => [new Date(m.createdAt).toLocaleDateString('fr-FR'), m.name, m.totalHours, m.grossRate, m.netIncome])
      : expenses.map(e => [new Date(e.createdAt).toLocaleDateString('fr-FR'), e.description, e.category, e.amount]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `netflow_${activeTab}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-12 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ENTÊTE DYNAMIQUE */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">Rapports</h1>
            <p className="text-slate-500 mt-2 font-medium">Exportez vos données pour votre comptabilité.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 px-5 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Download size={18} /> CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1E293B] px-5 py-3 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Printer size={18} /> PDF
            </button>
          </div>
        </div>

        {/* SÉLECTEUR D'ONGLETS TYPE IOS */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'missions' ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Revenus ({missions.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'expenses' ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Dépenses ({expenses.length})
          </button>
        </div>

        {/* FILTRES ACTIFS */}
        <div className="flex flex-wrap gap-3 items-center text-xs sm:text-sm">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-slate-600 font-bold">
            <Calendar size={14} className="text-blue-500" />
            Période actuelle
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-slate-600 font-bold">
            <Filter size={14} className="text-blue-500" />
            {activeTab === 'missions' ? 'Toutes les missions' : 'Toutes les sorties'}
          </div>
        </div>

        {/* ZONE DE TABLEAU RESPONSIVE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'missions' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
              <FileText size={20} />
            </div>
            <h3 className="font-black text-[#1E293B] uppercase tracking-widest text-xs sm:text-sm">
              {activeTab === 'missions' ? 'Détail des encaissements' : 'Détail des dépenses'}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Désignation</th>
                  {activeTab === 'missions' ? (
                    <th className="px-8 py-5 text-center">Volume</th>
                  ) : (
                    <th className="px-8 py-5">Catégorie</th>
                  )}
                  <th className="px-8 py-5 text-right">Montant HT/Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'missions' ? (
                  missions.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/30 transition-colors text-sm">
                      <td className="px-8 py-5 font-bold text-slate-400">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-8 py-5 font-black text-[#1E293B]">{m.name}</td>
                      <td className="px-8 py-5 text-center font-bold text-slate-600">{m.totalHours}h</td>
                      <td className="px-8 py-5 text-right font-black text-blue-600">+{m.netIncome.toLocaleString('fr-FR')}€</td>
                    </tr>
                  ))
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/30 transition-colors text-sm">
                      <td className="px-8 py-5 font-bold text-slate-400">{new Date(e.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-8 py-5 font-black text-[#1E293B]">{e.description}</td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-red-600">-{e.amount.toLocaleString('fr-FR')}€</td>
                    </tr>
                  ))
                )}
                {(activeTab === 'missions' ? missions : expenses).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      Aucune donnée enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
              {(activeTab === 'missions' ? missions : expenses).length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/80">
                    <td colSpan={3} className="px-8 py-6 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Total Période</td>
                    <td className={`px-8 py-6 text-right font-black text-xl ${activeTab === 'missions' ? 'text-blue-600' : 'text-red-600'}`}>
                      {activeTab === 'missions' 
                        ? missions.reduce((acc, curr) => acc + curr.netIncome, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                        : expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      }
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200 border-b-4 border-blue-800">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-black mb-2">Prêt pour votre déclaration ?</h4>
            <p className="text-blue-100 text-sm font-medium opacity-90">
              Toutes vos cotisations sociales sont déjà déduites de vos rapports de revenus.
            </p>
          </div>
          <button className="w-full md:w-auto bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
            Contacter mon comptable
          </button>
        </div>
      </div>
    </div>
  );
}