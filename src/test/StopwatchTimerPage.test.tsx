import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import StopwatchTimerPage from '../pages/StopwatchTimerPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

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

describe('Stopwatch Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders stopwatch timer interface', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    expect(screen.getByText('Stopwatch & Timer')).toBeInTheDocument();
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  test('starts stopwatch', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Lap')).toBeInTheDocument();
  });

  test('pauses and resumes stopwatch', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    
    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('resets stopwatch', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Advance time
    vi.advanceTimersByTime(5000);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  test('records lap times', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Advance time and record lap
    vi.advanceTimersByTime(3000);
    
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    expect(screen.getByText('Lap 1')).toBeInTheDocument();
    expect(screen.getByText('00:03:00')).toBeInTheDocument();
  });

  test('records multiple lap times', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Record first lap
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    // Record second lap
    vi.advanceTimersByTime(3000);
    fireEvent.click(lapButton);
    
    expect(screen.getByText('Lap 1')).toBeInTheDocument();
    expect(screen.getByText('Lap 2')).toBeInTheDocument();
  });

  test('switches to timer mode', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
    expect(screen.getByText('Start Timer')).toBeInTheDocument();
  });

  test('sets timer duration', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const hoursInput = screen.getByLabelText('Hours');
    const minutesInput = screen.getByLabelText('Minutes');
    const secondsInput = screen.getByLabelText('Seconds');
    
    fireEvent.change(hoursInput, { target: { value: '1' } });
    fireEvent.change(minutesInput, { target: { value: '30' } });
    fireEvent.change(secondsInput, { target: { value: '45' } });
    
    expect(hoursInput).toHaveValue(1);
    expect(minutesInput).toHaveValue(30);
    expect(secondsInput).toHaveValue(45);
  });

  test('starts countdown timer', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '5' } });
    fireEvent.click(startButton);
    
    expect(screen.getByText('Pause Timer')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  test('countdown timer decreases', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    // Advance 30 seconds
    vi.advanceTimersByTime(30000);
    
    expect(screen.getByText('00:30')).toBeInTheDocument();
  });

  test('timer completes and shows alert', async () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const secondsInput = screen.getByLabelText('Seconds');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(secondsInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    // Complete timer
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Time\'s up!')).toBeInTheDocument();
    });
  });

  test('displays elapsed time accurately', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Advance 1 minute 30 seconds
    vi.advanceTimersByTime(90000);
    
    expect(screen.getByText('00:01:30')).toBeInTheDocument();
  });

  test('displays elapsed time in hours', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Advance 1 hour 5 minutes 30 seconds
    vi.advanceTimersByTime(3930000);
    
    expect(screen.getByText('01:05:30')).toBeInTheDocument();
  });

  test('shows milliseconds precision', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Advance 1.5 seconds
    vi.advanceTimersByTime(1500);
    
    expect(screen.getByText(/00:01:50/)).toBeInTheDocument();
  });

  test('clears lap times on reset', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Record a lap
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    // Reset
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.queryByText('Lap 1')).not.toBeInTheDocument();
  });

  test('validates timer input values', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const hoursInput = screen.getByLabelText('Hours');
    const minutesInput = screen.getByLabelText('Minutes');
    const secondsInput = screen.getByLabelText('Seconds');
    
    // Test maximum values
    fireEvent.change(hoursInput, { target: { value: '25' } });
    fireEvent.change(minutesInput, { target: { value: '70' } });
    fireEvent.change(secondsInput, { target: { value: '70' } });
    
    expect(hoursInput).toHaveValue(23); // Max 23 hours
    expect(minutesInput).toHaveValue(59); // Max 59 minutes
    expect(secondsInput).toHaveValue(59); // Max 59 seconds
  });

  test('prevents starting timer with zero duration', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const startButton = screen.getByText('Start Timer');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Please set a timer duration')).toBeInTheDocument();
  });

  test('shows timer preset options', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    expect(screen.getByText('1 min')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  test('uses timer preset values', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const preset5min = screen.getByText('5 min');
    fireEvent.click(preset5min);
    
    const minutesInput = screen.getByLabelText('Minutes');
    expect(minutesInput).toHaveValue(5);
  });

  test('copies stopwatch time to clipboard', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    vi.advanceTimersByTime(5000);
    
    const copyButton = screen.getByText('Copy Time');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('00:05:00');
  });

  test('exports lap times', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Record multiple laps
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    vi.advanceTimersByTime(3000);
    fireEvent.click(lapButton);
    
    const exportButton = screen.getByText('Export Laps');
    fireEvent.click(exportButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows fastest and slowest lap', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Record laps with different times
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    vi.advanceTimersByTime(5000);
    fireEvent.click(lapButton);
    
    vi.advanceTimersByTime(1000);
    fireEvent.click(lapButton);
    
    expect(screen.getByText('Fastest')).toBeInTheDocument();
    expect(screen.getByText('Slowest')).toBeInTheDocument();
  });

  test('handles keyboard shortcuts', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    // Space bar should start/pause
    fireEvent.keyDown(document, { key: ' ' });
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: ' ' });
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  test('shows split times between laps', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // First lap at 2 seconds
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    // Second lap at 5 seconds total (3 second split)
    vi.advanceTimersByTime(3000);
    fireEvent.click(lapButton);
    
    expect(screen.getByText('00:02:00')).toBeInTheDocument(); // First lap time
    expect(screen.getByText('00:03:00')).toBeInTheDocument(); // Split time
  });

  test('persists state across tab switches', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    vi.advanceTimersByTime(5000);
    
    // Switch to timer tab and back
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const stopwatchTab = screen.getByText('Stopwatch');
    fireEvent.click(stopwatchTab);
    
    // Should still be running
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('shows timer progress bar', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const timerTab = screen.getByText('Timer');
    fireEvent.click(timerTab);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles browser tab visibility changes', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true,
    });
    
    document.dispatchEvent(new Event('visibilitychange'));
    
    // Should continue running
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('shows average lap time', () => {
    renderWithProviders(<StopwatchTimerPage />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Record multiple laps
    vi.advanceTimersByTime(2000);
    const lapButton = screen.getByText('Lap');
    fireEvent.click(lapButton);
    
    vi.advanceTimersByTime(4000);
    fireEvent.click(lapButton);
    
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('00:03:00')).toBeInTheDocument(); // (2+4)/2 = 3 seconds
  });
});