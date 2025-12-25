import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface LoginPermissionOption {
  id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
  config?: {
    name: string;
    description: string;
  };
}

interface LoginPermissionsSelectorProps {
  currentPermissionId: number | null;
  onPermissionChange?: (permissionId: number) => void;
  textColor: string;
  borderLineColor: string;
  solidColor: string;
}

const LoginPermissionsSelector: React.FC<LoginPermissionsSelectorProps> = ({
  currentPermissionId,
  onPermissionChange,
  textColor,
  borderLineColor,
  solidColor,
}) => {
  const [permissions, setPermissions] = useState<LoginPermissionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(currentPermissionId);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    setSelectedPermissionId(currentPermissionId);
  }, [currentPermissionId]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'https://ilaunching-servers-production.up.railway.app/api/v1/option-values?option_set_name=login_permissions',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch login permissions');
      }

      const data = await response.json();
      
      // Fetch the config details for each permission
      const permissionsWithConfig = await Promise.all(
        data.map(async (perm: any) => {
          try {
            const configResponse = await fetch(
              `https://ilaunching-servers-production.up.railway.app/api/v1/theme-config/${perm.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            if (configResponse.ok) {
              const configData = await configResponse.json();
              return {
                ...perm,
                config: {
                  name: configData.name || perm.display_name,
                  description: configData.description || ''
                }
              };
            }
            
            // Silently handle 404s for missing theme configs
            if (configResponse.status === 404) {
              return {
                ...perm,
                config: {
                  name: perm.display_name,
                  description: ''
                }
              };
            }
          } catch (err) {
            // Only log non-404 errors
            console.error('Error fetching config for permission:', perm.id, err);
          }
          
          return {
            ...perm,
            config: {
              name: perm.display_name,
              description: ''
            }
          };
        })
      );

      setPermissions(permissionsWithConfig.sort((a, b) => a.sort_order - b.sort_order));
    } catch (error) {
      console.error('Error fetching login permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionSelect = (permissionId: number) => {
    console.log('🔐 LoginPermissionsSelector: Selected permission:', permissionId);
    setSelectedPermissionId(permissionId);
    
    if (onPermissionChange) {
      console.log('🔐 LoginPermissionsSelector: Calling onPermissionChange with:', permissionId);
      onPermissionChange(permissionId);
    } else {
      console.log('⚠️ LoginPermissionsSelector: onPermissionChange is not defined!');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          color: textColor,
          fontFamily: 'Work Sans, sans-serif',
          userSelect: 'none',
        }}
      >
        Loading permissions...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
      }}
    >
      {permissions.map((permission) => (
        <button
          key={permission.id}
          onClick={() => handlePermissionSelect(permission.id)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            paddingLeft: '0px',
            paddingRight: '16px',
            marginBottom: '5px',
            borderRadius: '8px',   
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Checkbox */}
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: `2px solid ${borderLineColor}`,
              backgroundColor: selectedPermissionId === permission.id ? solidColor : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              transition: 'all 0.2s',
            }}
          >
            {selectedPermissionId === permission.id && (
              <Check
                size={14}
                style={{
                  color: '#ffffff',
                  strokeWidth: 3,
                }}
              />
            )}
          </div>

          {/* Text Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: textColor,
                marginBottom: '4px',
                userSelect: 'none',
              }}
            >
              {permission.config?.name || permission.display_name}
            </div>
            {permission.config?.description && (
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: textColor,
                  opacity: 0.7,
                  lineHeight: '1.4',
                  userSelect: 'none',
                }}
              >
                {permission.config.description}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default LoginPermissionsSelector;
