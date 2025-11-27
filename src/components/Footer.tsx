import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#333333] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4">Sajikan<span className="text-[#C47A4F]">.</span></h3>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Platform resep digital yang menghadirkan cita rasa otentik Nusantara ke dapur modern Anda. Lestari kuliner, sajikan kehangatan.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#F0B84D]">Eksplorasi</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Resep Populer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bahan Masakan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Artikel Kuliner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Komunitas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#F0B84D]">Perusahaan</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-16 pt-8 text-center text-gray-500 text-sm">
          © 2025 Sajikan Indonesia. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
