import { Outlet, useOutletContext } from 'react-router-dom';

interface SmartHubContextType {
  theme: {
    menu: string;
    menu_bg_opacity?: string;
    background: string;
    text: string;
    [key: string]: any;
  };
}

export default function Settings() {
  const context = useOutletContext<SmartHubContextType>();
  const theme = context?.theme;

  if (!theme) {
    return null;
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: 'calc(100vh - 60px)' // Subtract header height
      }}
    >
      {/* Settings Side Menu */}
      <div
        style={{
          width: '30%',
          height: '100vh',
          backgroundColor: theme.menu_bg_opacity || theme.menu,
          position: 'sticky',
          top: 0,
          left: 0,
          overflowY: 'auto',
          borderRight: '1px solid grey'
        }}
      >
        {/* Side menu content will go here */}
      </div>

      {/* Settings Content Area */}
      <div
        style={{
          flex: 1,
          width: '70%',
          overflowY: 'auto'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
