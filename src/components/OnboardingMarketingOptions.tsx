import { useEffect, useState } from 'react';

interface MarketingOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
}

interface OnboardingMarketingOptionsProps {
  onSelect: (optionId: number, optionName: string) => void;
  selectedOptionId?: number;
  textColor?: string;
  borderLineColor?: string;
  globalHoverColor?: string;
  solidColor?: string;
}

export default function OnboardingMarketingOptions({
  onSelect,
  selectedOptionId,
  textColor = '#000000',
  borderLineColor = 'rgba(0, 0, 0, 0.15)',
  globalHoverColor = 'rgba(0, 0, 0, 0.05)',
  solidColor = '#7F77F1'
}: OnboardingMarketingOptionsProps) {
  const [options, setOptions] = useState<MarketingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = 'https://ilaunching-servers-production.up.railway.app/api/v1/marketing-options';
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.options && data.options.length > 0) {
            setOptions(data.options);
            
            // Set default selection to first option if no selection exists
            if (!selectedOptionId && data.options.length > 0) {
              console.log('Setting default marketing option:', data.options[0].option_value_id, data.options[0].value_name);
              onSelect(data.options[0].option_value_id, data.options[0].value_name);
            }
          } else {
            setError('No marketing options available');
          }
        } else {
          setError(`API Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to fetch marketing options:', error);
        setError('Failed to load options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [selectedOptionId, onSelect]);

  const handleOptionClick = (option: MarketingOption) => {
    onSelect(option.option_value_id, option.value_name);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          '--use-case-border-color': borderLineColor,
          '--use-case-hover-color': globalHoverColor,
          '--use-case-selected-color': solidColor
        } as React.CSSProperties}
      >
        {options.map((option) => {
          const isSelected = selectedOptionId === option.option_value_id;
          return (
            <button
              key={option.option_value_id}
              onClick={() => handleOptionClick(option)}
              className={`use-case-option ${isSelected ? 'selected' : ''}`}
              style={{ color: isSelected ? '#ffffff' : textColor }}
            >
              {option.display_name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
