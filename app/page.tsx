'use client';

import React, { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { MOCK_RECORDS, PLATFORM_REGISTRY } from '../constants';
import { ContentRecord } from '../types';
import { ContentCard } from '../components/ContentCard';
import { ReviewOverlay } from '../components/ReviewOverlay';
import { QueueDrawer } from '../components/QueueDrawer';
import { Search, Play, Layers, Sparkles, X, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function Home() {
  // --- State ---
  // Initialize with empty or MOCK_RECORDS, will be replaced by API data
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  // Queue is now an ordered array of IDs
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  
  // The Loop State
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Delete Confirmation State
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // --- Data Fetching ---
  const { data: serverRecords, error, isLoading } = useSWR('/api/videos', fetcher);

  useEffect(() => {
    if (serverRecords && Array.isArray(serverRecords)) {
      setRecords(serverRecords);
    }
  }, [serverRecords]);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('cf_queue_ids');
    if (saved) {
      try {
        setQueueIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse queue", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cf_queue_ids', JSON.stringify(queueIds));
  }, [queueIds]);

  // --- Derived State ---
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => r.status === 'ToWatch')
      .filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.size === 0 || r.tags.some(tag => selectedTags.has(tag));
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    records.forEach(r => r.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [records]);

  // The record currently being reviewed (Just Watched)
  const activeRecord = useMemo(() => 
    records.find(r => r.id === activeRecordId), 
  [records, activeRecordId]);

  // Resolve full objects for queue items, preserving order
  const queueRecords = useMemo(() => {
    return queueIds.map(id => records.find(r => r.id === id)).filter(Boolean) as ContentRecord[];
  }, [queueIds, records]);

  // The record that is effectively "Next" in the queue
  const nextRecord = useMemo(() => {
    if (queueIds.length === 0) return undefined;
    
    // If the active record is at the top of the queue, next is index 1
    if (queueIds[0] === activeRecordId) {
      return records.find(r => r.id === queueIds[1]);
    }
    // If active record is not in queue (or already removed), next is index 0
    return records.find(r => r.id === queueIds[0]);
  }, [queueIds, activeRecordId, records]);

  // --- Handlers ---

  const handleToggleQueue = (id: string) => {
    setQueueIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueueIds(prev => prev.filter(item => item !== id));
  };

  const handleReorderQueue = (fromIndex: number, toIndex: number) => {
    setQueueIds(prev => {
      const newQueue = [...prev];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return newQueue;
    });
  };

  const handleToggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  // --- Delete Logic ---
  const handleRequestDelete = (id: string) => {
    setDeleteCandidateId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateId) return;
    
    const idToDelete = deleteCandidateId;
    
    // Optimistic Update
    setRecords(prev => prev.map(r => r.id === idToDelete ? { ...r, status: 'Trash' } : r));
    setQueueIds(prev => prev.filter(item => item !== idToDelete));
    setDeleteCandidateId(null);

    // API Call
    try {
      await axios.patch(`/api/videos/${idToDelete}`, { status: 'Trash' });
    } catch (e) {
      console.error("Failed to delete", e);
      // Optional: Rollback logic here
    }
  };

  // --- The Loop Flow Control ---

  const handleStartFlow = () => {
    if (queueIds.length === 0) return;
    setIsQueueOpen(false);
    const firstId = queueIds[0];
    launchRecord(firstId);
  };

  const launchRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    // 1. Set as Active
    setActiveRecordId(id);
    setIsReviewing(true);
    
    // 2. Open Deep Link
    const strategy = PLATFORM_REGISTRY[record.platform] || PLATFORM_REGISTRY.Web;
    const deepLink = strategy.generateLink(record.url);
    window.open(deepLink, '_blank');
  };

  // ACTION: Feedback on TOP section
  const handleFeedback = async (action: 'done' | 'trash' | 'note', note?: string) => {
    if (!activeRecordId) return;

    // Optimistic Update
    setRecords(prev => prev.map(r => {
      if (r.id === activeRecordId) {
        if (action === 'trash') return { ...r, status: 'Trash' };
        // Done or Note implies Done
        return { ...r, status: 'Done', notes: note }; 
      }
      return r;
    }));

    // Remove from Queue immediately
    setQueueIds(prev => prev.filter(id => id !== activeRecordId));

    // API Call
    try {
      await axios.patch(`/api/videos/${activeRecordId}`, { 
        status: action === 'trash' ? 'Trash' : 'Done',
        note 
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // ACTION: Skip on BOTTOM section
  const handleSkipNext = () => {
    if (queueIds.length <= 1) return;

    setQueueIds(prev => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  // ACTION: Play on BOTTOM section
  const handlePlayNext = () => {
    if (!nextRecord) return;
    launchRecord(nextRecord.id);
  };

  const handleCloseOverlay = () => {
    setIsReviewing(false);
    setActiveRecordId(null);
    localStorage.removeItem('cf_last_played_id');
  };

  // --- Render ---

  if (isLoading && records.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-500 text-sm">Loading your commute list...</p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
       <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h3 className="text-lg font-bold">Failed to load content</h3>
           <p className="text-gray-500 mb-4">{error.message || "Could not connect to server"}</p>
           <button onClick={() => window.location.reload()} className="bg-black text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Content?</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Are you sure you want to remove this from your library? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteCandidateId(null)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Overlay (The Loop) */}
      {isReviewing && activeRecord && (
        <ReviewOverlay 
          key={activeRecord.id}
          watchedRecord={activeRecord}
          nextRecord={nextRecord}
          remainingCount={Math.max(0, queueIds.length - (queueIds.includes(activeRecord.id) ? 1 : 0))}
          onFeedback={handleFeedback}
          onPlayNext={handlePlayNext}
          onSkipNext={handleSkipNext}
          onExit={handleCloseOverlay}
        />
      )}

      {/* Queue Drawer */}
      {isQueueOpen && (
        <QueueDrawer 
          queueItems={queueRecords}
          onRemove={handleRemoveFromQueue}
          onReorder={handleReorderQueue}
          onPlay={handleStartFlow}
          onClose={() => setIsQueueOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-gray-900">CommuteFlow</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200" /> 
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Ask AI or search..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Multi-select Filters */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button 
            onClick={() => setSelectedTags(new Set())}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedTags.size === 0 ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            All
          </button>
          {allTags.map(tag => {
            const isActive = selectedTags.has(tag);
            return (
              <button 
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
                  ${isActive 
                    ? 'bg-black text-white border-black shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stream */}
      <main className="max-w-2xl mx-auto px-4 flex flex-col gap-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Layers className="mx-auto mb-3 w-12 h-12 opacity-20" />
            <p>No content found.</p>
            {selectedTags.size > 0 && (
              <button onClick={() => setSelectedTags(new Set())} className="text-sm text-black underline mt-2">Clear filters</button>
            )}
          </div>
        ) : (
          filteredRecords.map(record => (
            <ContentCard 
              key={record.id} 
              record={record} 
              isSelected={queueIds.includes(record.id)}
              onToggleQueue={handleToggleQueue}
              onPlayNow={() => launchRecord(record.id)}
              onDelete={handleRequestDelete}
            />
          ))
        )}
      </main>

      {/* Sticky Bottom Player (Queue Control) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-8 px-4 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {queueIds.length > 0 && !isQueueOpen && (
            <div 
              onClick={() => setIsQueueOpen(true)}
              className="bg-black/90 backdrop-blur-md text-white rounded-2xl p-2 pl-3 pr-2 flex items-center justify-between shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-white/10 cursor-pointer group hover:bg-black transition-colors"
            >
              {/* Left: Content Info of First Item */}
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                {(() => {
                   const firstItem = queueRecords[0];
                   const platformConfig = firstItem ? (PLATFORM_REGISTRY[firstItem.platform] || PLATFORM_REGISTRY.Web) : null;
                   const Icon = platformConfig?.icon;
                   
                   return (
                     <>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${platformConfig ? 'bg-white/10' : 'bg-gray-800'}`}>
                           {Icon && <Icon size={18} className="text-gray-200" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Up Next</span>
                             <span className="text-[10px] bg-white/20 px-1.5 rounded-full text-gray-300">{queueIds.length}</span>
                           </div>
                           <span className="font-semibold text-sm truncate text-white block">
                             {firstItem?.title || "Unknown Content"}
                           </span>
                        </div>
                     </>
                   );
                })()}
              </div>
              
              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setQueueIds([]);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  title="Clear Queue"
                >
                  <X size={18} />
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartFlow();
                  }}
                  className="bg-white text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors active:scale-95 shadow-lg ml-1"
                >
                  <Play size={16} fill="currentColor" /> Play
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
