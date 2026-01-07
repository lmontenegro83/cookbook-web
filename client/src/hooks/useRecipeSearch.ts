import { useMemo } from 'react';

interface Recipe {
  id: string;
  title: string;
  badge: string;
  section: string;
  section_name: string;
  protein: string;
  protein_name: string;
  cooking_method?: string;
  cooking_method_name?: string;
  temperature: number | null;
  time_hours: number | null;
  content: string;
  content_text: string;
  searchText: string;
  category?: string;
}

interface SearchOptions {
  query: string;
  category: string;
  minTemp?: number;
  maxTemp?: number;
  minTime?: number;
  maxTime?: number;
}

/**
 * Custom hook for advanced recipe searching with full-text search
 * and multiple filter options.
 * 
 * Design Philosophy: Modern Culinary Minimalism
 * - Precision: Fast, accurate search results
 * - Clarity: Clear filtering options
 * - Efficiency: Memoized calculations for performance
 */
export function useRecipeSearch(recipes: Recipe[], options: SearchOptions) {
  return useMemo(() => {
    let results = recipes;

    // Full-text search
    if (options.query.trim()) {
      const query = options.query.toLowerCase();
      results = results.filter(recipe => {
        // Search in title, badge, and content
        return (
          recipe.title.toLowerCase().includes(query) ||
          recipe.badge.toLowerCase().includes(query) ||
          recipe.content.toLowerCase().includes(query)
        );
      });
    }

    // Category filter
    if (options.category !== 'all') {
      results = results.filter(recipe => recipe.category === options.category);
    }

    // Temperature range filter
    if (options.minTemp !== undefined || options.maxTemp !== undefined) {
      results = results.filter(recipe => {
        if (recipe.temperature === null) return false;
        if (options.minTemp !== undefined && recipe.temperature < options.minTemp) return false;
        if (options.maxTemp !== undefined && recipe.temperature > options.maxTemp) return false;
        return true;
      });
    }

    // Time range filter
    if (options.minTime !== undefined || options.maxTime !== undefined) {
      results = results.filter(recipe => {
        if (recipe.time_hours === null) return false;
        if (options.minTime !== undefined && recipe.time_hours < options.minTime) return false;
        if (options.maxTime !== undefined && recipe.time_hours > options.maxTime) return false;
        return true;
      });
    }

    return results;
  }, [recipes, options.query, options.category, options.minTemp, options.maxTemp, options.minTime, options.maxTime]);
}
