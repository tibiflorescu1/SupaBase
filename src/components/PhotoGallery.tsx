import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { VehiclePhoto } from '../hooks/useSupabaseData';

interface PhotoGalleryProps {
  photos: VehiclePhoto[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoGallery({ photos, isOpen, onClose, initialIndex = 0 }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Main image */}
        <div className="flex flex-col items-center">
          <img
            src={currentPhoto.photoUrl}
            alt={currentPhoto.photoTitle || `Poza ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Imagine+indisponibila';
            }}
          />
          
          {/* Photo info */}
          <div className="mt-4 text-center">
            {currentPhoto.photoTitle && (
              <h3 className="text-white text-lg font-medium mb-2">{currentPhoto.photoTitle}</h3>
            )}
            <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
              <span>{currentIndex + 1} din {photos.length}</span>
              <a
                href={currentPhoto.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Deschide original
              </a>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex justify-center mt-4 gap-2 max-w-full overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 opacity-100' 
                    : 'border-gray-600 opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.photoTitle || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=?';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}