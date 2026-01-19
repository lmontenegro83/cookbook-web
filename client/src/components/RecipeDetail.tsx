import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { decodeHtmlEntities } from '@/lib/textUtils';
import DOMPurify from 'dompurify';

interface Recipe {
  id: string;
  title: string;
  badge: string;
  section: string;
  section_name: string;
  protein: string;
  protein_name: string;
  cooking_methods?: string[];
  content_type?: string;
  temperature: number | null;
  time_hours: number | null;
  content: string;
  content_text: string;
  searchText: string;
  category?: string;
}

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

function sanitizeHtml(html: string | null | undefined) {
  return html
    ? DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['span', 'p'],
        ALLOWED_ATTR: ['class'],
      })
    : '';
}

export default function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  // Parse HTML content safely
  const parseContent = (html: string) => {
    // Create a temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp;
  };

  const contentDiv = parseContent(recipe.content);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-foreground mb-2">
                {recipe.title}
              </DialogTitle>
              {recipe.badge && (
                <p className="text-sm text-muted-foreground">{decodeHtmlEntities(recipe.badge)}</p>
              )}
            </div>

          </div>
        </DialogHeader>

        {/* Recipe Metadata */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
          {recipe.temperature && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-primary">Temperature</span>
              <span className="text-lg font-bold text-foreground">{recipe.temperature}°F</span>
            </div>
          )}
          {recipe.time_hours && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-primary">Cooking Time</span>
              <span className="text-lg font-bold text-foreground">{recipe.time_hours} hours</span>
            </div>
          )}
          {recipe.category !== 'other' && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-primary">Category</span>
              <span className="text-lg font-bold text-foreground capitalize">{recipe.category}</span>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="prose prose-sm max-w-none py-6 text-foreground">
          <div
            className="space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipe.content) }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="default"
            onClick={() => {
              // Copy recipe to clipboard
              const text = `${recipe.title}\n\nTemperature: ${recipe.temperature}°F\nTime: ${recipe.time_hours} hours\n\n${recipe.content.replace(/<[^>]*>/g, '')}`;
              navigator.clipboard.writeText(text);
              alert('Recipe copied to clipboard!');
            }}
            className="flex-1"
          >
            Copy Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
