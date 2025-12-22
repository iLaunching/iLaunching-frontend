import React from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    background_opacity: string;
    global_button_hover: string;
    button_bk_color?: string;
    solid_color?: string;
  };
}

const Matrix: React.FC = () => {
  const { theme } = useOutletContext<SmartHubContextType>();
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = location.pathname === '/smart-hub/settings/matrix/active';
  const isArchivedRoute = location.pathname === '/smart-hub/settings/matrix/archived';

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
        {/* Matrix's Button */}
        <button
          onClick={() => navigate('/smart-hub/settings/matrix/active')}
          style={{
            backgroundColor: isActiveRoute ? (theme.button_bk_color || theme.solid_color || '#7F77F1') : 'transparent',
            color: isActiveRoute ? '#ffffff' : theme.text,
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
            if (!isActiveRoute) {
              e.currentTarget.style.backgroundColor = theme.global_button_hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActiveRoute) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Matrix's
        </button>

        {/* Archived Matrix's Button */}
        <button
          onClick={() => navigate('/smart-hub/settings/matrix/archived')}
          style={{
            backgroundColor: isArchivedRoute ? (theme.button_bk_color || theme.solid_color || '#7F77F1') : 'transparent',
            color: isArchivedRoute ? '#ffffff' : theme.text,
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
            if (!isArchivedRoute) {
              e.currentTarget.style.backgroundColor = theme.global_button_hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isArchivedRoute) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Archived Matrix's
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '70px 60px 60px 60px' 
      }}>
        {/* Active Matrix's Container - Only visible on /settings/matrix/active */}
        {isActiveRoute && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              marginBottom: '16px',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif'
            }}>
              Active Matrix's
            </h2>
          </div>
        )}

        {/* Archived Matrix's Container - Only visible on /settings/matrix/archived */}
        {isArchivedRoute && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              marginBottom: '16px',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif'
            }}>
              Archived Matrix's
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matrix;
