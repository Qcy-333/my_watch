import React, { useState } from 'react';
import { ContentRecord } from '../types';
import { PLATFORM_REGISTRY } from '../constants';
import { X, GripVertical, Play, Trash2 } from 'lucide-react';

interface QueueDrawerProps {
  queueItems: ContentRecord[];
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onPlay: () => void;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  queueItems,
  onRemove,
  onReorder,
  onPlay,
  onClose
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Invisible drag image or default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Perform swap visually immediately or just wait for drop
    // For simple UX, we might just allow drop.
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Up Next</h2>
            <p className="text-xs text-gray-500">{queueItems.length} items in queue</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onPlay}
              className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Play size={14} fill="currentColor" /> Play All
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
          {queueItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
              <p>Your queue is empty.</p>
            </div>
          ) : (
            queueItems.map((item, index) => {
              const platformConfig = PLATFORM_REGISTRY[item.platform] || PLATFORM_REGISTRY.Web;
              const Icon = platformConfig.icon;
              
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl select-none
                    ${draggedIndex === index ? 'opacity-50 border-dashed border-gray-400' : 'hover:border-gray-300 hover:shadow-sm'}
                    cursor-move active:cursor-grabbing
                  `}
                >
                  {/* Drag Handle */}
                  <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                  </div>

                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${platformConfig.bgColor}`}>
                    <Icon size={14} style={{ color: platformConfig.primaryColor }} />
                  </div>

                  {/* Title */}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.title}
                    </h4>
                  </div>

                  {/* Remove Action */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // prevent drag
                      onRemove(item.id);
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};