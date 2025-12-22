import React, { useState } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import FullJourneyTierComponent from '@/components/FullJourneyTierComponent';

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    background_opacity: string;
    global_button_hover: string;
    border: string;
    button_bk_color?: string;
    button_text_color?: string;
    button_hover_color?: string;
    [key: string]: any;
  };
  smart_hub: {
    id: string;
    name: string;
    journey?: string;
    [key: string]: any;
  };
}

const Upgrade: React.FC = () => {
  const { theme, smart_hub } = useOutletContext<SmartHubContextType>();
  const location = useLocation();
  const navigate = useNavigate();

  const isJourneyRoute = location.pathname === '/smart-hub/settings/upgrade/journey';
  const isInvoicesRoute = location.pathname === '/smart-hub/settings/upgrade/invoices';

  const journey = smart_hub?.journey || 'Validate Journey';

  return (
    <div className="flex flex-col w-full h-full" style={{ position: 'relative' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky',
        top: '40px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 60px',
        backgroundColor: theme.background,
        zIndex: 10,
        borderBottom: `1px solid ${theme.background_opacity}`
      }}>
        {/* Journey Button */}
        <button
          onClick={() => navigate('/smart-hub/settings/upgrade/journey')}
          style={{
            backgroundColor: isJourneyRoute ? (theme.button_bk_color || theme.solid_color || '#7F77F1') : 'transparent',
            color: isJourneyRoute ? '#ffffff' : theme.text,
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            paddingLeft: '16px',
            paddingRight: '16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            height: '30px',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isJourneyRoute) {
              e.currentTarget.style.backgroundColor = theme.global_button_hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isJourneyRoute) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Journey
        </button>

        {/* Invoices Button */}
        <button
          onClick={() => navigate('/smart-hub/settings/upgrade/invoices')}
          style={{
            backgroundColor: isInvoicesRoute ? (theme.button_bk_color || theme.solid_color || '#7F77F1') : 'transparent',
            color: isInvoicesRoute ? '#ffffff' : theme.text,
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            paddingLeft: '16px',
            paddingRight: '16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            height: '30px',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isInvoicesRoute) {
              e.currentTarget.style.backgroundColor = theme.global_button_hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isInvoicesRoute) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Invoices
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '70px 60px 60px 60px' 
      }}>
        {/* Journey Container - Only visible on /settings/upgrade/journey */}
        {isJourneyRoute && (
          <div style={{ marginBottom: '40px' }}>
            {/* Row Container for H1 and Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
              marginBottom: '5px'
            }}>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 500, 
                color: theme.text,
                fontFamily: 'Work Sans, sans-serif',
                userSelect:'none',
                margin: 0
              }}>
                Upgrade to unleash the full potential of iLaunching
              </h1>

              {/* 30 Day Money Back Guarantee Button */}
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  padding: '8px 12px',
                  border: `1px solid ${theme.background_opacity}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  marginLeft: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.global_button_hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5 6.5L7 10L5.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                30 day money back guarantee
              </button>
            </div>

            <p style={{ 
              fontSize: '16px', 
              fontWeight: 400, 
              marginBottom: '32px',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif',
              maxWidth: '800px',
              lineHeight: '1.5',
              userSelect: 'none'
            }}>
              Your Smart Hub is currently on my {journey}. You have used 0/100 MB.
            </p>

            {/* Journey Tiers */}
            <FullJourneyTierComponent
              theme={theme}
              currentJourney={journey}
              onSelectTier={(tierName) => {
                console.log('Selected tier:', tierName);
                // TODO: Implement tier upgrade logic
              }}
            />
          </div>
        )}

        {/* Invoices Container - Only visible on /settings/upgrade/invoices */}
        {isInvoicesRoute && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              marginBottom: '16px',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif'
            }}>
              Invoices
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upgrade;
