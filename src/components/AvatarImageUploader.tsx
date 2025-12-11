import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  textColor: string;
  menuColor: string;
  titleColor: string;
  globalButtonHover: string;
  toneButtonBkColor?: string;
  toneButtonTextColor?: string;
}

const AvatarImageUploader: React.FC<AvatarImageUploaderProps> = ({
  isOpen,
  onClose,
  onUpload,
  textColor,
  menuColor,
  titleColor,
  globalButtonHover,
  toneButtonBkColor,
  toneButtonTextColor,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        // Calculate initial zoom to fit image in container while maintaining aspect ratio
        const containerSize = 384; // Height of the crop container
        const imageAspectRatio = (width || img.width) / (height || img.height);
        let initialZoom;
        
        if (imageAspectRatio > 1) {
          // Landscape image - fit by height
          initialZoom = containerSize / (height || img.height);
        } else {
          // Portrait or square image - fit by width
          initialZoom = containerSize / (width || img.width);
        }
        
        // Ensure the image covers at least the crop circle
        initialZoom = Math.max(initialZoom, 1);
        
        setCroppedImage(null);
        setCroppedBlob(null);
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

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedImage(url);
          setCroppedBlob(blob);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setCroppedBlob(null);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleUploadAvatar = () => {
    if (croppedBlob) {
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      onUpload(file);
      handleCancel();
    }
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
                className="text-2xl font-bold"
                style={{ 
                  color: titleColor,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                Avatar Uploader
              </h1>
              <p 
                className="mt-1 text-sm"
                style={{ 
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                Upload and crop your profile picture
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
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {!imageSrc && !croppedImage && (
            <div className="text-center">
              <label className="cursor-pointer">
                <div 
                  className="border-2 border-dashed rounded-2xl p-12 transition-colors"
                  style={{ 
                    borderColor: `${textColor}40`,
                    backgroundColor: `${textColor}05`
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
                    className="w-16 h-16 mx-auto mb-4" 
                    style={{ color: textColor, opacity: 0.5 }}
                  />
                  <p 
                    className="text-lg font-semibold mb-2"
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
                    Any size image accepted • Auto-resized for optimal performance
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

          {imageSrc && !croppedImage && (
            <div>
              <div 
                ref={containerRef}
                className="relative rounded-xl overflow-hidden cursor-move"
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
                    pointerEvents: 'none'
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

              <div className="mt-6">
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
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundColor: `${textColor}20`,
                    accentColor: toneButtonBkColor || globalButtonHover
                  }}
                />
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: `${textColor}10`,
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${textColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${textColor}10`;
                  }}
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={createCroppedImage}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: toneButtonBkColor || globalButtonHover,
                    color: toneButtonTextColor || textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Check className="w-5 h-5" />
                  Crop Image
                </button>
              </div>
            </div>
          )}

          {croppedImage && (
            <div className="text-center">
              <div className="mb-6">
                <div 
                  className="inline-block p-2 rounded-full"
                  style={{
                    background: toneButtonBkColor || globalButtonHover
                  }}
                >
                  <img
                    src={croppedImage}
                    alt="Cropped avatar"
                    className="w-48 h-48 rounded-full"
                    style={{ border: `4px solid ${menuColor}` }}
                  />
                </div>
              </div>

              <div 
                className="border rounded-lg p-4 mb-6"
                style={{
                  backgroundColor: `${toneButtonBkColor || globalButtonHover}20`,
                  borderColor: `${toneButtonBkColor || globalButtonHover}40`
                }}
              >
                <p 
                  className="font-semibold flex items-center justify-center gap-2"
                  style={{ 
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                >
                  <Check className="w-5 h-5" />
                  Avatar ready! (512x512px)
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ 
                    color: textColor,
                    opacity: 0.7,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                >
                  Your cropped image is optimized and ready to upload
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: `${textColor}10`,
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${textColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${textColor}10`;
                  }}
                >
                  Upload Different Image
                </button>
                <button
                  onClick={handleUploadAvatar}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: toneButtonBkColor || globalButtonHover,
                    color: toneButtonTextColor || textColor,
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Upload Avatar
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
