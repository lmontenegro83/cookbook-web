import { useState } from 'react';
import { ChevronDown, Book, Flame, Wind, Blend } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TableOfContentsProps {
  sections: {
    section: string;
    section_name: string;
    count: number;
    proteins: { protein: string; protein_name: string; count: number }[];
  }[];
  onSectionSelect: (section: string, protein?: string) => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'operational': <Book className="w-4 h-4" />,
  'sous-vide': <Flame className="w-4 h-4" />,
  'kamado': <Wind className="w-4 h-4" />,
  'hybrid': <Blend className="w-4 h-4" />,
  'appendix': <Book className="w-4 h-4" />,
};

const SECTION_COLORS: Record<string, string> = {
  'operational': 'text-blue-600 hover:text-blue-700',
  'sous-vide': 'text-orange-600 hover:text-orange-700',
  'kamado': 'text-red-600 hover:text-red-700',
  'hybrid': 'text-purple-600 hover:text-purple-700',
  'appendix': 'text-gray-600 hover:text-gray-700',
};

export default function TableOfContents({ sections, onSectionSelect }: TableOfContentsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['sous-vide', 'kamado'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
        Table of Contents
      </h3>
      
      {sections.map((section) => (
        <Collapsible
          key={section.section}
          open={expandedSections.has(section.section)}
          onOpenChange={() => toggleSection(section.section)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-2 px-3 text-left hover:bg-muted"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSections.has(section.section) ? 'rotate-180' : ''
                }`}
              />
              <span className={`${SECTION_COLORS[section.section]}`}>
                {SECTION_ICONS[section.section]}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{section.section_name}</div>
                <div className="text-xs text-muted-foreground">
                  {section.count} item{section.count !== 1 ? 's' : ''}
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pl-6 space-y-1 pt-2">
            {section.proteins.map((protein) => (
              <Button
                key={`${section.section}-${protein.protein}`}
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-1.5 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => onSectionSelect(section.section, protein.protein)}
              >
                <span className="flex-1 text-left">{protein.protein_name}</span>
                <span className="text-xs text-muted-foreground">
                  {protein.count}
                </span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
