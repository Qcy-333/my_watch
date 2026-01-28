import React from 'react';
import { ContentRecord } from '../types';
import { PLATFORM_REGISTRY } from '../constants';
import { Clock, Plus, Check, Trash2 } from 'lucide-react';

interface ContentCardProps {
  record: ContentRecord;
  isSelected: boolean;
  onToggleQueue: (id: string) => void;
  onPlayNow: (record: ContentRecord) => void;
  onDelete: (id: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  record, 
  isSelected, 
  onToggleQueue,
  onPlayNow,
  onDelete
}) => {
  const platformConfig = PLATFORM_REGISTRY[record.platform] || PLATFORM_REGISTRY.Web;
  const Icon = platformConfig.icon;

  // Relative time formatter
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return 'Today';
    if (hours < 48) return 'Yesterday';
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div 
      className={`
        group relative w-full p-5 rounded-2xl border transition-all duration-300 ease-out
        ${isSelected 
          ? 'bg-black border-black text-white shadow-xl scale-[1.01]' 
          : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md text-gray-900'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Platform Icon Indicator */}
        <div 
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-gray-800' : platformConfig.bgColor}
          `}
        >
          <Icon 
            size={22} 
            className={isSelected ? 'text-white' : ''}
            style={{ color: isSelected ? undefined : platformConfig.primaryColor }} 
          />
        </div>

        {/* Content Metadata */}
        <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onPlayNow(record)}>
          {/* Header Row: Platform & Time */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
              {platformConfig.name}
            </span>
            <span className={`text-xs flex items-center gap-1 ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              <Clock size={10} />
              {getTimeAgo(record.createdAt)}
            </span>
          </div>
          
          {/* Title - Larger, Max 2 lines */}
          <h3 className={`text-lg font-bold leading-tight line-clamp-2 mb-1.5 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
            {record.title}
          </h3>

          {/* Summary - Smaller, Max 2 lines */}
          <p className={`text-sm leading-relaxed line-clamp-2 mb-3 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
            {record.summary || "No summary available for this content."}
          </p>
          
          {/* Tags - Multi-row/Wrap */}
          <div className="flex flex-wrap gap-2">
            {record.tags.map(tag => (
              <span 
                key={tag} 
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  isSelected 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Queue Action Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleQueue(record.id);
            }}
            title={isSelected ? "Remove from queue" : "Add to queue"}
            className={`
              flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all
              ${isSelected 
                ? 'bg-white border-white text-black hover:bg-gray-200' 
                : 'bg-transparent border-gray-200 text-gray-400 hover:border-black hover:text-black'
              }
            `}
          >
            {isSelected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
          </button>

          {/* Delete Action Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            title="Remove from list"
            className={`
              flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all opacity-0 group-hover:opacity-100 focus:opacity-100
              ${isSelected 
                ? 'bg-transparent border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-400' 
                : 'bg-transparent border-transparent text-gray-300 hover:text-red-500 hover:bg-red-50'
              }
            `}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};