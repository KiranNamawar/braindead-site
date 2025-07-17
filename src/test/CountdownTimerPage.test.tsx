import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import CountdownTimerPage from '../pages/CountdownTimerPage';
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

describe('Countdown Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders countdown timer interface', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    expect(screen.getByText('Countdown Timer')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
    expect(screen.getByText('Start Timer')).toBeInTheDocument();
  });

  test('sets timer duration', () => {
    renderWithProviders(<CountdownTimerPage />);
    
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
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  test('pauses and resumes timer', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    
    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('resets timer', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('Start Timer')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  test('handles timer completion', async () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const secondsInput = screen.getByLabelText('Seconds');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(secondsInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    // Fast forward time
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Time\'s up!')).toBeInTheDocument();
    });
  });

  test('validates input values', () => {
    renderWithProviders(<CountdownTimerPage />);
    
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

  test('prevents starting with zero duration', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const startButton = screen.getByText('Start Timer');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Please set a timer duration')).toBeInTheDocument();
  });

  test('shows preset timer options', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  test('uses preset timer values', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const preset5min = screen.getByText('5 min');
    fireEvent.click(preset5min);
    
    const minutesInput = screen.getByLabelText('Minutes');
    expect(minutesInput).toHaveValue(5);
  });

  test('displays progress bar', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
    fireEvent.click(startButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles negative input values', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    fireEvent.change(minutesInput, { target: { value: '-5' } });
    
    expect(minutesInput).toHaveValue(0);
  });

  test('formats time display correctly', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const hoursInput = screen.getByLabelText('Hours');
    const minutesInput = screen.getByLabelText('Minutes');
    const secondsInput = screen.getByLabelText('Seconds');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(hoursInput, { target: { value: '2' } });
    fireEvent.change(minutesInput, { target: { value: '5' } });
    fireEvent.change(secondsInput, { target: { value: '3' } });
    fireEvent.click(startButton);
    
    expect(screen.getByText('02:05:03')).toBeInTheDocument();
  });

  test('saves timer to history', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '5' } });
    fireEvent.click(startButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('Recent Timers')).toBeInTheDocument();
  });

  test('enables sound notifications', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const soundToggle = screen.getByLabelText(/sound/i);
    fireEvent.click(soundToggle);
    
    expect(soundToggle).toBeChecked();
  });

  test('handles browser tab visibility changes', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const minutesInput = screen.getByLabelText('Minutes');
    const startButton = screen.getByText('Start Timer');
    
    fireEvent.change(minutesInput, { target: { value: '1' } });
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

  test('shows custom timer name input', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    expect(screen.getByPlaceholderText(/timer name/i)).toBeInTheDocument();
  });

  test('displays multiple active timers', () => {
    renderWithProviders(<CountdownTimerPage />);
    
    const addTimerButton = screen.getByText('Add Timer');
    fireEvent.click(addTimerButton);
    
    const timerTabs = screen.getAllByText(/Timer/);
    expect(timerTabs.length).toBeGreaterThan(1);
  });
});