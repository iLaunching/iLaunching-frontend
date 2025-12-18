import { useEffect, useState, useMemo, memo } from 'react';

interface UseCaseOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
}

interface SmartHubUserCaseProps {
  onSelect: (optionId: number, optionName: string) => void;
  selectedOptionId?: number;
  textColor?: string;
  borderLineColor?: string;
  globalHoverColor?: string;
  solidColor?: string;
}

export default function SmartHubUserCase({
  onSelect,
  selectedOptionId,
  textColor = '#000000',
  borderLineColor = 'rgba(0, 0, 0, 0.15)',
  globalHoverColor = 'rgba(0, 0, 0, 0.05)',
  solidColor = '#7F77F1'
}: SmartHubUserCaseProps) {
  const [options, setOptions] = useState<UseCaseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchOptions = async () => {
      try {
        const apiUrl = 'https://ilaunching-servers-production.up.railway.app/api/v1/use-case-options';
        const response = await fetch(apiUrl);
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.options && data.options.length > 0) {
            setOptions(data.options);
            
            // Set default selection to "start a business" if no selection exists
            if (!selectedOptionId) {
              const startBusinessOption = data.options.find(
                (opt: UseCaseOption) => opt.value_name === 'start_business'
              );
              if (startBusinessOption) {
                onSelect(startBusinessOption.option_value_id, startBusinessOption.value_name);
              }
            }
          } else {
            setError('No use case options available');
          }
        } else {
          setError(`API Error: ${response.status}`);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch use case options:', error);
        setError('Failed to load options');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOptions();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOptionClick = useMemo(() => (optionId: number, valueName: string) => {
    onSelect(optionId, valueName);
  }, [onSelect]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 0'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderTop: '3px solid #000000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c00',
        fontSize: '14px'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 24px',
      '--use-case-border-color': borderLineColor,
      '--use-case-hover-color': globalHoverColor,
      '--use-case-selected-color': solidColor
    } as React.CSSProperties}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {options.map((option) => {
          const isSelected = selectedOptionId === option.option_value_id;
          
          return (
            <button
              key={option.option_value_id}
              onClick={() => handleOptionClick(option.option_value_id, option.value_name)}
              className={`use-case-option ${isSelected ? 'selected' : ''}`}
              style={{
                color: isSelected ? '#ffffff' : textColor
              }}
            >
              {option.display_name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
