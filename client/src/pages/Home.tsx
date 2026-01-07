import { useState, useEffect } from 'react';
import { Search, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecipeDetail from '@/components/RecipeDetail';
import AdvancedSearch from '@/components/AdvancedSearch';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { decodeHtmlEntities, stripHtmlTags } from '@/lib/textUtils';

interface Recipe {
  id: string;
  title: string;
  badge: string;
  category: string;
  temperature: number | null;
  time_hours: number | null;
  content: string;
  searchText: string;
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    category: selectedCategory,
    ...tempRange,
    ...timeRange,
  });

  // Get unique categories
  const categories = Array.from(new Set(recipes.map(r => r.category))).sort();

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      beef: 'bg-red-100 text-red-800 border-red-300',
      poultry: 'bg-amber-100 text-amber-800 border-amber-300',
      seafood: 'bg-blue-100 text-blue-800 border-blue-300',
      vegetable: 'bg-green-100 text-green-800 border-green-300',
      other: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-secondary">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/images/pattern-accent.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ChefHat className="w-10 h-10 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                Sous Vide Cookbook
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Precision recipes for perfectly cooked meals. Discover the science and art of sous vide cooking.
            </p>
            
            {/* Hero Image */}
            <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/images/hero-banner.jpg" 
                alt="Sous vide cooking setup" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Filter by Category</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Recipes ({recipes.length})
                </Button>
                {categories.map(cat => {
                  const count = recipes.filter(r => r.category === cat).length;
                  return (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className="w-full justify-start capitalize"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Recipes */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
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
                <p className="text-muted-foreground text-lg">No recipes found. Try adjusting your search.</p>
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
                        {recipe.badge && (
                          <Badge className={`whitespace-nowrap ${getCategoryColor(recipe.category)}`}>
                            {decodeHtmlEntities(recipe.badge)}
                          </Badge>
                        )}
                      </div>

                      {/* Recipe Metadata */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {recipe.temperature && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">🌡️</span>
                            <span className="text-sm text-foreground">{recipe.temperature}°F</span>
                          </div>
                        )}
                        {recipe.time_hours && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">⏱️</span>
                            <span className="text-sm text-foreground">{recipe.time_hours}h</span>
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
      </section>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
