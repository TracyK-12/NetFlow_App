"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Wallet, Briefcase,
  Trash2, CheckCircle2, Calendar, ArrowRight, PiggyBank,
  X, History, Edit3
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Mission } from '@/types/mission';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [caisse, setCaisse] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({ name: '', grossRate: '', hours: '', startDate: '', endDate: '' });
  const [selectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState<{id: string, name: string, amount: number} | null>(null);
  const [expenseData, setExpenseData] = useState({ description: '', category: '', amount: '' });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedMissions = localStorage.getItem('netflow_missions');
    const savedCaisse = localStorage.getItem('netflow_caisse');
    const savedExpenses = localStorage.getItem('netflow_expenses');
    
    if (savedMissions) setMissions(JSON.parse(savedMissions));
    if (savedCaisse) setCaisse(Number(savedCaisse));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('netflow_missions', JSON.stringify(missions));
      localStorage.setItem('netflow_caisse', caisse.toString());
      localStorage.setItem('netflow_expenses', JSON.stringify(expenses));
    }
  }, [missions, caisse, expenses, mounted]);

  const currentMonthMissions = missions.filter(m => m.date === selectedMonth);
  const pendingNet = currentMonthMissions
    .filter(m => m.status === 'en_cours')
    .reduce((acc, curr) => acc + curr.netIncome, 0);

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

  if (!mounted) return null;

  return (
    <main className="flex-1 min-h-screen bg-white p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TITRE PRINCIPAL */}
        <section>
          <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">Missions</h1>
          <p className="text-slate-500 mt-2">Gérez vos prestations et encaissements.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-10">
            {/* RÉSUMÉ FINANCIER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">En attente (ce mois)</p>
                <h2 className="text-3xl font-black text-[#1E293B]">
                  {pendingNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
              <div className="bg-[#0077B6] p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                <PiggyBank className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest mb-2">Disponible en Caisse</p>
                <h2 className="text-3xl font-black">
                  {caisse.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
            </div>

            {/* LISTE DES MISSIONS */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Missions en cours
              </h3>
              
              <div className="space-y-3">
                {currentMonthMissions.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                    Aucune mission enregistrée pour ce mois.
                  </div>
                )}
                {currentMonthMissions.map((mission) => (
                  <div key={mission.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* En-tête de la mission cliquable */}
                    <div 
                      onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mission.status === 'perçu' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                          {mission.status === 'perçu' ? <CheckCircle2 size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-slate-800 truncate">{mission.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {new Date(mission.startDate).toLocaleDateString('fr-FR')} → {new Date(mission.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black whitespace-nowrap ${mission.status === 'perçu' ? 'text-green-600' : 'text-slate-800'}`}>
                          +{mission.netIncome}€
                        </span>
                        {mission.status !== 'perçu' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPaidModal({id: mission.id, name: mission.name, amount: mission.netIncome});
                            }}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Wallet size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMissions(missions.filter(m => m.id !== mission.id));
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* DÉTAILS DES CALCULS (S'affiche au clic) */}
                    {expandedMission === mission.id && (
                      <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3">
                          <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-slate-400">Temps total</p>
                            <p className="text-xs font-bold text-slate-700">{mission.totalHours}h à {mission.grossRate}€/h</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-slate-400">Total Brut</p>
                            <p className="text-xs font-bold text-slate-700">{(mission.totalHours * mission.grossRate).toFixed(2)}€</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-slate-400">Cotisations (23%)</p>
                            <p className="text-xs font-bold text-red-500">-{(mission.totalHours * mission.grossRate * 0.23).toFixed(2)}€</p>
                          </div>
                          <div className="space-y-1 text-right md:text-left">
                            <p className="text-[9px] uppercase font-bold text-slate-400">Net Estimé</p>
                            <p className="text-xs font-black text-blue-600">{mission.netIncome}€</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* HISTORIQUE DES SORTIES */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <History className="text-red-500" />
                <h3 className="font-black text-[#1E293B] uppercase tracking-widest text-xs">Historique des sorties</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="text-sm">
                        <td className="px-6 py-4 text-slate-500">{new Date(expense.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{expense.description}</td>
                        <td className="px-6 py-4 text-right font-black text-red-600">-{expense.amount}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* COLONNE ACTIONS */}
          <aside className="space-y-6">
            <div className="bg-[#1E293B] p-6 md:p-8 rounded-[2rem] text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-cyan-400" /> Ajouter une mission
              </h3>
              <form onSubmit={handleAddMission} className="space-y-4">
                <input 
                  required value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800 rounded-xl p-4 outline-none text-sm" 
                  placeholder="Nom du client / Entreprise" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Début</label>
                    <input required type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-800 rounded-lg p-2 text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Fin</label>
                    <input required type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-800 rounded-lg p-2 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" placeholder="Taux Brut (€)" value={formData.grossRate} onChange={(e) => setFormData({...formData, grossRate: e.target.value})} className="w-full bg-slate-800 rounded-xl p-4 text-sm outline-none" />
                  <input required type="number" placeholder="Nb. Heures" value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} className="w-full bg-slate-800 rounded-xl p-4 text-sm outline-none" />
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 py-4 rounded-xl font-black uppercase tracking-widest transition-all">
                  Enregistrer
                </button>
              </form>
              
              <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
                  Base de calcul : <span className="text-white">23% de cotisations</span>.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowExpenseModal(true)}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Plus size={18} /> NOTER UNE DÉPENSE
            </button>
          </aside>
        </div>

        {/* MODAL DÉPENSE */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Nouvelle Dépense</h3>
                <button onClick={() => setShowExpenseModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Description (ex: Loyer, Logiciels...)" 
                  value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100"
                >
                  <option value="">Choisir une catégorie</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Transport">Transport</option>
                  <option value="Repas">Repas</option>
                  <option value="Autre">Autre</option>
                </select>
                <input 
                  type="number" placeholder="Montant en €" 
                  value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100"
                />
                <button onClick={addExpense} className="w-full bg-[#1E293B] text-white py-4 rounded-2xl font-black uppercase tracking-widest">
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ENCAISSEMENT */}
        {showPaidModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Confirmer l&apos;encaissement</h3>
                <button onClick={() => setShowPaidModal(null)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl mb-6 flex gap-3">
                <Edit3 className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 font-medium">Vérifiez le montant net final reçu sur votre compte bancaire.</p>
              </div>
              <input 
                type="number" 
                value={showPaidModal.amount} 
                onChange={(e) => setShowPaidModal({...showPaidModal, amount: parseFloat(e.target.value)})}
                className="w-full p-6 bg-slate-50 rounded-3xl outline-none text-3xl font-black text-center mb-6 border border-slate-100"
              />
              <button 
                onClick={() => confirmPayment(showPaidModal.amount)}
                className="w-full bg-green-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-green-100"
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