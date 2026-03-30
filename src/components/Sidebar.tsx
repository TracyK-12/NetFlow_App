"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, PieChart, Menu, X } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/missions', icon: Briefcase, label: 'Missions' },
    { href: '/reports', icon: PieChart, label: 'Rapports' },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col p-6 fixed h-full z-[100]">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white">
            <Image 
              src="/netLogo.jpeg"
              alt="Logo NetFlow"
              width={56}
              height={56}
              priority
            />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
        </Link>

        <nav className="space-y-2 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link 
              key={href}
              href={href} 
              className="flex items-center gap-3 p-3 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl font-bold transition-all"
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        {/* USER BUTTON - DESKTOP (Amélioré pour le clic) */}
        <div className="mt-auto pt-6 border-t border-slate-100 relative z-[110]">
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <UserButton appearance={{ elements: { userButtonTrigger: "focus:shadow-none" } }} />
                <span className="text-xs font-bold text-slate-500 uppercase select-none">
                    Mon Compte
                </span>
            </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-100 flex flex-col p-4 z-[100] transition-transform duration-300 md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
              <Image 
                src="/netLogo.jpeg"
                alt="Logo NetFlow"
                width={40}
                height={40}
                priority
              />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link 
              key={href}
              href={href}
              className="flex items-center gap-3 p-3 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl font-bold transition-all"
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        {/* USER BUTTON - MOBILE */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3 p-2">
          <UserButton />
          <span className="text-xs font-bold text-slate-500 uppercase">Mon Compte</span>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center justify-between">
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
          <Menu size={24} className="text-[#1E293B]" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-600">
            <Image 
              src="/netLogo.jpeg"
              alt="Logo NetFlow"
              width={32}
              height={32}
              priority
            />
          </div>
          <span className="font-black text-base tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
        </Link>
        <div className="w-8" />
      </div>
    </>
  );
}