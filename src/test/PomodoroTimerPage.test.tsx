import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import PomodoroTimerPage from '../pages/PomodoroTimerPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

// Mock audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock Notification API
global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
}));
global.Notification.permission = 'granted';
global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

describe('Pomodoro Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders pomodoro timer interface', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Start Focus')).toBeInTheDocument();
    expect(screen.getByText('Work Session')).toBeInTheDocument();
  });

  test('starts work session', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Working...')).toBeInTheDocument();
  });

  test('pauses and resumes timer', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    
    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('resets timer', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('Start Focus')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  test('completes work session and starts break', async () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Fast forward 25 minutes
    vi.advanceTimersByTime(25 * 60 * 1000);
    
    await waitFor(() => {
      expect(screen.getByText('Break Time!')).toBeInTheDocument();
      expect(screen.getByText('Short Break')).toBeInTheDocument();
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });
  });

  test('starts short break session', async () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Complete work session
    vi.advanceTimersByTime(25 * 60 * 1000);
    
    await waitFor(() => {
      const startBreakButton = screen.getByText('Start Break');
      fireEvent.click(startBreakButton);
      
      expect(screen.getByText('On Break...')).toBeInTheDocument();
    });
  });

  test('completes long break after 4 sessions', async () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    // Complete 4 work sessions
    for (let i = 0; i < 4; i++) {
      const startButton = screen.getByText(/Start/);
      fireEvent.click(startButton);
      
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      await waitFor(() => {
        if (i < 3) {
          expect(screen.getByText('Short Break')).toBeInTheDocument();
        } else {
          expect(screen.getByText('Long Break')).toBeInTheDocument();
          expect(screen.getByText('15:00')).toBeInTheDocument();
        }
      });
      
      if (i < 3) {
        const startBreakButton = screen.getByText('Start Break');
        fireEvent.click(startBreakButton);
        vi.advanceTimersByTime(5 * 60 * 1000);
      }
    }
  });

  test('customizes work duration', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const workDurationInput = screen.getByLabelText(/work duration/i);
    fireEvent.change(workDurationInput, { target: { value: '30' } });
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('30:00')).toBeInTheDocument();
  });

  test('customizes break durations', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const shortBreakInput = screen.getByLabelText(/short break/i);
    const longBreakInput = screen.getByLabelText(/long break/i);
    
    fireEvent.change(shortBreakInput, { target: { value: '10' } });
    fireEvent.change(longBreakInput, { target: { value: '20' } });
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    // Start and complete a work session to see break duration
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    vi.advanceTimersByTime(25 * 60 * 1000);
    
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  test('shows session statistics', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    expect(screen.getByText('Today\'s Sessions')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
  });

  test('tracks completed sessions', async () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Complete work session
    vi.advanceTimersByTime(25 * 60 * 1000);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Sessions completed
    });
  });

  test('enables sound notifications', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const soundToggle = screen.getByLabelText(/sound notifications/i);
    fireEvent.click(soundToggle);
    
    expect(soundToggle).toBeChecked();
  });

  test('enables desktop notifications', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const notificationToggle = screen.getByLabelText(/desktop notifications/i);
    fireEvent.click(notificationToggle);
    
    expect(notificationToggle).toBeChecked();
  });

  test('shows progress ring', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('updates progress as time passes', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Advance 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);
    
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  test('skips current session', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);
    
    expect(screen.getByText('Break Time!')).toBeInTheDocument();
  });

  test('shows task input during work session', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    expect(screen.getByPlaceholderText(/what are you working on/i)).toBeInTheDocument();
  });

  test('saves current task', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    const taskInput = screen.getByPlaceholderText(/what are you working on/i);
    fireEvent.change(taskInput, { target: { value: 'Writing tests' } });
    
    expect(taskInput).toHaveValue('Writing tests');
  });

  test('shows session history', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
  });

  test('handles auto-start breaks setting', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const autoStartToggle = screen.getByLabelText(/auto-start breaks/i);
    fireEvent.click(autoStartToggle);
    
    expect(autoStartToggle).toBeChecked();
  });

  test('auto-starts break when enabled', async () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    // Enable auto-start
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const autoStartToggle = screen.getByLabelText(/auto-start breaks/i);
    fireEvent.click(autoStartToggle);
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    // Start work session
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Complete work session
    vi.advanceTimersByTime(25 * 60 * 1000);
    
    await waitFor(() => {
      expect(screen.getByText('On Break...')).toBeInTheDocument();
    });
  });

  test('shows different themes', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    fireEvent.change(themeSelect, { target: { value: 'forest' } });
    
    expect(themeSelect).toHaveValue('forest');
  });

  test('handles browser tab visibility', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true,
    });
    
    document.dispatchEvent(new Event('visibilitychange'));
    
    // Timer should continue running
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('shows motivational quotes', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const startButton = screen.getByText('Start Focus');
    fireEvent.click(startButton);
    
    expect(screen.getByText(/focus/i)).toBeInTheDocument();
  });

  test('validates custom durations', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const workDurationInput = screen.getByLabelText(/work duration/i);
    fireEvent.change(workDurationInput, { target: { value: '0' } });
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    expect(screen.getByText(/duration must be greater than 0/i)).toBeInTheDocument();
  });

  test('limits maximum duration', () => {
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const workDurationInput = screen.getByLabelText(/work duration/i);
    fireEvent.change(workDurationInput, { target: { value: '120' } });
    
    expect(workDurationInput).toHaveValue(60); // Should cap at maximum
  });

  test('persists settings in localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    renderWithProviders(<PomodoroTimerPage />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const workDurationInput = screen.getByLabelText(/work duration/i);
    fireEvent.change(workDurationInput, { target: { value: '30' } });
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    expect(setItemSpy).toHaveBeenCalledWith(
      expect.stringContaining('pomodoro'),
      expect.stringContaining('30')
    );
  });

  test('restores settings from localStorage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue(JSON.stringify({ workDuration: 30 }));
    
    renderWithProviders(<PomodoroTimerPage />);
    
    expect(screen.getByText('30:00')).toBeInTheDocument();
  });
});