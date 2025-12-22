import React from 'react';

interface TierFeature {
  text: string;
  included: boolean;
}

interface JourneyTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: TierFeature[];
  isPopular?: boolean;
}

interface FullJourneyTierComponentProps {
  theme: {
    text: string;
    background: string;
    border: string;
    global_button_hover: string;
    button_bk_color?: string;
    button_text_color?: string;
    button_hover_color?: string;
    [key: string]: any;
  };
  currentJourney?: string;
  onSelectTier?: (tierName: string) => void;
}

const FullJourneyTierComponent: React.FC<FullJourneyTierComponentProps> = ({
  theme,
  currentJourney = 'Validate Journey',
  onSelectTier
}) => {
  const tiers: JourneyTier[] = [
    {
      name: 'Validate Journey',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for testing and validating your ideas',
      features: [
        { text: 'Idea validation tools', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Community support', included: true },
        { text: '1 Smart Matrix', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false }
      ]
    },
    {
      name: 'Income Journey',
      price: '$49',
      period: 'per month',
      description: 'Scale your validated idea into revenue',
      features: [
        { text: 'Everything in Validate', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority support', included: true },
        { text: 'Unlimited Smart Matrices', included: true },
        { text: 'Revenue tracking', included: true },
        { text: 'Team collaboration', included: false }
      ],
      isPopular: true
    },
    {
      name: 'Team Journey',
      price: '$149',
      period: 'per month',
      description: 'Build and scale with your team',
      features: [
        { text: 'Everything in Income', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'White-label options', included: true },
        { text: 'Dedicated support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Unlimited everything', included: true }
      ]
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginTop: '40px'
    }}>
      {tiers.map((tier) => {
        const isCurrentTier = tier.name === currentJourney;
        
        return (
          <div
            key={tier.name}
            style={{
              backgroundColor: theme.background,
              border: `1px solid ${tier.isPopular ? (theme.button_bk_color || '#7F77F1') : theme.border}`,
              borderRadius: '12px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s ease',
              ...(tier.isPopular && {
                boxShadow: `0 0 0 1px ${theme.button_bk_color || '#7F77F1'}40`
              })
            }}
          >
            {tier.isPopular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: theme.button_bk_color || '#7F77F1',
                color: theme.button_text_color || '#ffffff',
                padding: '4px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                userSelect: 'none'
              }}>
                MOST POPULAR
              </div>
            )}

            {isCurrentTier && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: theme.global_button_hover,
                color: theme.text,
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                userSelect: 'none'
              }}>
                CURRENT
              </div>
            )}

            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif',
              marginBottom: '8px',
              userSelect: 'none'
            }}>
              {tier.name}
            </h3>

            <div style={{
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '40px',
                fontWeight: 700,
                color: theme.text,
                fontFamily: 'Work Sans, sans-serif'
              }}>
                {tier.price}
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 400,
                color: theme.text,
                fontFamily: 'Work Sans, sans-serif',
                opacity: 0.7,
                marginLeft: '8px'
              }}>
                {tier.period}
              </span>
            </div>

            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif',
              opacity: 0.8,
              marginBottom: '24px',
              userSelect: 'none'
            }}>
              {tier.description}
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
              flex: 1
            }}>
              {tier.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      flexShrink: 0,
                      opacity: feature.included ? 1 : 0.3
                    }}
                  >
                    {feature.included ? (
                      <path
                        d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
                        fill={theme.button_bk_color || '#7F77F1'}
                      />
                    ) : (
                      <path
                        d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.3"
                      />
                    )}
                    {feature.included && (
                      <path
                        d="M10.5 6.5L7 10L5.5 8.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.text,
                      fontFamily: 'Work Sans, sans-serif',
                      opacity: feature.included ? 1 : 0.5,
                      userSelect: 'none'
                    }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTier && onSelectTier(tier.name)}
              disabled={isCurrentTier}
              style={{
                backgroundColor: isCurrentTier 
                  ? 'transparent' 
                  : (tier.isPopular ? (theme.button_bk_color || '#7F77F1') : 'transparent'),
                color: isCurrentTier 
                  ? theme.text 
                  : (tier.isPopular ? (theme.button_text_color || '#ffffff') : theme.text),
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                border: isCurrentTier ? `1px solid ${theme.border}` : (tier.isPopular ? 'none' : `1px solid ${theme.border}`),
                borderRadius: '8px',
                cursor: isCurrentTier ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                opacity: isCurrentTier ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isCurrentTier) {
                  if (tier.isPopular) {
                    e.currentTarget.style.backgroundColor = theme.button_hover_color || '#6B63DD';
                  } else {
                    e.currentTarget.style.backgroundColor = theme.global_button_hover;
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrentTier) {
                  if (tier.isPopular) {
                    e.currentTarget.style.backgroundColor = theme.button_bk_color || '#7F77F1';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }
              }}
            >
              {isCurrentTier ? 'Current Plan' : 'Upgrade to ' + tier.name}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FullJourneyTierComponent;
