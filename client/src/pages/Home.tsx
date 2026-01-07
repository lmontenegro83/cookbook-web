import { useState, useEffect, useMemo } from 'react';
import { Search, ChefHat, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecipeDetail from '@/components/RecipeDetail';
import AdvancedSearch from '@/components/AdvancedSearch';
import TableOfContents from '@/components/TableOfContents';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { decodeHtmlEntities, stripHtmlTags } from '@/lib/textUtils';

interface Recipe {
  id: string;
  title: string;
  badge: string;
  section: string;
  section_name: string;
  protein: string;
  protein_name: string;
  cooking_method: string;
  cooking_method_name: string;
  temperature: number | null;
  time_hours: number | null;
  content: string;
  searchText: string;
  category?: string; // For backward compatibility with search hook
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempRange, setTempRange] = useState<{ minTemp?: number; maxTemp?: number }>({});
  const [timeRange, setTimeRange] = useState<{ minTime?: number; maxTime?: number }>({});

  // Load recipes from JSON
  useEffect(() => {
    fetch('/recipes.json')
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load recipes:', err);
        setLoading(false);
      });
  }, []);

  // Filter and search recipes using custom hook
  const filteredRecipes = useRecipeSearch(recipes, {
    query: searchQuery,
    category: 'all',
    ...tempRange,
    ...timeRange,
  }).filter(recipe => {
    if (selectedSection && recipe.section !== selectedSection) return false;
    if (selectedProtein && recipe.protein !== selectedProtein) return false;
    return true;
  });

  // Build table of contents structure
  const tocSections = useMemo(() => {
    const sections: Record<string, { section: string; section_name: string; proteins: Record<string, { protein: string; protein_name: string; count: number }> }> = {};

    recipes.forEach(recipe => {
      if (!sections[recipe.section]) {
        sections[recipe.section] = {
          section: recipe.section,
          section_name: recipe.section_name,
          proteins: {}
        };
      }

      if (!sections[recipe.section].proteins[recipe.protein]) {
        sections[recipe.section].proteins[recipe.protein] = {
          protein: recipe.protein,
          protein_name: recipe.protein_name,
          count: 0
        };
      }

      sections[recipe.section].proteins[recipe.protein].count += 1;
    });

    return Object.values(sections).map(section => ({
      ...section,
      count: Object.values(section.proteins).reduce((sum, p) => sum + p.count, 0),
      proteins: Object.values(section.proteins)
    }));
  }, [recipes]);

  const getSectionColor = (section: string): string => {
    const colors: Record<string, string> = {
      operational: 'bg-blue-50 text-blue-800 border-blue-200',
      'sous-vide': 'bg-orange-50 text-orange-800 border-orange-200',
      kamado: 'bg-red-50 text-red-800 border-red-200',
      hybrid: 'bg-purple-50 text-purple-800 border-purple-200',
      appendix: 'bg-gray-50 text-gray-800 border-gray-200',
    };
    return colors[section] || colors.operational;
  };

  const handleSectionSelect = (section: string, protein?: string) => {
    setSelectedSection(section);
    setSelectedProtein(protein || null);
  };

  const clearFilters = () => {
    setSelectedSection(null);
    setSelectedProtein(null);
    setSearchQuery('');
    setTempRange({});
    setTimeRange({});
  };

  const hasActiveFilters = selectedSection || selectedProtein || searchQuery || tempRange.minTemp || timeRange.minTime;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <div className="relative py-12 px-4 md:py-16 md:px-6 lg:py-20 bg-gradient-to-b from-muted/50 to-background border-b border-border">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Sous Vide Cookbook
            </h1>
          </div>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            Precision recipes for perfectly cooked meals. Discover the science and art of sous vide, kamado grilling, and hybrid cooking techniques.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <TableOfContents sections={tocSections} onSectionSelect={handleSectionSelect} />
            </div>
          </aside>

          {/* Main Content - Recipes */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search recipes by name, ingredient, or technique..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-base border-2 border-border focus:border-primary"
                />
              </div>

              {/* Advanced Search */}
              <AdvancedSearch
                onFilterChange={(filters) => {
                  setTempRange({
                    minTemp: filters.minTemp,
                    maxTemp: filters.maxTemp,
                  });
                  setTimeRange({
                    minTime: filters.minTime,
                    maxTime: filters.maxTime,
                  });
                }}
              />

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedSection && (
                    <Badge variant="secondary" className="gap-1">
                      {tocSections.find(s => s.section === selectedSection)?.section_name}
                      <button
                        onClick={() => setSelectedSection(null)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedProtein && (
                    <Badge variant="secondary" className="gap-1">
                      {recipes.find(r => r.protein === selectedProtein)?.protein_name}
                      <button
                        onClick={() => setSelectedProtein(null)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading recipes...</p>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recipes found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRecipes.map(recipe => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-border overflow-hidden"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground flex-1 line-clamp-2">
                          {recipe.title}
                        </h3>
                        <Badge className={`whitespace-nowrap ${getSectionColor(recipe.section)}`}>
                          {recipe.section_name}
                        </Badge>
                      </div>

                      {/* Recipe Metadata */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {recipe.temperature && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-primary">Temperature</span>
                            <span className="text-sm font-bold text-foreground">{recipe.temperature}°F</span>
                          </div>
                        )}
                        {recipe.time_hours && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-primary">Time</span>
                            <span className="text-sm font-bold text-foreground">{recipe.time_hours}h</span>
                          </div>
                        )}
                        {recipe.protein !== 'other' && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-primary">Protein</span>
                            <span className="text-sm font-bold text-foreground">{recipe.protein_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {stripHtmlTags(recipe.content).substring(0, 120)}...
                      </p>

                      <Button
                        variant="default"
                        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecipe(recipe);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}
