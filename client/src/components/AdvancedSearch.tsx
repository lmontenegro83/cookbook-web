import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AdvancedSearchProps {
  onFilterChange: (filters: {
    minTemp?: number;
    maxTemp?: number;
    minTime?: number;
    maxTime?: number;
  }) => void;
}

export default function AdvancedSearch({ onFilterChange }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<[number, number]>([120, 210]);
  const [timeRange, setTimeRange] = useState<[number, number]>([1, 48]);

  const handleTempChange = (value: number[]) => {
    const newRange = [value[0], value[1]] as [number, number];
    setTempRange(newRange);
    onFilterChange({
      minTemp: newRange[0],
      maxTemp: newRange[1],
      minTime: timeRange[0],
      maxTime: timeRange[1],
    });
  };

  const handleTimeChange = (value: number[]) => {
    const newRange = [value[0], value[1]] as [number, number];
    setTimeRange(newRange);
    onFilterChange({
      minTemp: tempRange[0],
      maxTemp: tempRange[1],
      minTime: newRange[0],
      maxTime: newRange[1],
    });
  };

  const handleReset = () => {
    setTempRange([120, 210]);
    setTimeRange([1, 48]);
    onFilterChange({});
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span>Advanced Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-6">
        {/* Temperature Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">
              Temperature Range
            </label>
            <span className="text-sm text-muted-foreground">
              {tempRange[0]}°F - {tempRange[1]}°F
            </span>
          </div>
          <Slider
            min={100}
            max={220}
            step={5}
            value={tempRange}
            onValueChange={handleTempChange}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Adjust the temperature range to find recipes that match your preferences
          </p>
        </div>

        {/* Time Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">
              Cooking Time
            </label>
            <span className="text-sm text-muted-foreground">
              {timeRange[0]}h - {timeRange[1]}h
            </span>
          </div>
          <Slider
            min={1}
            max={72}
            step={1}
            value={timeRange}
            onValueChange={handleTimeChange}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Find recipes based on how much time you have available
          </p>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full"
        >
          Reset Filters
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
