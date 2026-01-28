import React, { useState, useEffect } from 'react';
import { ContentRecord } from '../types';
import { PLATFORM_REGISTRY } from '../constants';
import { 
  CheckCircle2, 
  Trash2, 
  PenLine, 
  Play, 
  SkipForward, 
  Home, 
  ArrowRight,
  Clock,
  RotateCcw
} from 'lucide-react';

interface ReviewOverlayProps {
  watchedRecord: ContentRecord;
  nextRecord?: ContentRecord;
  remainingCount: number;
  onFeedback: (action: 'done' | 'trash' | 'note', note?: string) => void;
  onPlayNext: () => void;
  onSkipNext: () => void;
  onExit: () => void;
}

export const ReviewOverlay: React.FC<ReviewOverlayProps> = ({ 
  watchedRecord, 
  nextRecord,
  remainingCount, 
  onFeedback,
  onPlayNext,
  onSkipNext,
  onExit
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(
    watchedRecord.status === 'Done' || watchedRecord.status === 'Trash'
  );
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  // Platforms
  const currentPlatform = PLATFORM_REGISTRY[watchedRecord.platform] || PLATFORM_REGISTRY.Web;
  const nextPlatform = nextRecord ? (PLATFORM_REGISTRY[nextRecord.platform] || PLATFORM_REGISTRY.Web) : null;
  const CurrentIcon = currentPlatform.icon;
  const NextIcon = nextPlatform?.icon;

  // Actions
  const handleAction = (action: 'done' | 'trash') => {
    onFeedback(action);
    setFeedbackGiven(true);
  };

  const handleSaveNote = () => {
    if (note.trim()) {
      onFeedback('note', note);
      setFeedbackGiven(true);
      setShowNoteInput(false);
    }
  };

  // Auto-focus note input
  useEffect(() => {
    if (showNoteInput) {
      document.getElementById('note-input')?.focus();
    }
  }, [showNoteInput]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-300">
      
      {/* --- SECTION A: FEEDBACK (Top Half) --- */}
      <div className={`
        relative flex flex-col items-center justify-center p-6 transition-all duration-500 ease-in-out
        ${feedbackGiven ? 'flex-[0.4] bg-gray-50 border-b border-gray-200' : 'flex-1 bg-white'}
      `}>
        
        {/* Content Details */}
        <div className={`text-center max-w-md mx-auto transition-all duration-500 ${feedbackGiven ? 'scale-90 opacity-60' : 'scale-100'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentPlatform.bgColor}`}>
              <CurrentIcon size={16} style={{ color: currentPlatform.primaryColor }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Just Watched</span>
          </div>
          
          <h2 className={`font-bold text-gray-900 leading-tight mb-2 ${feedbackGiven ? 'text-xl line-clamp-1' : 'text-2xl'}`}>
            {watchedRecord.title}
          </h2>
          
          {!feedbackGiven && (
            <p className="text-gray-500 text-sm line-clamp-2 px-4">
              {watchedRecord.summary || "No summary available."}
            </p>
          )}
        </div>

        {/* Feedback Actions (Hidden if Note Mode is active) */}
        {!showNoteInput && !feedbackGiven && (
          <div className="flex items-center gap-4 mt-8 w-full max-w-sm animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <button 
              onClick={() => handleAction('trash')}
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent hover:bg-red-50 hover:border-red-100 group transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Trash2 size={24} className="text-gray-500 group-hover:text-red-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 uppercase tracking-wider">Delete</span>
            </button>

            <button 
              onClick={() => handleAction('done')}
              className="flex-[1.5] flex flex-col items-center gap-2 p-4 rounded-2xl bg-black text-white shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Mark Done</span>
            </button>

            <button 
              onClick={() => setShowNoteInput(true)}
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent hover:bg-blue-50 hover:border-blue-100 group transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <PenLine size={24} className="text-gray-500 group-hover:text-blue-600" />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-wider">Note</span>
            </button>
          </div>
        )}

        {/* Note Input Overlay */}
        {showNoteInput && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Add a Note</h3>
            <textarea
              id="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full max-w-sm p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none mb-4 text-sm"
              rows={4}
              placeholder="What did you learn?"
            />
            <div className="flex gap-3 w-full max-w-sm">
              <button 
                onClick={() => setShowNoteInput(false)}
                className="flex-1 py-3 text-gray-500 font-medium hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNote}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold shadow-lg"
              >
                Save & Done
              </button>
            </div>
          </div>
        )}

        {/* Feedback Success State */}
        {feedbackGiven && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-green-600 font-medium animate-in slide-in-from-bottom-2 fade-in">
            <CheckCircle2 size={16} />
            <span className="text-sm">Marked as done</span>
          </div>
        )}
      </div>

      {/* --- SECTION B: FLOW (Bottom Half) --- */}
      <div className={`
        flex-[0.6] bg-white border-t border-gray-100 p-6 flex flex-col items-center justify-center gap-6 transition-all duration-500
        ${!feedbackGiven ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}
      `}>
        
        {nextRecord ? (
          <>
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight size={14} /> Up Next
                </span>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {remainingCount} in queue
                </span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${nextPlatform?.bgColor}`}>
                    {NextIcon && <NextIcon size={18} style={{ color: nextPlatform?.primaryColor }} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                      {nextRecord.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> 5 min</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                         {nextPlatform?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-sm gap-3">
              <button 
                onClick={onPlayNext}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                <Play size={20} fill="currentColor" /> Play Now
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onSkipNext}
                  className="py-3 bg-gray-50 text-gray-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <SkipForward size={16} /> Skip This
                </button>
                <button 
                  onClick={onExit}
                  className="py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Home size={16} /> Dashboard
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <RotateCcw size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-sm text-gray-500 mb-6">Queue is empty. Go back to the dashboard to find more content.</p>
            <button 
              onClick={onExit}
              className="w-full py-3 bg-black text-white rounded-xl font-bold"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};