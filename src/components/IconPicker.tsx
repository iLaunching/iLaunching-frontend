import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIcons, setTotalIcons] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Virtualization settings
  const COLUMN_COUNT = 10;
  const ICON_SIZE = 44; // 40px + 4px gap
  const CONTAINER_HEIGHT = 350; // Visible area height
  const OVERSCAN = 2; // Extra rows to render above/below viewport

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      
      // Only show loading spinner on initial open (when there are no icons yet)
      const isInitialLoad = icons.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }
      
      setCurrentPage(1);
      setHasMore(true);
      
      try {
        console.log(`IconPicker opened from context: ${context}`);
        console.log('Fetching icons from API...');
        
        // Build query params based on filters
        const params = new URLSearchParams();
        params.append('limit', '100');
        params.append('offset', '0');
        
        // Map category to prefix for API
        if (selectedCategory !== 'all') {
          const prefixMap: { [key: string]: string } = {
            'solid': 'fas',
            'regular': 'far',
            'brands': 'fab'
          };
          const prefix = prefixMap[selectedCategory];
          if (prefix) {
            params.append('prefix', prefix);
          }
        }
        
        // Add search if present
        if (debouncedSearchQuery) {
          params.append('search', debouncedSearchQuery);
        }
        
        const response = await api.get(`/icons?${params.toString()}`);
        console.log('Icons response:', response.data);
        console.log('Total available:', response.data.total);
        
        // Map API response to ensure id field is populated from option_value_id
        const iconList = (response.data.icons || []).map((icon: any) => ({
          ...icon,
          id: icon.option_value_id || icon.id
        }));
        
        console.log(`Loaded ${iconList.length} icons`);
        
        // Replace icons with new filtered results
        setIcons(iconList);
        setFilteredIcons(iconList);
        setTotalIcons(response.data.total || iconList.length);
        setHasMore(iconList.length < (response.data.total || 0));
      } catch (error) {
        console.error('Failed to fetch icons:', error);
        setIcons([]);
        setFilteredIcons([]);
        setTotalIcons(0);
        setHasMore(false);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchIcons();
  }, [isOpen, context, selectedCategory, debouncedSearchQuery]);

  // Load more icons when scrolling
  const loadMoreIcons = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const offset = icons.length;
      console.log(`Loading more icons with offset ${offset}...`);
      
      // Build query params with current filters
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('offset', offset.toString());
      
      // Map category to prefix for API
      if (selectedCategory !== 'all') {
        const prefixMap: { [key: string]: string } = {
          'solid': 'fas',
          'regular': 'far',
          'brands': 'fab'
        };
        const prefix = prefixMap[selectedCategory];
        if (prefix) {
          params.append('prefix', prefix);
        }
      }
      
      // Add search if present
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      
      const response = await api.get(`/icons?${params.toString()}`);
      
      const newIconList = (response.data.icons || []).map((icon: any) => ({
        ...icon,
        id: icon.option_value_id || icon.id
      }));
      
      if (newIconList.length > 0) {
        console.log(`Loaded ${newIconList.length} more icons (total: ${icons.length + newIconList.length}/${totalIcons})`);
        
        // Filter out duplicates by checking existing icon IDs
        const existingIds = new Set(icons.map(icon => icon.id));
        const uniqueNewIcons = newIconList.filter((icon: Icon) => !existingIds.has(icon.id));
        
        if (uniqueNewIcons.length > 0) {
          setIcons(prev => [...prev, ...uniqueNewIcons]);
          setFilteredIcons(prev => [...prev, ...uniqueNewIcons]);
          setCurrentPage(currentPage + 1);
          setHasMore(icons.length + uniqueNewIcons.length < totalIcons);
        } else {
          console.log('No new unique icons, stopping pagination');
          setHasMore(false);
        }
      } else {
        console.log('No more icons to load');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more icons:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, icons.length, totalIcons, debouncedSearchQuery, selectedCategory]);

  // Calculate visible range for virtualization
  const totalRows = Math.ceil(filteredIcons.length / COLUMN_COUNT);
  const startRow = Math.max(0, Math.floor(scrollTop / ICON_SIZE) - OVERSCAN);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ICON_SIZE) + OVERSCAN);
  const visibleIcons = filteredIcons.slice(
    startRow * COLUMN_COUNT,
    endRow * COLUMN_COUNT
  );
  const offsetY = startRow * ICON_SIZE;
  const totalHeight = totalRows * ICON_SIZE;

  const getIconDefinition = (icon: Icon): IconDefinition | null => {
    try {
      // Remove 'fa-' prefix if present
      const cleanName = icon.icon_name.startsWith('fa-') 
        ? icon.icon_name.slice(3) 
        : icon.icon_name;
      
      // Handle numeric icons (0-9) - they're just "fa0", "fa1", etc.
      if (/^\d+$/.test(cleanName)) {
        const iconKey = `fa${cleanName}`;
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
      }
      
      // Convert kebab-case to camelCase and add 'fa' prefix
      const camelCase = cleanName
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      // Capitalize first char
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
          height: '580px',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: `${textColor}20` }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: textColor, fontFamily: 'Work Sans, sans-serif' }}
          >
            Icon Library
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
        <div className="flex flex-col gap-4 p-6 flex-1 overflow-hidden">
          {/* Search Bar - Always visible */}
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

          {/* Category Tabs - Always visible */}
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

          {/* Icon Grid - Only this area shows loading */}
          {loading ? (
            <div className="flex items-center justify-center flex-1" style={{ color: textColor }}>
              Loading icons...
            </div>
          ) : (
            <>
              {/* Icon Grid - Virtualized Infinite Scroll */}
              <div 
                ref={scrollContainerRef}
                className="overflow-y-auto flex-1"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const currentScrollTop = target.scrollTop;
                  const scrollHeight = target.scrollHeight;
                  const clientHeight = target.clientHeight;
                  
                  // Update scroll position for virtualization
                  setScrollTop(currentScrollTop);
                  
                  // Load more when scrolled near bottom (within 200px)
                  if (scrollHeight - currentScrollTop - clientHeight < 200 && !loadingMore && hasMore) {
                    loadMoreIcons();
                  }
                }}
              >
                {filteredIcons.length === 0 ? (
                  <div className="flex items-center justify-center py-12" style={{ color: textColor }}>
                    No icons found
                  </div>
                ) : (
                  <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                    <div 
                      className="grid grid-cols-10 gap-2"
                      style={{
                        position: 'absolute',
                        top: `${offsetY}px`,
                        left: 0,
                        right: 0,
                      }}
                    >
                      {visibleIcons.map((icon, index) => {
                        const iconDef = getIconDefinition(icon);
                        if (!iconDef) return null;

                        const isSelected = currentIconId !== undefined && currentIconId === icon.id;
                        // Use combination of id and original index for unique key
                        const actualIndex = startRow * COLUMN_COUNT + index;
                        const uniqueKey = `icon-${icon.id}-${actualIndex}`;

                        return (
                          <button
                            key={uniqueKey}
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
                  </div>
                )}
              </div>

              {/* Footer with loading indicator */}
              <div
                className="text-xs text-center pt-2 border-t"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  borderColor: `${textColor}20`,
                }}
              >
                Showing {filteredIcons.length} of {totalIcons} icons
                {loadingMore && ' • Loading more...'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
