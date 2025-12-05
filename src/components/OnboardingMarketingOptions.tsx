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
}

export default function OnboardingMarketingOptions({
  onSelect,
  selectedOptionId,
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
  }, []);

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
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.option_value_id}
            onClick={() => handleOptionClick(option)}
            className={`
              px-4 py-3 rounded-lg text-left transition-all duration-200
              border-2
              ${
                selectedOptionId === option.option_value_id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
              }
            `}
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            <span className="text-sm font-medium">{option.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
