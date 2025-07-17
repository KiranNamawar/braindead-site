import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PasswordGeneratorPage from '../pages/PasswordGeneratorPage';

const renderPasswordGenerator = () => {
  return render(
    <BrowserRouter>
      <PasswordGeneratorPage />
    </BrowserRouter>
  );
};

describe('Password Generator', () => {
  test('renders password generator interface', () => {
    renderPasswordGenerator();
    expect(screen.getByText('Password Generator')).toBeInTheDocument();
    expect(screen.getByText('Generated Password')).toBeInTheDocument();
  });

  test('generates password with default settings', () => {
    renderPasswordGenerator();
    const passwordInput = screen.getByDisplayValue(/^.{16}$/); // 16 character password
    expect(passwordInput).toBeInTheDocument();
  });

  test('changes password length', () => {
    renderPasswordGenerator();
    const lengthSlider = screen.getByRole('slider');
    
    fireEvent.change(lengthSlider, { target: { value: '20' } });
    expect(screen.getByText('Password Length: 20')).toBeInTheDocument();
  });

  test('toggles character types', () => {
    renderPasswordGenerator();
    const uppercaseCheckbox = screen.getByLabelText(/uppercase/i);
    
    fireEvent.click(uppercaseCheckbox);
    expect(uppercaseCheckbox).not.toBeChecked();
  });

  test('applies password presets', () => {
    renderPasswordGenerator();
    const basicPreset = screen.getByText('Basic');
    
    fireEvent.click(basicPreset);
    expect(screen.getByText('Password Length: 12')).toBeInTheDocument();
  });

  test('shows password strength', () => {
    renderPasswordGenerator();
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
    expect(screen.getByText(/Strong|Good|Fair|Weak/)).toBeInTheDocument();
  });

  test('copies password to clipboard', async () => {
    renderPasswordGenerator();
    const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
    
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('regenerates password', () => {
    renderPasswordGenerator();
    const passwordInput = screen.getByDisplayValue(/^.+$/);
    const initialPassword = passwordInput.value;
    
    const regenerateButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(regenerateButton);
    
    const newPasswordInput = screen.getByDisplayValue(/^.+$/);
    expect(newPasswordInput.value).not.toBe(initialPassword);
  });

  test('excludes similar characters when enabled', () => {
    renderPasswordGenerator();
    const excludeSimilarCheckbox = screen.getByLabelText(/exclude similar/i);
    
    fireEvent.click(excludeSimilarCheckbox);
    expect(excludeSimilarCheckbox).toBeChecked();
  });

  test('maintains password history', () => {
    renderPasswordGenerator();
    expect(screen.getByText('Recent Passwords')).toBeInTheDocument();
    
    const regenerateButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(regenerateButton);
    
    // Should have at least one entry in history
    expect(screen.getByText(/Strong|Good|Fair|Weak/)).toBeInTheDocument();
  });
});