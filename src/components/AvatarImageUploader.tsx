import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface AvatarImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'user-profile' | 'hub-settings';
  smart_hub_id?: number | null;
  // Theme props
  textColor: string;
  menuColor: string;
  titleColor: string;
  globalButtonHover: string;
  toneButtonBkColor?: string;
  toneButtonTextColor?: string;
  toneButtonBorderColor?: string;
  backgroundColor?: string;
  solidColor?: string;
  feedbackIndicatorBk?: string;
  appearanceTextColor?: string;
  buttonBkColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
}

const AvatarImageUploader: React.FC<AvatarImageUploaderProps> = ({
  isOpen,
  onClose,
  context,
  smart_hub_id,
  textColor,
  menuColor,
  titleColor,
  globalButtonHover,
  toneButtonBkColor,
  toneButtonTextColor,
  toneButtonBorderColor,
  backgroundColor,
  solidColor,
  feedbackIndicatorBk,
  appearanceTextColor,
  buttonBkColor,
  buttonTextColor,
  buttonHoverColor,
}) => {
  const queryClient = useQueryClient();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log theme props with actual values
  console.log('=== AvatarImageUploader Theme Props ===');
  console.log('context:', context);
  console.log('solidColor:', solidColor);
  console.log('feedbackIndicatorBk:', feedbackIndicatorBk);
  console.log('appearanceTextColor:', appearanceTextColor);
  console.log('toneButtonBkColor:', toneButtonBkColor);
  console.log('backgroundColor:', backgroundColor);
  console.log('textColor:', textColor);

  // Mutation for uploading user profile avatar
  const uploadUserAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  // Mutation for uploading smart hub avatar
  const uploadSmartHubAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!smart_hub_id) throw new Error('Smart hub ID is required');
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post(`/smart-hub/avatar?smart_hub_id=${smart_hub_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartHub', smart_hub_id] });
      queryClient.invalidateQueries({ queryKey: ['smartHubs'] });
    }
  });

  // Debug: Log button colors
  console.log('AvatarImageUploader button colors:', {
    buttonBkColor,
    buttonTextColor,
    buttonHoverColor,
    toneButtonBkColor,
    toneButtonTextColor
  });

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = () => {
        // Auto-resize if image is too large (maintaining aspect ratio)
        const maxDimension = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          // Calculate scale factor to maintain aspect ratio
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setImageSrc(canvas.toDataURL('image/jpeg', 0.9));
            setImageSize({ width, height });
          }
        } else {
          setImageSrc(reader.result as string);
          setImageSize({ width: img.width, height: img.height });
        }
        
        // Calculate initial zoom to fill the circular crop area while maintaining aspect ratio
        const containerSize = 384; // Height of the crop container
        const circleDiameter = containerSize * 0.9; // Circle is 90% of container (45% radius * 2)
        const finalWidth = width || img.width;
        const finalHeight = height || img.height;
        const smallerDimension = Math.min(finalWidth, finalHeight);
        
        // Calculate zoom so the smaller dimension fills the circle
        const initialZoom = circleDiameter / smallerDimension;
        
        setPosition({ x: 0, y: 0 });
        setZoom(initialZoom);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position]);

  const createCroppedImage = async () => {
    if (!imageSrc || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const cropSize = Math.min(containerWidth, containerHeight);

    const image = new Image();
    image.src = imageSrc;

    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
    });

    // Calculate the actual image dimensions as displayed
    const displayWidth = imageSize.width * zoom;
    const displayHeight = imageSize.height * zoom;

    // Calculate crop area in original image coordinates
    const cropX = ((containerWidth - displayWidth) / 2 - position.x) * (imageSize.width / displayWidth);
    const cropY = ((containerHeight - displayHeight) / 2 - position.y) * (imageSize.height / displayHeight);
    const cropWidth = cropSize * (imageSize.width / displayWidth);
    const cropHeight = cropSize * (imageSize.height / displayHeight);

    // Create canvas for cropped image
    const canvas = document.createElement('canvas');
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw cropped and resized image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convert to blob and upload immediately
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          
          try {
            // Use context to determine which upload endpoint to call
            if (context === 'user-profile') {
              await uploadUserAvatarMutation.mutateAsync(file);
            } else if (context === 'hub-settings') {
              await uploadSmartHubAvatarMutation.mutateAsync(file);
            }
            
            // Reset state and close modal
            setImageSrc(null);
            setPosition({ x: 0, y: 0 });
            setZoom(1);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            onClose();
          } catch (error) {
            console.error(`Failed to upload ${context} avatar:`, error);
            // Keep modal open on error so user can try again
          }
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10002]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={modalRef}
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: menuColor,
          width: '600px',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{ 
            borderColor: `${textColor}20`,
            background: toneButtonBkColor ? `${toneButtonBkColor}33` : globalButtonHover
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-xl font-semimedium flex items-center gap-2"
                style={{ 
                  color: textColor,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                <Upload size={35} style={{ color: textColor, border: '1px solid', borderRadius: '5px', padding: '4px', borderColor: titleColor }} strokeWidth={2} />
                Change your avatar
              </h1>
              <p 
                className="mt-1 text-sm"
                style={{ 
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="flex-shrink-0 p-1.5 rounded-full transition-all group"
              style={{
                backgroundColor: `${textColor}10`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${textColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${textColor}10`;
              }}
            >
              <X 
                className="group-hover:rotate-90 transition-transform duration-300"
                size={20}
                style={{ color: textColor }}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className=" overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {!imageSrc && (
            <div className="text-center">
              <label className="cursor-pointer">
                <div 
                  className=" p-12 transition-colors"
                  style={{ 
                    borderColor: `${textColor}40`,
                    backgroundColor: `${textColor}05`,
                    
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = toneButtonBkColor || globalButtonHover;
                    e.currentTarget.style.backgroundColor = `${textColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${textColor}40`;
                    e.currentTarget.style.backgroundColor = `${textColor}05`;
                  }}
                >
                  <Upload 
                    className="w-14 h-14 mx-auto mb-4" 
                    style={{ color: textColor, opacity: 0.5 }}
                  />
                  <p 
                    className="text-lg font-regular mb-2"
                    style={{ 
                      color: textColor,
                      fontFamily: 'Work Sans, sans-serif'
                    }}
                  >
                    Click to upload or drag and drop
                  </p>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: textColor,
                      opacity: 0.6,
                      fontFamily: 'Work Sans, sans-serif'
                    }}
                  >
                    
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {imageSrc && (
            <div>
              <div 
                ref={containerRef}
                className="relative overflow-hidden cursor-move"
                style={{ 
                  height: '384px',
                  backgroundColor: '#1a1a1a'
                }}
                onMouseDown={handleMouseDown}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Upload"
                  className="absolute select-none"
                  style={{
                    width: `${imageSize.width * zoom}px`,
                    height: `${imageSize.height * zoom}px`,
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    maxWidth: 'none',
                    maxHeight: 'none'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="crop-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <circle 
                          cx="50%" 
                          cy="50%" 
                          r="45%" 
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect 
                      width="100%" 
                      height="100%" 
                      fill="rgba(0,0,0,0.5)" 
                      mask="url(#crop-mask)"
                    />
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="45%" 
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray="10,5"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-6 pl-6 pr-6">
                <label 
                  className="block text-sm font-medium mb-2 flex items-center justify-center gap-2"
                  style={{ 
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                >
                  <ZoomOut className="w-4 h-4" />
                  Zoom
                  <ZoomIn className="w-4 h-4" />
                </label>
                <div className="relative">
                  {/* Zoom Percentage Indicator */}
                  <div 
                    className="absolute -top-10 transition-all duration-200"
                    style={{
                      left: `${((zoom - 0.2) / (3 - 0.2)) * 100}%`,
                      transform: 'translateX(-50%)',
                      opacity: showZoomIndicator ? 1 : 0,
                      pointerEvents: 'none'
                    }}
                  >
                    <div 
                      className="px-3 py-1.5 rounded-lg font-semibold text-sm shadow-lg"
                      style={{
                        backgroundColor: backgroundColor ||  menuColor,
                        color: textColor,
                        fontFamily: 'Work Sans, sans-serif'
                      }}
                    >
                      {Math.round(zoom * 100)}%
                    </div>
                    {/* Arrow pointing down */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: `6px solid ${ backgroundColor || menuColor}`,
                        bottom: '-6px'
                      }}
                    />
                  </div>
                  
                <style>{`
                  .custom-zoom-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 4px;
                    border-radius: 2px;
                    outline: none;
                  }
                  .custom-zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${backgroundColor || menuColor};
                    border: 5px solid ${solidColor || toneButtonBkColor || globalButtonHover};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                  }
                  .custom-zoom-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
                  }
                  .custom-zoom-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${backgroundColor || menuColor};
                    border: 5px solid ${solidColor || toneButtonBkColor || globalButtonHover};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                  }
                  .custom-zoom-slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
                  }
                `}</style>
                <input
                  type="range"
                  min={0.2}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  onMouseDown={() => setShowZoomIndicator(true)}
                  onMouseUp={() => setShowZoomIndicator(false)}
                  onMouseLeave={() => setShowZoomIndicator(false)}
                  className="custom-zoom-slider"
                  style={{
                    backgroundColor: `${textColor}20`
                  }}
                />
                </div>
              </div>

              <p 
                className="text-sm mt-3 text-center"
                style={{ 
                  color: textColor,
                  opacity: 0.6,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                Drag to reposition • Use slider to zoom
              </p>

              <div className="flex gap-3 mt-6 pl-6 pr-6 pb-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6  rounded-lg font-regular transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${toneButtonBorderColor || toneButtonTextColor || textColor}`,
                    color: toneButtonTextColor || textColor,
                    fontFamily: 'Work Sans, sans-serif',
                    height: '40px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${toneButtonBorderColor || toneButtonTextColor || textColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createCroppedImage}
                  className="flex-1 px-6 py-3 rounded-lg font-regular transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: buttonBkColor || toneButtonBkColor || globalButtonHover,
                    color: buttonTextColor || toneButtonTextColor || textColor,
                    fontFamily: 'Work Sans, sans-serif',
                    height: '40px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = buttonHoverColor || buttonBkColor || toneButtonBkColor || globalButtonHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = buttonBkColor || toneButtonBkColor || globalButtonHover;
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarImageUploader;
