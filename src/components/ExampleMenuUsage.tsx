import DropdownMenu, { type MenuOption } from './DropdownMenu';
import { FileText, Download, Share, Trash2, Copy, Edit } from 'lucide-react';

// Example usage of the DropdownMenu component

export function ExampleMenuUsage() {
  // Define your menu options
  const fileMenuOptions: MenuOption[] = [
    {
      id: 'new',
      label: 'New Document',
      icon: <FileText size={16} />,
      onClick: () => alert('New document clicked'),
    },
    {
      id: 'copy',
      label: 'Copy to Clipboard',
      icon: <Copy size={16} />,
      onClick: () => navigator.clipboard.writeText('Copied!'),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit size={16} />,
      onClick: () => console.log('Edit clicked'),
    },
    {
      id: 'download',
      label: 'Download',
      icon: <Download size={16} />,
      onClick: () => console.log('Download started'),
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share size={16} />,
      onClick: () => console.log('Share dialog opened'),
      disabled: false, // Can be toggled based on conditions
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: () => confirm('Are you sure you want to delete?'),
      className: 'text-red-600 hover:bg-red-50', // Custom styling for dangerous actions
    },
  ];

  const quickActions: MenuOption[] = [
    {
      id: 'save',
      label: 'Save',
      onClick: () => alert('Saved!'),
    },
    {
      id: 'undo',
      label: 'Undo',
      onClick: () => alert('Undone!'),
    },
    {
      id: 'redo',
      label: 'Redo',
      onClick: () => alert('Redone!'),
      disabled: true, // Example of disabled option
    },
  ];

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {/* Basic menu with icon trigger */}
      <DropdownMenu
        trigger={<FileText size={16} />}
        options={fileMenuOptions}
        position="bottom"
        showChevron={true}
      />

      {/* Menu with text trigger */}
      <DropdownMenu
        trigger="File Actions"
        options={fileMenuOptions}
        position="bottom"
        showChevron={true}
        triggerClassName="custom-trigger"
      />

      {/* Menu positioned to the right */}
      <DropdownMenu
        trigger="Quick Actions →"
        options={quickActions}
        position="right"
      />

      {/* Menu positioned to the top */}
      <DropdownMenu
        trigger="↑ Top Menu"
        options={quickActions}
        position="top"
      />

      {/* Custom styled menu */}
      <DropdownMenu
        trigger={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            border: 'none'
          }}>
            <FileText size={16} />
            Custom Style
          </div>
        }
        options={fileMenuOptions}
        triggerClassName="custom-gradient-trigger"
      />
    </div>
  );
}

export default ExampleMenuUsage;