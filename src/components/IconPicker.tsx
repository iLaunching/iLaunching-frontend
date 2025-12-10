import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as regularIcons from "@fortawesome/free-regular-svg-icons";
import * as brandIcons from "@fortawesome/free-brands-svg-icons";
import { Search, X } from "lucide-react";
import api from "@/lib/api";

interface Icon {
  id: number;
  option_value_id?: number; // API returns this field
  value_name: string;
  display_name: string;
  icon_name: string;
  icon_prefix: 'fas' | 'far' | 'fab';
  icon_category: string;
}

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentIconId?: number;
  onIconSelect: (iconId: number) => void;
  textColor: string;
  menuColor: string;
  titleColor: string;
  globalButtonHover: string;
  context?: 'user-profile' | 'hub-settings' | 'other';
  toneButtonBkColor?: string;
  toneButtonTextColor?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({
  isOpen,
  onClose,
  currentIconId,
  onIconSelect,
  textColor,
  menuColor,
  titleColor,
  globalButtonHover,
  context = 'user-profile',
  toneButtonBkColor,
  toneButtonTextColor,
}) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle icon selection based on context
  const handleIconSelect = (iconId: number) => {
    console.log('=== IconPicker handleIconSelect CALLED ===');
    console.log(`Icon selected (id: ${iconId}) from context: ${context}`);
    console.log('Calling onIconSelect callback with iconId:', iconId);
    
    // Execute context-specific workflow
    switch (context) {
      case 'user-profile':
        console.log('✅ Executing user-profile icon update workflow');
        console.log('About to call onIconSelect function:', typeof onIconSelect);
        onIconSelect(iconId);
        console.log('✅ onIconSelect called successfully');
        break;
      case 'hub-settings':
        console.log('Executing hub-settings icon update workflow');
        onIconSelect(iconId);
        break;
      default:
        console.log('Executing default icon selection workflow');
        onIconSelect(iconId);
    }
    
    console.log('Closing IconPicker modal');
    onClose();
    console.log('=== IconPicker handleIconSelect COMPLETED ===');
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchIcons = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        console.log(`IconPicker opened from context: ${context}`);
        console.log('Fetching icons from API...');
        const response = await api.get('/icons');
        console.log('Icons response:', response.data);
        
        // Map API response to ensure id field is populated from option_value_id
        const iconList = (response.data.icons || []).map((icon: any) => ({
          ...icon,
          id: icon.option_value_id || icon.id // Use option_value_id if available, fallback to id
        }));
        console.log(`Loaded ${iconList.length} icons`);
        console.log('First 3 icons (mapped with id):', iconList.slice(0, 3));
        
        setIcons(iconList);
        setFilteredIcons(iconList);
      } catch (error) {
        console.error('Failed to fetch icons:', error);
        setIcons([]);
        setFilteredIcons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, [isOpen, context]);

  useEffect(() => {
    let filtered = icons;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon => icon.icon_category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(icon =>
        icon.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.icon_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIcons(filtered);
  }, [searchQuery, selectedCategory, icons]);

  const getIconDefinition = (icon: Icon): IconDefinition | null => {
    try {
      // Remove 'fa-' prefix if present
      const cleanName = icon.icon_name.startsWith('fa-') 
        ? icon.icon_name.slice(3) 
        : icon.icon_name;
      
      // Convert kebab-case to camelCase and add 'fa' prefix
      const camelCase = cleanName
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      // Handle single character names (0-9, a-z) - capitalize first char
      const capitalizedCamelCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
      const iconKey = `fa${capitalizedCamelCase}`;

      let iconDef: IconDefinition | undefined;
      
      if (icon.icon_prefix === 'fas') {
        iconDef = solidIcons[iconKey as keyof typeof solidIcons] as IconDefinition;
      } else if (icon.icon_prefix === 'far') {
        iconDef = regularIcons[iconKey as keyof typeof regularIcons] as IconDefinition;
      } else if (icon.icon_prefix === 'fab') {
        iconDef = brandIcons[iconKey as keyof typeof brandIcons] as IconDefinition;
      }
      
      if (!iconDef) {
        console.warn(`Icon not found: ${icon.icon_name} -> ${iconKey} (prefix: ${icon.icon_prefix})`);
      }
      
      return iconDef || null;
    } catch (error) {
      console.error(`Error loading icon: ${icon.icon_name}`, error);
    }
    return null;
  };

  const categories = ['all', 'solid', 'regular', 'brands'];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10002]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={modalRef}
        className="rounded-xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: menuColor,
          width: '600px',
          maxHeight: '700px',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: `${textColor}20` }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: titleColor, fontFamily: 'Work Sans, sans-serif' }}
          >
            Select Icon
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = globalButtonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12" style={{ color: textColor }}>
              Loading icons...
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: textColor }}
                />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border-0 outline-none"
                  style={{
                    backgroundColor: `${textColor}10`,
                    color: textColor,
                    fontSize: '14px',
                    fontFamily: 'Work Sans, sans-serif',
                  }}
                />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-4 py-2 rounded-md transition-colors capitalize text-sm font-medium"
                    style={{
                      backgroundColor: selectedCategory === category ? globalButtonHover : 'transparent',
                      color: textColor,
                      fontFamily: 'Work Sans, sans-serif',
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Icon Grid */}
              <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
                {filteredIcons.length === 0 ? (
                  <div className="flex items-center justify-center py-12" style={{ color: textColor }}>
                    No icons found
                  </div>
                ) : (
                  <div className="grid grid-cols-10 gap-2">
                    {filteredIcons.map((icon) => {
                      const iconDef = getIconDefinition(icon);
                      if (!iconDef) return null;

                      // Only mark as selected if currentIconId is defined and matches
                      const isSelected = currentIconId !== undefined && currentIconId === icon.id;

                      return (
                        <button
                          key={icon.id}
                          onClick={() => {
                            console.log('Icon button clicked:', { 
                              iconId: icon.id, 
                              iconName: icon.display_name,
                              iconObject: icon 
                            });
                            handleIconSelect(icon.id);
                          }}
                          className="flex items-center justify-center rounded-md transition-all"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: isSelected ? (toneButtonBkColor || globalButtonHover) : 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: isSelected ? (toneButtonTextColor || textColor) : textColor,
                          }}
                          title={icon.display_name}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = globalButtonHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={iconDef} size="lg" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="text-xs text-center pt-2 border-t"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  borderColor: `${textColor}20`,
                }}
              >
                Showing {filteredIcons.length} of {icons.length} icons
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
