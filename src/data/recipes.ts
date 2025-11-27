import type { Recipe } from '../types/recipe';
import { scrapedRecipes } from './recipes-scraped';

const curatedRecipes: Recipe[] = [];

export const recipes: Recipe[] = [...curatedRecipes, ...scrapedRecipes];
