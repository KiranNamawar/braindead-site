import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, Plus, X, Share2, Copy, Trash2, Edit3, Save, Target } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface CountdownEvent {
  id: string;
  name: string;
  description?: string;
  targetDate: Date;
  createdAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
  category: 'work' | 'personal' | 'holiday' | 'deadline' | 'event' | 'other';
  color: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

const CATEGORIES = [
  { id: 'work', name: 'Work', color: 'from-blue-500 to-cyan-600', icon: '💼' },
  { id: 'personal', name: 'Personal', color: 'from-green-500 to-teal-600', icon: '🎯' },
  { id: 'holiday', name: 'Holiday', color: 'from-purple-500 to-pink-600', icon: '🏖️' },
  { id: 'deadline', name: 'Deadline', color: 'from-red-500 to-orange-600', icon: '⏰' },
  { id: 'event', name: 'Event', color: 'from-yellow-500 to-orange-600', icon: '🎉' },
  { id: 'other', name: 'Other', color: 'from-gray-500 to-gray-600', icon: '📅' },
] as const;

const CountdownTimerPage: React.FC = () => {
  const [events, setEvents] = useLocalStorage<CountdownEvent[]>(STORAGE_KEYS.countdownEvents, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CountdownEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetDate: '',
    targetTime: '',
    category: 'personal' as CountdownEvent['category'],
  });

  const { showSuccess, showError, showInfo } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check for completed events
  useEffect(() => {
    const now = new Date();
    setEvents(prev => prev.map(event => {
      if (!event.isCompleted && new Date(event.targetDate) <= now) {
        showInfo(`🎉 "${event.name}" countdown has finished!`);
        return { ...event, isCompleted: true, completedAt: now };
      }
      return event;
    }));
  }, [currentTime, setEvents, showInfo]);

  const calculateTimeRemaining = useCallback((targetDate: Date): TimeRemaining => {
    const now = currentTime.getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(difference / 1000),
      isExpired: false,
    };
  }, [currentTime]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetDate: '',
      targetTime: '',
      category: 'personal',
    });
    setEditingEvent(null);
  };

  const handleAddEvent = () => {
    if (!formData.name.trim()) {
      showError('Please enter an event name');
      return;
    }

    if (!formData.targetDate) {
      showError('Please select a target date');
      return;
    }

    const targetDateTime = new Date(`${formData.targetDate}T${formData.targetTime || '23:59'}`);
    
    if (targetDateTime <= new Date()) {
      showError('Target date must be in the future');
      return;
    }

    const category = CATEGORIES.find(cat => cat.id === formData.category);
    
    const newEvent: CountdownEvent = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      targetDate: targetDateTime,
      createdAt: new Date(),
      isCompleted: false,
      category: formData.category,
      color: category?.color || 'from-gray-500 to-gray-600',
    };

    setEvents(prev => [...prev, newEvent]);
    resetForm();
    setShowAddModal(false);
    showSuccess(`Countdown for "${newEvent.name}" created!`);
    trackToolUsage('countdown-timer', 'event-created', { category: formData.category });
  };

  const handleEditEvent = () => {
    if (!editingEvent || !formData.name.trim()) {
      showError('Please enter an event name');
      return;
    }

    if (!formData.targetDate) {
      showError('Please select a target date');
      return;
    }

    const targetDateTime = new Date(`${formData.targetDate}T${formData.targetTime || '23:59'}`);
    
    if (targetDateTime <= new Date()) {
      showError('Target date must be in the future');
      return;
    }

    const category = CATEGORIES.find(cat => cat.id === formData.category);
    
    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id 
        ? {
            ...event,
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            targetDate: targetDateTime,
            category: formData.category,
            color: category?.color || 'from-gray-500 to-gray-600',
          }
        : event
    ));

    resetForm();
    setShowAddModal(false);
    showSuccess(`"${formData.name}" updated successfully!`);
  };

  const startEdit = (event: CountdownEvent) => {
    setEditingEvent(event);
    const targetDate = new Date(event.targetDate);
    setFormData({
      name: event.name,
      description: event.description || '',
      targetDate: targetDate.toISOString().split('T')[0],
      targetTime: targetDate.toTimeString().slice(0, 5),
      category: event.category,
    });
    setShowAddModal(true);
  };

  const deleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    showSuccess(`"${event?.name}" deleted`);
  };

  const shareEvent = async (event: CountdownEvent) => {
    const timeRemaining = calculateTimeRemaining(event.targetDate);
    const shareText = timeRemaining.isExpired 
      ? `🎉 "${event.name}" has finished!`
      : `⏰ "${event.name}" - ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Countdown: ${event.name}`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        showSuccess('Countdown details copied to clipboard!');
      }
    } catch (error) {
      showError('Failed to share countdown');
    }
  };

  const copyEventLink = async (event: CountdownEvent) => {
    // Create a shareable link (in a real app, this would be a proper URL)
    const eventData = {
      name: event.name,
      targetDate: event.targetDate.toISOString(),
      description: event.description,
    };
    const encodedData = btoa(JSON.stringify(eventData));
    const shareableLink = `${window.location.origin}${window.location.pathname}?event=${encodedData}`;
    
    try {
      await navigator.clipboard.writeText(shareableLink);
      showSuccess('Shareable link copied to clipboard!');
    } catch (error) {
      showError('Failed to copy link');
    }
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value.toString().padStart(2, '0')} ${unit}${value !== 1 ? 's' : ''}`;
  };

  const getEventProgress = (event: CountdownEvent) => {
    const total = new Date(event.targetDate).getTime() - new Date(event.createdAt).getTime();
    const elapsed = currentTime.getTime() - new Date(event.createdAt).getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const activeEvents = events.filter(e => !e.isCompleted);
  const completedEvents = events.filter(e => e.isCompleted);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Countdown Timer - BrainDead"
        description="Create countdown timers for important events, deadlines, and milestones. Track multiple countdowns with shareable links."
        canonical="/countdown-timer"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Countdown Timer
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Count down to your next vacation, deadline, or existential crisis.
          <span className="text-purple-400"> Time anxiety made visual!</span>
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>{activeEvents.length} active countdowns</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>{completedEvents.length} completed</span>
          </div>
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Shareable links</span>
          </div>
        </div>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Countdown
        </button>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-purple-400" />
            Active Countdowns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => {
              const timeRemaining = calculateTimeRemaining(event.targetDate);
              const category = CATEGORIES.find(cat => cat.id === event.category);
              const progress = getEventProgress(event);
              
              return (
                <div
                  key={event.id}
                  className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/50 transition-all relative overflow-hidden`}
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 bg-gradient-to-r ${category?.color} rounded-full text-white text-xs font-semibold flex items-center`}>
                      <span className="mr-1">{category?.icon}</span>
                      {category?.name}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => shareEvent(event)}
                        className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Share countdown"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyEventLink(event)}
                        className="p-1 text-gray-500 hover:text-green-400 transition-colors"
                        title="Copy shareable link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEdit(event)}
                        className="p-1 text-gray-500 hover:text-yellow-400 transition-colors"
                        title="Edit event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                    {event.description && (
                      <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {new Date(event.targetDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Countdown Display */}
                  <div className="text-center">
                    {timeRemaining.isExpired ? (
                      <div className="text-green-400 text-2xl font-bold mb-2">
                        🎉 Event Completed!
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-white">
                              {timeRemaining.days.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-400">Days</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-white">
                              {timeRemaining.hours.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-400">Hours</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-white">
                              {timeRemaining.minutes.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-400">Minutes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-white">
                              {timeRemaining.seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-400">Seconds</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${category?.color} transition-all duration-1000`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(progress)}% elapsed
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-green-400" />
            Completed Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedEvents.slice(0, 6).map((event) => {
              const category = CATEGORIES.find(cat => cat.id === event.category);
              
              return (
                <div
                  key={event.id}
                  className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 opacity-75"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`px-2 py-1 bg-gradient-to-r ${category?.color} rounded-full text-white text-xs font-semibold flex items-center opacity-60`}>
                      <span className="mr-1">{category?.icon}</span>
                      {category?.name}
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{event.name}</h3>
                  <p className="text-green-400 text-sm mb-2">✅ Completed</p>
                  <p className="text-gray-500 text-xs">
                    {event.completedAt && new Date(event.completedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
          {completedEvents.length > 6 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setEvents(prev => prev.filter(e => !e.isCompleted))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear All Completed ({completedEvents.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No countdowns yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first countdown to track important events and deadlines
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all hover:scale-105 shadow-lg"
          >
            Create Your First Countdown
          </button>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingEvent ? 'Edit Countdown' : 'Create Countdown'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Project Deadline, Vacation, Birthday"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add more details about this event..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`p-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
                        formData.category === category.id
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={formData.targetTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEvent ? handleEditEvent : handleAddEvent}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all hover:scale-105 shadow-lg"
                >
                  {editingEvent ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimerPage;