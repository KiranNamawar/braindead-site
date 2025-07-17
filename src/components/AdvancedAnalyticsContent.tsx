import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Award, 
  Brain,
  Calendar,
  Zap,
  Trophy,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  Activity,
  Trash2
} from 'lucide-react';

interface AdvancedAnalyticsContentProps {
  getAdvancedInsights: () => any;
  getUsagePatterns: () => any;
  getProductivityReport: () => any;
  clearAllAnalytics: () => void;
}

const AdvancedAnalyticsContent: React.FC<AdvancedAnalyticsContentProps> = ({
  getAdvancedInsights,
  getUsagePatterns,
  getProductivityReport,
  clearAllAnalytics
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'patterns' | 'report'>('insights');

  const advancedInsights = useMemo(() => getAdvancedInsights(), [getAdvancedInsights]);
  const usagePatterns = useMemo(() => getUsagePatterns(), [getUsagePatterns]);
  const productivityReport = useMemo(() => getProductivityReport(), [getProductivityReport]);

  const handleClearAnalytics = () => {
    if (confirm('Are you sure you want to clear all analytics data? This will remove all session data, insights, and patterns. This action cannot be undone.')) {
      clearAllAnalytics();
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 4) return 'text-green-400';
    if (efficiency >= 3) return 'text-blue-400';
    if (efficiency >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFocusScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-4 border-b border-gray-700">
        {[
          { id: 'insights', label: 'Productivity Insights', icon: Brain },
          { id: 'patterns', label: 'Usage Patterns', icon: Activity },
          { id: 'report', label: 'Full Report', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Productivity Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Daily Productivity Chart */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Daily Productivity (Last 30 Days)</span>
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {Object.entries(advancedInsights.dailyProductivity)
                .slice(-30)
                .map(([date, productivity]) => {
                  const day = new Date(date).getDate();
                  const intensity = Math.min(1, (productivity as number) / 20);
                  return (
                    <div
                      key={date}
                      className="aspect-square rounded flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                        color: intensity > 0.5 ? 'white' : '#9CA3AF'
                      }}
                      title={`${date}: ${productivity} minutes saved`}
                    >
                      {day}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tool Efficiency Rankings */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Tool Efficiency Rankings</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(advancedInsights.toolEfficiency)
                .sort(([,a], [,b]) => (b as any).efficiency - (a as any).efficiency)
                .slice(0, 8)
                .map(([toolName, data]) => {
                  const { usage, timeSaved, efficiency } = data as any;
                  return (
                    <div key={toolName} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-white text-sm font-medium capitalize">
                          {toolName.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{usage} uses</span>
                        <span>{formatTime(timeSaved)}</span>
                        <span className={`font-medium ${getEfficiencyColor(efficiency)}`}>
                          {efficiency.toFixed(1)}m/use
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Peak Usage Hours */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Peak Usage Hours</span>
            </h4>
            <div className="grid grid-cols-12 gap-1">
              {Object.entries(advancedInsights.peakUsageHours).map(([hour, count]) => {
                const maxCount = Math.max(...Object.values(advancedInsights.peakUsageHours));
                const intensity = maxCount > 0 ? (count as number) / maxCount : 0;
                return (
                  <div
                    key={hour}
                    className="aspect-square rounded flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                      color: intensity > 0.5 ? 'white' : '#9CA3AF'
                    }}
                    title={`${hour}:00 - ${count} sessions`}
                  >
                    {hour}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mt-2">Hours (0-23)</div>
          </div>
        </div>
      )}

      {/* Usage Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {/* Usage Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{usagePatterns.mostActiveDay}</div>
              <div className="text-xs text-gray-400">Most Active Day</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{usagePatterns.mostActiveHour}:00</div>
              <div className="text-xs text-gray-400">Peak Hour</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{formatTime(usagePatterns.averageSessionLength)}</div>
              <div className="text-xs text-gray-400">Avg Session</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${getFocusScoreColor(usagePatterns.focusScore)}`}>
                {usagePatterns.focusScore}
              </div>
              <div className="text-xs text-gray-400">Focus Score</div>
            </div>
          </div>

          {/* Focus Analysis */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Focus & Consistency Analysis</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Tool Switching Frequency</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, usagePatterns.toolSwitchingFrequency * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400">{(usagePatterns.toolSwitchingFrequency * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Focus Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${usagePatterns.focusScore}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${getFocusScoreColor(usagePatterns.focusScore)}`}>
                    {usagePatterns.focusScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Streaks */}
          {usagePatterns.productivityStreaks.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Productivity Streaks</span>
              </h4>
              <div className="space-y-2">
                {usagePatterns.productivityStreaks.slice(0, 5).map((streak, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">
                        {streak.length} session streak
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(streak.start).toLocaleDateString()} - {new Date(streak.end).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Productivity Summary</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatTime(productivityReport.summary.totalTimeSaved)}
                </div>
                <div className="text-xs text-gray-400">Total Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {productivityReport.summary.totalSessions}
                </div>
                <div className="text-xs text-gray-400">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatTime(productivityReport.summary.averageProductivity)}
                </div>
                <div className="text-xs text-gray-400">Avg per Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 capitalize">
                  {productivityReport.summary.topTool.replace('-', ' ')}
                </div>
                <div className="text-xs text-gray-400">Top Tool</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {productivityReport.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-green-900/30 border border-green-700/50' 
                      : 'bg-gray-700/30 border border-gray-600/50'
                  }`}
                >
                  {achievement.unlocked ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                  <div>
                    <div className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                  </div>
                  {achievement.unlocked && (
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          {productivityReport.summary.improvementAreas.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Areas for Improvement</span>
              </h4>
              <div className="space-y-2">
                {productivityReport.summary.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-200 text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {productivityReport.recommendations.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Personalized Recommendations</span>
              </h4>
              <div className="space-y-2">
                {productivityReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-blue-200 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear Analytics Button */}
      <div className="flex justify-center pt-4 border-t border-gray-700">
        <button
          onClick={handleClearAnalytics}
          className="flex items-center space-x-2 px-4 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Clear All Analytics Data</span>
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsContent;