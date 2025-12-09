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
}) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

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
      try {
        const response = await api.get('/icons', {
          params: { limit: 100 } // Load first 100 icons for performance
        });
        setIcons(response.data.icons || []);
        setFilteredIcons(response.data.icons || []);
      } catch (error) {
        console.error('Failed to fetch icons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, []);

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
      // Convert kebab-case to camelCase and add 'fa' prefix
      const camelCase = icon.icon_name
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const iconKey = `fa${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`;

      if (icon.icon_prefix === 'fas') {
        return solidIcons[iconKey as keyof typeof solidIcons] as IconDefinition;
      } else if (icon.icon_prefix === 'far') {
        return regularIcons[iconKey as keyof typeof regularIcons] as IconDefinition;
      } else if (icon.icon_prefix === 'fab') {
        return brandIcons[iconKey as keyof typeof brandIcons] as IconDefinition;
      }
    } catch (error) {
      console.warn(`Icon not found: ${icon.icon_name}`);
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
                <div className="grid grid-cols-10 gap-2">
                  {filteredIcons.map((icon) => {
                    const iconDef = getIconDefinition(icon);
                    if (!iconDef) return null;

                    const isSelected = currentIconId === icon.id;

                    return (
                      <button
                        key={icon.id}
                        onClick={() => {
                          onIconSelect(icon.id);
                          onClose();
                        }}
                        className="flex items-center justify-center rounded-md transition-all"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: isSelected ? globalButtonHover : 'transparent',
                          border: isSelected ? `2px solid ${textColor}` : '2px solid transparent',
                          color: textColor,
                        }}
                        title={icon.display_name}
                      >
                        <FontAwesomeIcon icon={iconDef} size="lg" />
                      </button>
                    );
                  })}
                </div>

                {filteredIcons.length === 0 && (
                  <div
                    className="text-center py-12 text-sm"
                    style={{ color: textColor, fontFamily: 'Work Sans, sans-serif' }}
                  >
                    No icons found
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
