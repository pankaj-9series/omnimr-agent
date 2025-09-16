import React from 'react';
import { Suggestion } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface SuggestionPromptsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion, index: number) => void; // Updated to include index
  isLoading: boolean;
  isSuggestionsLoading: boolean;
  selectedSuggestionIndex: number | null; // Changed to index
}

const SuggestionPrompts: React.FC<SuggestionPromptsProps> = React.memo(({
  suggestions,
  onSelect,
  isLoading,
  isSuggestionsLoading,
  selectedSuggestionIndex,
}) => {
  if (isSuggestionsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
        <p className="ml-2 text-slate-500">Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.length === 0 && !isSuggestionsLoading && (
        <p className="text-slate-500 text-sm italic">No suggestions available yet. Type in a query to get started!</p>
      )}
      {suggestions.map((suggestion, index) => {
        const isSelected = index === selectedSuggestionIndex;
        const buttonClassName = `block w-full text-left p-3 border rounded-lg transition-colors duration-200 ease-in-out shadow-sm ${ 
          isSelected
            ? 'border-brand-accent-blue bg-blue-50 ring-1 ring-brand-accent-blue'
            : 'border-slate-200 hover:bg-slate-50'
        }`;

        return (
          <button
            key={index} // Use index as key
            onClick={() => onSelect(suggestion, index)}
            className={buttonClassName}
            disabled={isLoading} // Disable button if overall process is loading
          >
            <p className="text-sm font-semibold text-slate-800">{suggestion.chartConfig.options.plugins.title.text || suggestion.recommendation}</p>
            <p className="text-xs text-slate-600 mt-1">{suggestion.reasoning}</p>
          </button>
        );
      })}
    </div>
  );
});

export default SuggestionPrompts;
