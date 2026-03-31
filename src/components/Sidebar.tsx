"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, PieChart, Menu, X } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Ferme le drawer quand on change de route (UX mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Bloque le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/missions', icon: Briefcase, label: 'Missions' },
    { href: '/reports', icon: PieChart, label: 'Rapports' },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* ─── MOBILE HEADER ────────────────────────────────────────────────────────
          sticky top-0 : reste visible au scroll
          w-full       : 100% de la largeur, aucun débordement
          z-50         : sous les modales (z-[100]) mais au-dessus du contenu
      ──────────────────────────────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Bouton hamburger — à gauche */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} className="text-[#1E293B]" />
          </button>

          {/* Logo centré */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/netLogo.jpeg" alt="Logo" width={28} height={28} className="rounded-md" />
            <span className="font-black text-sm tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
          </Link>

          {/* Avatar — à droite */}
          <UserButton />
        </div>
      </header>

      {/* ─── MOBILE DRAWER OVERLAY ────────────────────────────────────────────────
          Couvre tout l'écran derrière le drawer
      ──────────────────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── MOBILE DRAWER PANEL ──────────────────────────────────────────────────
          Glisse depuis la gauche via translate-x
          z-[120] : au-dessus de l'overlay
      ──────────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100
          flex flex-col p-6 z-[120] transition-transform duration-300 ease-in-out
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* En-tête du drawer */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Image src="/netLogo.jpeg" alt="Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-black text-lg tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-[#1E293B] text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Compte utilisateur */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <UserButton />
            <span className="text-xs font-bold text-slate-500 uppercase">Mon Compte</span>
          </div>
        </div>
      </aside>

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────────────────────
          fixed left-0 top-0 h-full w-64 : toujours visible, ne pousse PAS le contenu.
          Le `main` compense avec `md:pl-64` (défini dans layout.tsx).
          hidden md:flex : invisible sur mobile, visible à partir de md.
      ──────────────────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex-col p-6 z-[100]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <Image src="/netLogo.jpeg" alt="Logo" width={48} height={48} priority />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-[#1E293B]">NetFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-[#1E293B] text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Compte utilisateur */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <UserButton />
            <span className="text-xs font-bold text-slate-500 uppercase">Mon Compte</span>
          </div>
        </div>
      </aside>
    </>
  );
}