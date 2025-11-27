import React from 'react';
import { UtensilsCrossed, Bookmark, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <UtensilsCrossed className="w-8 h-8 text-[#333333]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4F8C5E] rounded-full border-2 border-white"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#333333]">
            Sajikan<span className="text-[#C47A4F]">.</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[#C47A4F] font-medium text-sm">Beranda</a>
          <a href="#" className="text-[#333333] hover:text-[#C47A4F] transition-colors font-medium text-sm">Jelajah Resep</a>
          <a href="#" className="text-[#333333] hover:text-[#C47A4F] transition-colors font-medium text-sm">Tentang Kami</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#333333] hover:bg-gray-50 rounded-full transition-colors relative">
            <Bookmark className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#C47A4F] rounded-full animate-pulse"></span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#333333] text-white rounded-full text-sm font-medium hover:bg-[#C47A4F] transition-colors">
            <User className="w-4 h-4" />
            <span>Masuk</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
