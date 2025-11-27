import React from 'react';
import type { Recipe } from '../../types/recipe';
import { Clock, ChefHat, Hash, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getRecipeImageSrc } from '../../lib/imageHelpers';

interface RecipeCardProps {
  recipe: Recipe;
  rank?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, rank }) => {
  const resolvedImage = getRecipeImageSrc(recipe.image);
  const shouldShowRankingBadge = typeof rank === 'number' && rank > 0 && typeof recipe.score === 'number';

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C47A4F]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={resolvedImage}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div className="bg-white/95 backdrop-blur-lg px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/70 min-w-[70px] justify-center">
            <Hash className="w-3 h-3 text-[#c47a4f]" />
            <span className="text-xs font-semibold text-[#0f172a]">
              {typeof recipe.score === 'number' ? recipe.score.toFixed(2) : '—'}
            </span>
          </div>
          {shouldShowRankingBadge && (
            <div className="bg-white/90 px-3 py-0.5 rounded-full text-[11px] font-semibold text-[#c47a4f] shadow-sm border border-white/70">
              Peringkat #{rank}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3 flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-[#F0B84D]/20 text-[#b8862e] text-[10px] font-bold uppercase tracking-wider rounded-full">
            {recipe.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#333333] mb-2 leading-tight group-hover:text-[#C47A4F] transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{recipe.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
          
          <button className="p-2 rounded-full bg-gray-50 text-[#C47A4F] group-hover:bg-[#C47A4F] group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
