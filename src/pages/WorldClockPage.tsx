import React, { useState, useEffect } from 'react';
import { Clock, Globe, Plus, X, Search, MapPin, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface TimeZoneInfo {
  id: string;
  name: string;
  timezone: string;
  country: string;
  city: string;
  offset: string;
  isDST: boolean;
}

interface SavedTimeZone extends TimeZoneInfo {
  addedAt: Date;
  customName?: string;
}

// Popular timezones with their information
const POPULAR_TIMEZONES: TimeZoneInfo[] = [
  { id: 'utc', name: 'UTC', timezone: 'UTC', country: 'Universal', city: 'Coordinated Universal Time', offset: '+00:00', isDST: false },
  { id: 'ny', name: 'New York', timezone: 'America/New_York', country: 'United States', city: 'New York', offset: '-05:00', isDST: true },
  { id: 'la', name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'United States', city: 'Los Angeles', offset: '-08:00', isDST: true },
  { id: 'london', name: 'London', timezone: 'Europe/London', country: 'United Kingdom', city: 'London', offset: '+00:00', isDST: true },
  { id: 'paris', name: 'Paris', timezone: 'Europe/Paris', country: 'France', city: 'Paris', offset: '+01:00', isDST: true },
  { id: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan', city: 'Tokyo', offset: '+09:00', isDST: false },
  { id: 'sydney', name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia', city: 'Sydney', offset: '+11:00', isDST: true },
  { id: 'dubai', name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE', city: 'Dubai', offset: '+04:00', isDST: false },
  { id: 'singapore', name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore', city: 'Singapore', offset: '+08:00', isDST: false },
  { id: 'mumbai', name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India', city: 'Mumbai', offset: '+05:30', isDST: false },
  { id: 'beijing', name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China', city: 'Beijing', offset: '+08:00', isDST: false },
  { id: 'moscow', name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia', city: 'Moscow', offset: '+03:00', isDST: false },
  { id: 'sao_paulo', name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil', city: 'São Paulo', offset: '-03:00', isDST: true },
  { id: 'mexico_city', name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico', city: 'Mexico City', offset: '-06:00', isDST: true },
  { id: 'toronto', name: 'Toronto', timezone: 'America/Toronto', country: 'Canada', city: 'Toronto', offset: '-05:00', isDST: true },
  { id: 'berlin', name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany', city: 'Berlin', offset: '+01:00', isDST: true },
  { id: 'rome', name: 'Rome', timezone: 'Europe/Rome', country: 'Italy', city: 'Rome', offset: '+01:00', isDST: true },
  { id: 'madrid', name: 'Madrid', timezone: 'Europe/Madrid', country: 'Spain', city: 'Madrid', offset: '+01:00', isDST: true },
  { id: 'amsterdam', name: 'Amsterdam', timezone: 'Europe/Amsterdam', country: 'Netherlands', city: 'Amsterdam', offset: '+01:00', isDST: true },
  { id: 'stockholm', name: 'Stockholm', timezone: 'Europe/Stockholm', country: 'Sweden', city: 'Stockholm', offset: '+01:00', isDST: true },
  { id: 'zurich', name: 'Zurich', timezone: 'Europe/Zurich', country: 'Switzerland', city: 'Zurich', offset: '+01:00', isDST: true },
  { id: 'hong_kong', name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong', city: 'Hong Kong', offset: '+08:00', isDST: false },
  { id: 'seoul', name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea', city: 'Seoul', offset: '+09:00', isDST: false },
  { id: 'bangkok', name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand', city: 'Bangkok', offset: '+07:00', isDST: false },
  { id: 'jakarta', name: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia', city: 'Jakarta', offset: '+07:00', isDST: false },
  { id: 'manila', name: 'Manila', timezone: 'Asia/Manila', country: 'Philippines', city: 'Manila', offset: '+08:00', isDST: false },
  { id: 'melbourne', name: 'Melbourne', timezone: 'Australia/Melbourne', country: 'Australia', city: 'Melbourne', offset: '+11:00', isDST: true },
  { id: 'auckland', name: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand', city: 'Auckland', offset: '+13:00', isDST: true },
  { id: 'cairo', name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt', city: 'Cairo', offset: '+02:00', isDST: false },
  { id: 'johannesburg', name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa', city: 'Johannesburg', offset: '+02:00', isDST: false },
];

const WorldClockPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedTimezones, setSavedTimezones] = useLocalStorage<SavedTimeZone[]>(
    STORAGE_KEYS.worldClockTimezones, 
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeFormat, setTimeFormat] = useLocalStorage<'12' | '24'>(
    STORAGE_KEYS.worldClockFormat, 
    '12'
  );
  const [showSeconds, setShowSeconds] = useLocalStorage<boolean>(
    STORAGE_KEYS.worldClockShowSeconds, 
    true
  );
  const { showSuccess, showError } = useToast();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get current timezone info
  const getCurrentTimezone = (): TimeZoneInfo => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return {
      id: 'local',
      name: 'Local Time',
      timezone,
      country: 'Local',
      city: timezone.split('/').pop()?.replace(/_/g, ' ') || 'Local',
      offset: offsetString,
      isDST: false, // We'll calculate this properly
    };
  };

  const formatTime = (date: Date, timezone: string, format: '12' | '24' = timeFormat, includeSeconds: boolean = showSeconds) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: format === '12',
      };

      if (includeSeconds) {
        options.second = '2-digit';
      }

      return date.toLocaleTimeString('en-US', options);
    } catch (error) {
      return 'Invalid timezone';
    }
  };

  const formatDate = (date: Date, timezone: string) => {
    try {
      return date.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid timezone';
    }
  };

  const getTimezoneOffset = (timezone: string) => {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
      
      const hours = Math.floor(Math.abs(offset));
      const minutes = Math.abs(offset % 1) * 60;
      const sign = offset >= 0 ? '+' : '-';
      
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return '+00:00';
    }
  };

  const isDaytime = (timezone: string) => {
    try {
      const hour = parseInt(formatTime(currentTime, timezone, '24', false).split(':')[0]);
      return hour >= 6 && hour < 18;
    } catch (error) {
      return true;
    }
  };

  const addTimezone = (timezoneInfo: TimeZoneInfo, customName?: string) => {
    const newTimezone: SavedTimeZone = {
      ...timezoneInfo,
      addedAt: new Date(),
      customName,
      offset: getTimezoneOffset(timezoneInfo.timezone),
    };

    setSavedTimezones(prev => {
      // Check if timezone already exists
      if (prev.some(tz => tz.timezone === timezoneInfo.timezone)) {
        showError('This timezone is already added');
        return prev;
      }
      
      const updated = [...prev, newTimezone];
      trackToolUsage('world-clock', 'add-timezone', { timezone: timezoneInfo.timezone });
      showSuccess(`Added ${customName || timezoneInfo.name} to your world clock`);
      return updated;
    });

    setShowAddModal(false);
    setSearchQuery('');
  };

  const removeTimezone = (timezone: string) => {
    setSavedTimezones(prev => {
      const updated = prev.filter(tz => tz.timezone !== timezone);
      showSuccess('Timezone removed');
      return updated;
    });
  };

  const filteredTimezones = POPULAR_TIMEZONES.filter(tz =>
    tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.timezone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const convertTime = (fromTimezone: string, toTimezone: string, time: Date = currentTime) => {
    try {
      // Create a date object in the source timezone
      const sourceTime = new Date(time.toLocaleString('en-US', { timeZone: fromTimezone }));
      // Convert to target timezone
      const targetTime = new Date(time.toLocaleString('en-US', { timeZone: toTimezone }));
      return targetTime;
    } catch (error) {
      return time;
    }
  };

  const copyTimeToClipboard = async (timezone: string, name: string) => {
    try {
      const time = formatTime(currentTime, timezone);
      const date = formatDate(currentTime, timezone);
      const text = `${name}: ${time} - ${date}`;
      await navigator.clipboard.writeText(text);
      showSuccess(`${name} time copied to clipboard!`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const localTimezone = getCurrentTimezone();
  const allTimezones = [localTimezone, ...savedTimezones];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="World Clock - BrainDead"
        description="Track time across multiple timezones with our world clock. Perfect for remote teams, travelers, and global coordination."
        canonical="/world-clock"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          World Clock
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Know what time it is everywhere (except where you are).
          <span className="text-blue-400"> Perfect for scheduling meetings with people who live in the future!</span>
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>{savedTimezones.length} timezones tracked</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>Real-time updates</span>
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>No jet lag required</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Main Clock Display */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Timezone
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Format:</span>
                  <button
                    onClick={() => setTimeFormat(timeFormat === '12' ? '24' : '12')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      timeFormat === '12'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    12H
                  </button>
                  <button
                    onClick={() => setTimeFormat(timeFormat === '24' ? '12' : '24')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      timeFormat === '24'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    24H
                  </button>
                </div>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSeconds}
                    onChange={(e) => setShowSeconds(e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-400 text-sm">Show seconds</span>
                </label>
              </div>
            </div>
          </div>

          {/* Timezone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTimezones.map((tz, index) => {
              const isLocal = tz.id === 'local';
              const time = formatTime(currentTime, tz.timezone);
              const date = formatDate(currentTime, tz.timezone);
              const offset = getTimezoneOffset(tz.timezone);
              const isDay = isDaytime(tz.timezone);
              
              return (
                <div
                  key={tz.timezone}
                  className={`bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-6 hover:bg-gray-800/50 transition-all cursor-pointer ${
                    isLocal ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800'
                  }`}
                  onClick={() => copyTimeToClipboard(tz.timezone, tz.customName || tz.name)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {tz.customName || tz.name}
                        </h3>
                        {isLocal && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                            Local
                          </span>
                        )}
                        {isDay ? (
                          <Sun className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-blue-300" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {tz.city}, {tz.country}
                      </p>
                      <p className="text-gray-500 text-xs">
                        UTC{offset}
                      </p>
                    </div>
                    
                    {!isLocal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTimezone(tz.timezone);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">
                      {time}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {savedTimezones.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No timezones added yet</h3>
              <p className="text-gray-500 mb-6">
                Add some timezones to track time around the world
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all hover:scale-105 shadow-lg"
              >
                Add Your First Timezone
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Add */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-400" />
              Quick Add
            </h3>
            <div className="space-y-2">
              {POPULAR_TIMEZONES.slice(0, 6).map((tz) => (
                <button
                  key={tz.id}
                  onClick={() => addTimezone(tz)}
                  disabled={savedTimezones.some(saved => saved.timezone === tz.timezone)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    savedTimezones.some(saved => saved.timezone === tz.timezone)
                      ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{tz.name}</div>
                  <div className="text-xs text-gray-500">{tz.country}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Converter */}
          {savedTimezones.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-400" />
                Time Converter
              </h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>Click any timezone card to copy its current time to clipboard.</p>
                <p>Perfect for scheduling meetings across time zones!</p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🌍 Time Zone Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>DST:</strong> Daylight saving time is automatically handled</li>
              <li>• <strong>Meeting times:</strong> Click cards to copy times</li>
              <li>• <strong>Business hours:</strong> Sun/moon icons show day/night</li>
              <li>• <strong>UTC offset:</strong> Shows current offset from UTC</li>
              <li>• <strong>Local time:</strong> Your current timezone is highlighted</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Timezone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Timezone</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities, countries, or timezones..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Timezone List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTimezones.map((tz) => {
                const isAdded = savedTimezones.some(saved => saved.timezone === tz.timezone);
                const currentTime = formatTime(new Date(), tz.timezone);
                const offset = getTimezoneOffset(tz.timezone);
                
                return (
                  <button
                    key={tz.id}
                    onClick={() => !isAdded && addTimezone(tz)}
                    disabled={isAdded}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      isAdded
                        ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 text-white hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{tz.name}</div>
                        <div className="text-sm text-gray-400">
                          {tz.city}, {tz.country}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tz.timezone} (UTC{offset})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">{currentTime}</div>
                        {isAdded && (
                          <div className="text-xs text-green-400">Added</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTimezones.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No timezones found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldClockPage;