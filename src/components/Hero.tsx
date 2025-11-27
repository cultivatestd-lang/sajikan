import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
  };

  const tags = [
    'Resep Vegan', 
    'Pedas Maksimal', 
    'Masakan Sumatra', 
    'Rempah Kuat'
  ];

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center bg-white overflow-hidden">
      
      {/* Abstract decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-[#C47A4F]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-[#F0B84D]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10 text-center">
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-[#333333] mb-6 tracking-tight leading-[1.1]">
          Warisan Rasa, <br />
          <span className="text-[#C47A4F]">Dapur Masa Kini.</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Ribuan resep otentik Indonesia, siap dieksplorasi dengan sekali sentuh. 
          Temukan inspirasi memasak yang mudah namun tetap menjaga keaslian rasa.
        </p>

        {/* Search Interface */}
        <div className="relative max-w-2xl mx-auto w-full mb-8">
          <div 
            className={`
              relative flex items-center bg-white rounded-2xl transition-all duration-300
              ${isFocused 
                ? 'shadow-2xl shadow-[#C47A4F]/10 ring-2 ring-[#C47A4F] scale-[1.01]' 
                : 'shadow-xl shadow-gray-200/50 border border-gray-100'}
            `}
          >
            <div className="pl-6">
              <Search className={`w-6 h-6 ${isFocused ? 'text-[#C47A4F]' : 'text-gray-400'} transition-colors`} />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Cari berdasarkan nama resep, bumbu, atau bahan utama..."
              className="w-full py-6 px-4 bg-transparent border-none focus:outline-none text-lg text-[#333333] placeholder:text-gray-300"
            />
            <div className="pr-2">
              <button className="bg-[#C47A4F] hover:bg-[#b06d46] text-white p-3 rounded-xl transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations / Tags */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
          <span className="text-[#333333] font-medium">Pencarian Populer:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 bg-[#F0B84D]/10 hover:bg-[#F0B84D] text-[#333333] rounded-lg transition-all duration-300 hover:shadow-md text-xs font-semibold tracking-wide"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
      
      {/* Hero Image - Subtle placement at bottom */}
      <div className="mt-16 max-w-5xl w-full mx-auto relative rounded-3xl overflow-hidden h-[300px] md:h-[400px] shadow-2xl shadow-gray-200/50">
         <ImageWithFallback
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
            alt="Indonesian Spices and Ingredients"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
      </div>

    </section>
  );
};
