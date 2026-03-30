"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Wallet, Briefcase,
  Trash2, CheckCircle2, Calendar, ArrowRight, PiggyBank,
  X, History, ArrowDownCircle, Edit3
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Mission } from '@/types/mission';

// Type pour l'historique de la caisse
interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: number;
}

// Type pour les dépenses/sorties
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: number;
}

export default function NetFlowApp() {
  // --- ÉTATS (STATES) ---
  const [missions, setMissions] = useState<Mission[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netflow_missions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [caisse, setCaisse] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netflow_caisse');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netflow_transactions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netflow_expenses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [formData, setFormData] = useState({ name: '', grossRate: '', hours: '', startDate: '', endDate: '' });
  const [selectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  // États pour les Modals personnalisées
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState<{id: string, name: string, amount: number} | null>(null);
  const [expenseData, setExpenseData] = useState({ description: '', category: '', amount: '' });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('netflow_missions', JSON.stringify(missions));
    localStorage.setItem('netflow_caisse', caisse.toString());
    localStorage.setItem('netflow_transactions', JSON.stringify(transactions));
    localStorage.setItem('netflow_expenses', JSON.stringify(expenses));
  }, [missions, caisse, transactions, expenses]);

  // --- CALCULS ---
  const currentMonthMissions = missions.filter(m => m.date === selectedMonth);
  const pendingNet = currentMonthMissions
    .filter(m => m.status === 'en_cours')
    .reduce((acc, curr) => acc + curr.netIncome, 0);

  // --- ACTIONS ---
  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grossRate || !formData.hours) return;

    const gross = parseFloat(formData.hours) * parseFloat(formData.grossRate);
    const net = gross * 0.77;

    const newMission: Mission = {
      id: uuidv4(),
      name: formData.name,
      grossRate: parseFloat(formData.grossRate),
      totalHours: parseFloat(formData.hours),
      taxPercentage: 23,
      netIncome: Number(net.toFixed(2)),
      date: selectedMonth,
      status: 'en_cours',
      createdAt: Date.now(),
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    setMissions([newMission, ...missions]);
    setFormData({ name: '', grossRate: '', hours: '', startDate: '', endDate: '' });
  };

  const confirmPayment = (amount: number) => {
    if (!showPaidModal) return;
    
    setCaisse(prev => prev + amount);
    setMissions(prev => prev.map(m => 
      m.id === showPaidModal.id ? { ...m, status: 'perçu', netIncome: amount } : m
    ));
    setShowPaidModal(null);
  };

  const addExpense = () => {
    if (!expenseData.description || !expenseData.category || !expenseData.amount) return;
    const amount = parseFloat(expenseData.amount);
    
    const newExpense: Expense = {
      id: uuidv4(),
      description: expenseData.description,
      category: expenseData.category,
      amount: amount,
      createdAt: Date.now()
    };

    setExpenses([newExpense, ...expenses]);
    setCaisse(prev => prev - amount);
    setExpenseData({ description: '', category: '', amount: '' });
    setShowExpenseModal(false);
  };

  return (
    <main className="min-h-screen bg-white p-4 md:p-8 font-poppins animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B]">Missions</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Aperçu global de toutes vos missions.</p>
        </div>
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-4">
          
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* COMPTEURS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] shadow-sm border border-slate-100">
                <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mb-2">En attente ({selectedMonth})</p>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                  {pendingNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
              <div className="bg-[#0077B6] p-4 sm:p-6 rounded-xl sm:rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                <PiggyBank className="absolute -right-2 sm:-right-4 -bottom-2 sm:-bottom-4 w-16 sm:w-24 h-16 sm:h-24 opacity-10 rotate-12" />
                <p className="text-blue-100 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mb-2">Disponible en Caisse</p>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {caisse.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
            </section>

            {/* MISSIONS */}
            <section>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1E293B] mb-3 sm:mb-4 flex items-center gap-2">
                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" /> Missions de la période
              </h3>
              <div className="grid gap-3 sm:gap-4">
                {currentMonthMissions.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Aucune activité enregistrée.</p>
                  </div>
                )}
                {currentMonthMissions.map((mission) => {
                  const isExpanded = expandedMission === mission.id;
                  const isPaid = mission.status === 'perçu';
                  
                  return (
                    <div key={mission.id} className={`bg-white rounded-lg sm:rounded-3xl border transition-all ${isPaid ? 'border-green-100 bg-green-50/10' : 'border-slate-100 shadow-sm'}`}>
                      <div className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-2" onClick={() => setExpandedMission(isExpanded ? null : mission.id)}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isPaid ? <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6" /> : <Briefcase className="w-5 sm:w-6 h-5 sm:h-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[#1E293B] text-sm sm:text-base truncate">{mission.name}</h4>
                            <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-1 truncate">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{new Date(mission.startDate).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })} → {new Date(mission.endDate).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 justify-end">
                          <p className={`text-base sm:text-lg font-black whitespace-nowrap ${isPaid ? 'text-green-600' : 'text-[#1E293B]'}`}>
                            +{mission.netIncome.toFixed(2)}€
                          </p>
                          {!isPaid && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowPaidModal({id: mission.id, name: mission.name, amount: mission.netIncome}); }}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg shadow-green-100 flex-shrink-0"
                            >
                              <Wallet className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setMissions(missions.filter(m => m.id !== mission.id)); }} className="p-2 text-slate-300 hover:text-red-500 flex-shrink-0">
                            <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-3 sm:px-5 pb-3 sm:pb-5 animate-in slide-in-from-top-2">
                          <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-2xl space-y-2 text-xs sm:text-sm font-medium border border-slate-100">
                            <div className="flex justify-between text-slate-500">
                              <span className="truncate">Brut ({mission.totalHours}h × {mission.grossRate}€)</span>
                              <span className="font-bold ml-2 flex-shrink-0">+{(mission.totalHours * mission.grossRate).toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-red-400">
                              <span>Cotisations (23%)</span>
                              <span className="font-bold flex-shrink-0">-{(mission.totalHours * mission.grossRate * 0.23).toFixed(2)}€</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-[#1E293B]">
                              <span>NET ESTIMÉ</span>
                              <span className="flex-shrink-0">{mission.netIncome}€</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* HISTORIQUE DE GESTION - TAB SORTIES */}
            <section className="bg-white rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-50 text-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <History className="w-4 sm:w-5 h-4 sm:h-5" />
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
                          Aucune dépense enregistrée.
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
            </section>
          </div>

          {/* FORMULAIRE & ACTIONS */}
          <aside className="space-y-6">
            <div className="bg-[#1E293B] p-5 sm:p-8 rounded-lg sm:rounded-[2.5rem] shadow-2xl text-white">
              <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 tracking-tight">
                <Plus className="w-5 sm:w-6 h-5 sm:h-6 text-[#00B4D8]" /> Ajouter Heures
              </h3>
              <form onSubmit={handleAddMission} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                <input 
                  required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" className="w-full bg-slate-800 border-none rounded-lg sm:rounded-xl p-3 sm:p-4 outline-none placeholder:text-slate-500" placeholder="Entreprise" 
                />
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 mb-1 block">Début</label>
                    <input required type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-800 border-none rounded-lg sm:rounded-xl p-2 sm:p-3 outline-none text-xs" />
                  </div>
                  <div>
                    <label className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 mb-1 block">Fin</label>
                    <input required type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-800 border-none rounded-lg sm:rounded-xl p-2 sm:p-3 outline-none text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <input required value={formData.grossRate} onChange={(e) => setFormData({...formData, grossRate: e.target.value})} type="number" className="w-full bg-slate-800 border-none rounded-lg sm:rounded-xl p-3 sm:p-4 outline-none" placeholder="Taux Brut" />
                  <input required value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} type="number" className="w-full bg-slate-800 border-none rounded-lg sm:rounded-xl p-3 sm:p-4 outline-none" placeholder="Heures" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm sm:text-lg">
                  Enregistrer 
                </button>
              </form>

               {/* REMISE DU TAX REMINDER DANS LE FORMULAIRE */}
<div className="mt-5 sm:mt-8 p-3 sm:p-5 bg-slate-800/50 rounded-lg sm:rounded-3xl border border-slate-700">
  <div className="flex items-center gap-2 sm:gap-3 mb-2">
    <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-[#00B4D8] flex-shrink-0" />
    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">Aide au calcul</span>
  </div>
  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-medium">
    Calculé sur une base de <span className="text-slate-300">23% de cotisations</span>. 
    L&apos;argent encaissé rejoint votre <span className="text-teal-400">Caisse</span> pour une gestion réelle de votre budget.
  </p>
</div>

            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-tighter">
                <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500 flex-shrink-0" /> Gestion Budget
              </h4>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="w-full py-3 sm:py-4 border-2 border-dashed border-slate-200 rounded-lg sm:rounded-2xl text-slate-400 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3 sm:w-4 h-3 sm:h-4" /> NOTER UNE DÉPENSE
              </button>
            </div>
          </aside>
        </div>

        {/* --- MODAL : NOTER UNE DÉPENSE --- */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-[2.5rem] w-full max-w-md p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-black text-slate-800">Nouvelle Dépense</h3>
                <button onClick={() => setShowExpenseModal(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <input 
                  type="text" placeholder="Description (ex: Loyer, Uber, Fournitures...)" 
                  value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm sm:text-base"
                />
                <select 
                  value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm sm:text-base"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Transport">Transport</option>
                  <option value="Loisir">Loisir</option>
                  <option value="Logement">Logement</option>
                  <option value="Repas">Repas</option>
                  <option value="Autre">Autre</option>
                </select>
                <input 
                  type="number" placeholder="Montant en €" 
                  value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm sm:text-base"
                />
                <button 
                  onClick={addExpense}
                  className="w-full bg-[#1E293B] text-white py-3 sm:py-4 rounded-lg sm:rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-xs sm:text-sm"
                >
                  Valider la dépense
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL : ENCAISSER & MODIFIER --- */}
        {showPaidModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-[2.5rem] w-full max-w-md p-5 sm:p-8 shadow-2xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-black text-slate-800">Valider l&apos;encaissement</h3>
                <button onClick={() => setShowPaidModal(null)} className="p-2 bg-slate-50 rounded-full"><X className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" /></button>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-2xl mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3">
                <Edit3 className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 flex-shrink-0 mt-1 sm:mt-0" />
                <p className="text-xs sm:text-sm font-bold text-blue-700">Vous pouvez ajuster le montant net si vous avez reçu une prime ou une retenue.</p>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Montant perçu pour {showPaidModal.name}</p>
              <input 
                type="number" 
                value={showPaidModal.amount} 
                onChange={(e) => setShowPaidModal({...showPaidModal, amount: parseFloat(e.target.value)})}
                className="w-full p-3 sm:p-5 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-3xl outline-none text-xl sm:text-2xl font-black text-slate-800 focus:ring-2 focus:ring-green-500 transition-all mb-4 sm:mb-6"
              />
              <button 
                onClick={() => confirmPayment(showPaidModal.amount)}
                className="w-full bg-green-500 text-white py-3 sm:py-5 rounded-lg sm:rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all text-xs sm:text-sm"
              >
                Confirmer l&apos;entrée en caisse
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}