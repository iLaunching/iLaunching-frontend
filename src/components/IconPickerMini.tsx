import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Ban } from 'lucide-react';
import {
  faUser,
  faHeart,
  faStar,
  faHome,
  faBriefcase,
  faGraduationCap,
  faCamera,
  faMusic,
  faGamepad,
  faCoffee,
  faPizzaSlice,
  faBicycle,
  faCar,
  faPlane,
  faRocket,
  faPalette,
  faCode,
  faLaptop,
  faMobileAlt,
  faHeadphones,
  faBook,
  faPencilAlt,
  faLightbulb,
  faTrophy,
  faMedal,
  faCrown,
  faGem,
  faFire,
  faBolt,
  faMagic,
  faTree,
  faDog,
  faCat,
  faFish,
  faBug,
} from '@fortawesome/free-solid-svg-icons';

interface IconPickerMiniProps {
  currentIconId?: number;
  onIconSelect: (iconId: number) => void;
  onMoreClick: () => void;
  onClearIcon: () => void;
  textColor: string;
  globalButtonHover: string;
}

// Pre-defined 35 popular icons with their IDs (will be mapped from API)
// First item is clear button, followed by 35 icons
const popularIcons: { icon?: IconDefinition; name: string; id: number | null; isClear?: boolean }[] = [
  { name: 'clear', id: null, isClear: true },
  { icon: faUser, name: 'user', id: 1174 },
  { icon: faHeart, name: 'heart', id: 484 },
  { icon: faStar, name: 'star', id: 1491 },
  { icon: faHome, name: 'home', id: 1111 },
  { icon: faBriefcase, name: 'briefcase', id: 1843 },
  { icon: faGraduationCap, name: 'graduation-cap', id: 1497 },
  { icon: faCamera, name: 'camera', id: 341 },
  { icon: faMusic, name: 'music', id: 1665 },
  { icon: faGamepad, name: 'gamepad', id: 1931 },
  { icon: faCoffee, name: 'coffee', id: 1503 },
  { icon: faPizzaSlice, name: 'pizza-slice', id: 1361 },
  { icon: faBicycle, name: 'bicycle', id: 944 },
  { icon: faCar, name: 'car', id: 132 },
  { icon: faPlane, name: 'plane', id: 1309 },
  { icon: faRocket, name: 'rocket', id: 473 },
  { icon: faPalette, name: 'palette', id: 303 },
  { icon: faCode, name: 'code', id: 802 },
  { icon: faLaptop, name: 'laptop', id: 653 },
  { icon: faMobileAlt, name: 'mobile-alt', id: 1088 },
  { icon: faHeadphones, name: 'headphones', id: 1383 },
  { icon: faBook, name: 'book', id: 452 },
  { icon: faPencilAlt, name: 'pencil-alt', id: 779 },
  { icon: faLightbulb, name: 'lightbulb', id: 796 },
  { icon: faTrophy, name: 'trophy', id: 191 },
  { icon: faMedal, name: 'medal', id: 136 },
  { icon: faCrown, name: 'crown', id: 723 },
  { icon: faGem, name: 'gem', id: 1038 },
  { icon: faFire, name: 'fire', id: 540 },
  { icon: faBolt, name: 'bolt', id: 1738 },
  { icon: faMagic, name: 'magic', id: 1156 },
  { icon: faTree, name: 'tree', id: 314 },
  { icon: faDog, name: 'dog', id: 82 },
  { icon: faCat, name: 'cat', id: 1981 },
  { icon: faFish, name: 'fish', id: 1370 },
  { icon: faBug, name: 'bug', id: 1545 },
];

const IconPickerMini: React.FC<IconPickerMiniProps> = ({
  currentIconId,
  onIconSelect,
  onMoreClick,
  onClearIcon,
  textColor,
  globalButtonHover,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Icon Grid - 6 columns for compact display (36 items: 1 clear + 35 icons) */}
      <div className="grid grid-cols-6 gap-2">
        {popularIcons.map((item) => {
          const isSelected = currentIconId === item.id;

          // Special handling for clear button (first item)
          if (item.isClear) {
            return (
              <button
                key="clear"
                onClick={onClearIcon}
                className="flex items-center justify-center rounded-md transition-all"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: 'transparent',
                  border: '2px solid transparent',
                  color: textColor,
                }}
                title="Clear Icon"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = globalButtonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Ban size={16} />
              </button>
            );
          }

          // Regular icon button
          return (
            <button
              key={item.id}
              onClick={() => item.id && onIconSelect(item.id)}
              className="flex items-center justify-center rounded-md transition-all"
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: isSelected ? globalButtonHover : 'transparent',
                border: isSelected ? `2px solid ${textColor}` : '2px solid transparent',
                color: textColor,
              }}
              title={item.name}
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
              {item.icon && <FontAwesomeIcon icon={item.icon} size="sm" />}
            </button>
          );
        })}
      </div>

      {/* More Button */}
      <button
        onClick={onMoreClick}
        className="w-full rounded-md transition-colors text-sm font-medium"
        style={{
          backgroundColor: 'transparent',
          color: textColor,
          fontFamily: 'Work Sans, sans-serif',
          border: `1px solid ${textColor}40`,
          height: '35px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = globalButtonHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        More Icons
      </button>
    </div>
  );
};

export default IconPickerMini;
