import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
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
} from '@fortawesome/free-solid-svg-icons';

interface IconPickerMiniProps {
  currentIconId?: number;
  onIconSelect: (iconId: number) => void;
  onMoreClick: () => void;
  textColor: string;
  globalButtonHover: string;
}

// Pre-defined 30 popular icons with their IDs (will be mapped from API)
const popularIcons: { icon: IconDefinition; name: string; id: number }[] = [
  { icon: faUser, name: 'user', id: 1 },
  { icon: faHeart, name: 'heart', id: 2 },
  { icon: faStar, name: 'star', id: 3 },
  { icon: faHome, name: 'home', id: 4 },
  { icon: faBriefcase, name: 'briefcase', id: 5 },
  { icon: faGraduationCap, name: 'graduation-cap', id: 6 },
  { icon: faCamera, name: 'camera', id: 7 },
  { icon: faMusic, name: 'music', id: 8 },
  { icon: faGamepad, name: 'gamepad', id: 9 },
  { icon: faCoffee, name: 'coffee', id: 10 },
  { icon: faPizzaSlice, name: 'pizza-slice', id: 11 },
  { icon: faBicycle, name: 'bicycle', id: 12 },
  { icon: faCar, name: 'car', id: 13 },
  { icon: faPlane, name: 'plane', id: 14 },
  { icon: faRocket, name: 'rocket', id: 15 },
  { icon: faPalette, name: 'palette', id: 16 },
  { icon: faCode, name: 'code', id: 17 },
  { icon: faLaptop, name: 'laptop', id: 18 },
  { icon: faMobileAlt, name: 'mobile-alt', id: 19 },
  { icon: faHeadphones, name: 'headphones', id: 20 },
  { icon: faBook, name: 'book', id: 21 },
  { icon: faPencilAlt, name: 'pencil-alt', id: 22 },
  { icon: faLightbulb, name: 'lightbulb', id: 23 },
  { icon: faTrophy, name: 'trophy', id: 24 },
  { icon: faMedal, name: 'medal', id: 25 },
  { icon: faCrown, name: 'crown', id: 26 },
  { icon: faGem, name: 'gem', id: 27 },
  { icon: faFire, name: 'fire', id: 28 },
  { icon: faBolt, name: 'bolt', id: 29 },
  { icon: faMagic, name: 'magic', id: 30 },
];

const IconPickerMini: React.FC<IconPickerMiniProps> = ({
  currentIconId,
  onIconSelect,
  onMoreClick,
  textColor,
  globalButtonHover,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Icon Grid - 6 columns for compact display */}
      <div className="grid grid-cols-6 gap-2">
        {popularIcons.map((item) => {
          const isSelected = currentIconId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onIconSelect(item.id)}
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
              <FontAwesomeIcon icon={item.icon} size="sm" />
            </button>
          );
        })}
      </div>

      {/* More Button */}
      <button
        onClick={onMoreClick}
        className="w-full py-2 rounded-md transition-colors text-sm font-medium"
        style={{
          backgroundColor: 'transparent',
          color: textColor,
          fontFamily: 'Work Sans, sans-serif',
          border: `1px solid ${textColor}40`,
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
