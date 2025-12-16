import { Check } from 'lucide-react';

interface JourneyTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: string;
  features: string[];
  gradient: string;
  glowColor: string;
}

interface JourneyTierSelectorProps {
  selectedTier: string;
  onSelect: (tier: string) => void;
  textColor?: string;
}

const JOURNEY_TIERS: JourneyTier[] = [
  {
    id: 'validate',
    name: 'Validate Journey',
    displayName: 'Validate',
    description: 'Perfect for testing and validating your ideas',
    price: 'Free',
    features: [
      'Idea validation tools',
      'Basic analytics',
      'Community support',
      '1 Smart Matrix'
    ],
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
    glowColor: 'rgba(59, 130, 246, 0.2)'
  },
  {
    id: 'income',
    name: 'Income Journey',
    displayName: 'Income',
    description: 'Scale your validated idea into revenue',
    price: '$49/mo',
    features: [
      'Everything in Validate',
      'Advanced analytics',
      'Priority support',
      'Unlimited Smart Matrices',
      'Revenue tracking'
    ],
    gradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
    glowColor: 'rgba(147, 51, 234, 0.2)'
  },
  {
    id: 'team',
    name: 'Team Journey',
    displayName: 'Team',
    description: 'Build and scale with your team',
    price: '$149/mo',
    features: [
      'Everything in Income',
      'Team collaboration',
      'White-label options',
      'Dedicated support',
      'Custom integrations'
    ],
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)',
    glowColor: 'rgba(236, 72, 153, 0.2)'
  }
];

export default function JourneyTierSelector({
  selectedTier,
  onSelect,
  textColor = '#000000'
}: JourneyTierSelectorProps) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 24px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        {JOURNEY_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.name;
          
          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.name)}
              style={{
                position: 'relative',
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: isSelected 
                  ? '2px solid rgba(255, 255, 255, 0.2)'
                  : '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
                boxShadow: isSelected
                  ? `0 20px 40px rgba(0, 0, 0, 0.2), 0 0 40px ${tier.glowColor}`
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
                textAlign: 'left',
                fontFamily: 'Work Sans, sans-serif',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.12)`;
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Background gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: tier.gradient,
                opacity: isSelected ? 0.15 : 0.5,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }} />

              {/* Selected indicator */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  animation: 'scaleIn 0.3s ease'
                }}>
                  <Check size={16} color="white" strokeWidth={3} />
                </div>
              )}

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Tier name */}
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: isSelected ? '#ffffff' : '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  {tier.displayName}
                </div>

                {/* Price */}
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  marginBottom: '12px',
                  color: isSelected ? '#ffffff' : '#000000',
                  letterSpacing: '-0.03em'
                }}>
                  {tier.price}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: '13px',
                  marginBottom: '16px',
                  color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                  lineHeight: '1.5',
                  minHeight: '40px'
                }}>
                  {tier.description}
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tier.features.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'
                      }}
                    >
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: isSelected 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                          : 'rgba(0, 0, 0, 0.4)',
                        flexShrink: 0
                      }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
