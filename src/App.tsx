import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RecipeCard } from './components/ui/RecipeCard';
import { Footer } from './components/Footer';
import { recipes } from './data/recipes';
import type { Recipe } from './types/recipe';
import { SearchEngine } from './lib/searchEngine';
import { Loader2, Utensils, Star } from 'lucide-react';

// Initialize Search Engine
const engine = new SearchEngine(recipes);

const App: React.FC = () => {
  const [results, setResults] = useState<Recipe[]>(recipes);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate network delay for realism (optional, but feels nice)
    setTimeout(() => {
      const searchResults = engine.search(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);
  };

  const topSimilarity = useMemo(() => {
    if (!searchQuery) return undefined;
    const scored = results.filter((recipe) => typeof recipe.score === 'number');
    if (scored.length === 0) return undefined;
    return Math.max(...scored.map((recipe) => recipe.score || 0));
  }, [results, searchQuery]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#333333]">
      <Navbar />
      
      {typeof topSimilarity === 'number' && (
        <div className="fixed top-6 right-6 z-40">
          <div className="min-w-[140px] flex items-center gap-3 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2.5 shadow-lg">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Kemiripan terbaik</span>
              <span className="text-lg font-semibold text-[#333333]">
                {topSimilarity.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              <div>Cosine</div>
              <div>TF-IDF</div>
            </div>
          </div>
        </div>
      )}
      
      <main>
        <Hero onSearch={handleSearch} />
        
        <section className="py-20 px-6 bg-gray-50/50 min-h-[600px]">
          <div className="container mx-auto">
            
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Rekomendasi Pilihan'}
                </h2>
                <p className="text-gray-500 mt-2">
                  {searchQuery 
                    ? `Menemukan ${results.length} resep yang cocok dengan selera Anda.` 
                    : 'Daftar resep otentik yang paling banyak dicari minggu ini.'}
                </p>
              </div>
              
              {!searchQuery && (
                <a href="#" className="text-[#C47A4F] font-medium hover:underline flex items-center gap-2">
                  Lihat Semua Resep <Utensils className="w-4 h-4" />
                </a>
              )}
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#C47A4F] animate-spin mb-4" />
                <p className="text-gray-500">Sedang mencari resep terbaik...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((recipe, index) => (
              <RecipeCard
                key={`${recipe.id}-${index}`}
                recipe={recipe}
                rank={searchQuery ? index + 1 : undefined}
              />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="mb-4 text-6xl">🥘</div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">Resep tidak ditemukan</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Maaf, kami tidak dapat menemukan resep untuk kata kunci tersebut. Coba gunakan kata kunci lain seperti "Ayam", "Pedas", atau "Soto".
                </p>
                <button 
                  onClick={() => handleSearch('')}
                  className="mt-6 px-6 py-2 bg-[#C47A4F] text-white rounded-full hover:bg-[#a8653d] transition-colors"
                >
                  Lihat Semua Resep
                </button>
              </div>
            )}

          </div>
        </section>

        {/* Feature Section / Value Props */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 text-center">
             <div className="max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold mb-4">Kenapa Memilih Sajikan?</h2>
               <div className="w-20 h-1 bg-[#F0B84D] mx-auto rounded-full"></div>
             </div>

             <div className="grid md:grid-cols-3 gap-12">
               <div className="p-8 bg-gray-50 rounded-3xl hover:bg-[#FDF8F3] transition-colors duration-300">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">
                   🏆
                 </div>
                 <h3 className="text-xl font-bold mb-3">Autentisitas Terjamin</h3>
                 <p className="text-gray-500 leading-relaxed">
                   Setiap resep diverifikasi oleh ahli kuliner untuk memastikan rasa yang otentik sesuai aslinya.
                 </p>
               </div>
               
               <div className="p-8 bg-gray-50 rounded-3xl hover:bg-[#FDF8F3] transition-colors duration-300">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">
                   ⚡
                 </div>
                 <h3 className="text-xl font-bold mb-3">Pencarian Cerdas</h3>
                 <p className="text-gray-500 leading-relaxed">
                   Teknologi pencarian kami memahami konteks bahan dan rasa, bukan hanya mencocokkan kata.
                 </p>
               </div>

               <div className="p-8 bg-gray-50 rounded-3xl hover:bg-[#FDF8F3] transition-colors duration-300">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">
                   🍳
                 </div>
                 <h3 className="text-xl font-bold mb-3">Mudah Diikuti</h3>
                 <p className="text-gray-500 leading-relaxed">
                   Panduan langkah demi langkah yang jelas, cocok untuk pemula maupun juru masak berpengalaman.
                 </p>
               </div>
             </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
};

export default App;
