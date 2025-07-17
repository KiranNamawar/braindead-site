import { describe, it, expect } from 'vitest';

// Loan calculation functions extracted for testing
const calculateLoanPayment = (principal: number, annualRate: number, years: number) => {
  const r = annualRate / 100 / 12; // Monthly interest rate
  const n = years * 12; // Total number of payments

  if (r === 0) {
    return principal / n;
  }

  // Standard loan payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(monthlyPayment * 100) / 100;
};

const calculateTotalInterest = (monthlyPayment: number, years: number, principal: number) => {
  const totalPayment = monthlyPayment * years * 12;
  return Math.round((totalPayment - principal) * 100) / 100;
};

describe('Loan Calculation Logic', () => {
  it('calculates monthly payment correctly for standard loan', () => {
    const principal = 250000;
    const annualRate = 6.5;
    const years = 30;
    
    const monthlyPayment = calculateLoanPayment(principal, annualRate, years);
    
    // Expected monthly payment for $250k at 6.5% for 30 years is approximately $1,580
    expect(monthlyPayment).toBeCloseTo(1580.17, 2);
  });

  it('calculates monthly payment correctly for zero interest', () => {
    const principal = 120000;
    const annualRate = 0;
    const years = 10;
    
    const monthlyPayment = calculateLoanPayment(principal, annualRate, years);
    
    // For 0% interest, monthly payment should be principal / (years * 12)
    expect(monthlyPayment).toBe(1000);
  });

  it('calculates total interest correctly', () => {
    const monthlyPayment = 1580.17;
    const years = 30;
    const principal = 250000;
    
    const totalInterest = calculateTotalInterest(monthlyPayment, years, principal);
    
    // Total interest should be total payments minus principal
    expect(totalInterest).toBeCloseTo(318861.2, 1);
  });

  it('handles different loan terms correctly', () => {
    const principal = 100000;
    const annualRate = 5;
    const years15 = 15;
    const years30 = 30;
    
    const payment15 = calculateLoanPayment(principal, annualRate, years15);
    const payment30 = calculateLoanPayment(principal, annualRate, years30);
    
    // 15-year loan should have higher monthly payment than 30-year
    expect(payment15).toBeGreaterThan(payment30);
    
    // Verify approximate values
    expect(payment15).toBeCloseTo(790.79, 2);
    expect(payment30).toBeCloseTo(536.82, 2);
  });

  it('handles high interest rates correctly', () => {
    const principal = 50000;
    const annualRate = 15;
    const years = 5;
    
    const monthlyPayment = calculateLoanPayment(principal, annualRate, years);
    
    // High interest rate should result in higher payment
    expect(monthlyPayment).toBeCloseTo(1189.97, 2);
  });

  it('handles small loan amounts correctly', () => {
    const principal = 5000;
    const annualRate = 8;
    const years = 2;
    
    const monthlyPayment = calculateLoanPayment(principal, annualRate, years);
    
    expect(monthlyPayment).toBeCloseTo(226.11, 2);
  });
});