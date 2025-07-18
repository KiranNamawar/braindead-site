// Mathematical Calculation Web Worker
// Handles heavy mathematical computations in the background

self.onmessage = function(event) {
  const { data, options } = event.data;
  const { operation, values, precision } = data;

  try {
    let result;
    
    switch (operation) {
      case 'factorial':
        result = calculateFactorial(values.n);
        break;
      case 'fibonacci':
        result = calculateFibonacci(values.n);
        break;
      case 'prime-factors':
        result = getPrimeFactors(values.n);
        break;
      case 'gcd':
        result = calculateGCD(values.a, values.b);
        break;
      case 'lcm':
        result = calculateLCM(values.a, values.b);
        break;
      case 'statistics':
        result = calculateStatistics(values.numbers);
        break;
      case 'matrix-multiply':
        result = multiplyMatrices(values.matrix1, values.matrix2);
        break;
      case 'solve-quadratic':
        result = solveQuadratic(values.a, values.b, values.c);
        break;
      case 'compound-interest':
        result = calculateCompoundInterest(values.principal, values.rate, values.time, values.compound);
        break;
      case 'loan-amortization':
        result = calculateLoanAmortization(values.principal, values.rate, values.years);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }

    self.postMessage({
      type: 'success',
      data: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

function calculateFactorial(n) {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers');
  if (n > 170) throw new Error('Number too large for factorial calculation');
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    
    // Report progress for large calculations
    if (i % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((i / n) * 100)
      });
    }
  }
  
  return result;
}

function calculateFibonacci(n) {
  if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
  if (n > 1000) throw new Error('Number too large for Fibonacci calculation');
  
  const sequence = [0, 1];
  
  for (let i = 2; i <= n; i++) {
    sequence[i] = sequence[i - 1] + sequence[i - 2];
    
    // Report progress for large calculations
    if (i % 50 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((i / n) * 100)
      });
    }
  }
  
  return {
    value: sequence[n],
    sequence: sequence.slice(0, Math.min(n + 1, 100)) // Return first 100 numbers max
  };
}

function getPrimeFactors(n) {
  if (n <= 1) return [];
  
  const factors = [];
  let divisor = 2;
  
  while (divisor * divisor <= n) {
    while (n % divisor === 0) {
      factors.push(divisor);
      n /= divisor;
    }
    divisor++;
    
    // Report progress for large numbers
    if (divisor % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.min(90, Math.round((divisor / Math.sqrt(n)) * 100))
      });
    }
  }
  
  if (n > 1) {
    factors.push(n);
  }
  
  return factors;
}

function calculateGCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
}

function calculateLCM(a, b) {
  return Math.abs(a * b) / calculateGCD(a, b);
}

function calculateStatistics(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Invalid input: expected non-empty array of numbers');
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = numbers.length;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = sum / n;
  
  // Report progress
  self.postMessage({
    type: 'progress',
    progress: 25
  });
  
  // Calculate variance and standard deviation
  const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  
  // Report progress
  self.postMessage({
    type: 'progress',
    progress: 50
  });
  
  // Calculate median
  let median;
  if (n % 2 === 0) {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  } else {
    median = sorted[Math.floor(n / 2)];
  }
  
  // Calculate mode
  const frequency = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  const maxFreq = Math.max(...Object.values(frequency));
  const modes = Object.keys(frequency)
    .filter(key => frequency[key] === maxFreq)
    .map(Number);
  
  // Report progress
  self.postMessage({
    type: 'progress',
    progress: 75
  });
  
  // Calculate quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  return {
    count: n,
    sum,
    mean: Math.round(mean * 1000000) / 1000000,
    median,
    mode: modes.length === n ? null : modes,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    variance: Math.round(variance * 1000000) / 1000000,
    standardDeviation: Math.round(standardDeviation * 1000000) / 1000000,
    q1,
    q3,
    iqr
  };
}

function multiplyMatrices(matrix1, matrix2) {
  const rows1 = matrix1.length;
  const cols1 = matrix1[0].length;
  const rows2 = matrix2.length;
  const cols2 = matrix2[0].length;
  
  if (cols1 !== rows2) {
    throw new Error('Matrix dimensions incompatible for multiplication');
  }
  
  const result = Array(rows1).fill().map(() => Array(cols2).fill(0));
  
  for (let i = 0; i < rows1; i++) {
    for (let j = 0; j < cols2; j++) {
      for (let k = 0; k < cols1; k++) {
        result[i][j] += matrix1[i][k] * matrix2[k][j];
      }
    }
    
    // Report progress
    if (i % 10 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((i / rows1) * 100)
      });
    }
  }
  
  return result;
}

function solveQuadratic(a, b, c) {
  if (a === 0) {
    if (b === 0) {
      return c === 0 ? { type: 'infinite', message: 'Infinite solutions' } : { type: 'none', message: 'No solution' };
    }
    return { type: 'linear', solution: -c / b };
  }
  
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant > 0) {
    const sqrt = Math.sqrt(discriminant);
    return {
      type: 'two-real',
      solutions: [
        (-b + sqrt) / (2 * a),
        (-b - sqrt) / (2 * a)
      ],
      discriminant
    };
  } else if (discriminant === 0) {
    return {
      type: 'one-real',
      solution: -b / (2 * a),
      discriminant
    };
  } else {
    const realPart = -b / (2 * a);
    const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
    return {
      type: 'complex',
      solutions: [
        { real: realPart, imaginary: imaginaryPart },
        { real: realPart, imaginary: -imaginaryPart }
      ],
      discriminant
    };
  }
}

function calculateCompoundInterest(principal, rate, time, compoundFrequency = 1) {
  const r = rate / 100;
  const amount = principal * Math.pow(1 + r / compoundFrequency, compoundFrequency * time);
  const interest = amount - principal;
  
  return {
    principal,
    rate,
    time,
    compoundFrequency,
    finalAmount: Math.round(amount * 100) / 100,
    totalInterest: Math.round(interest * 100) / 100,
    effectiveRate: Math.round(((amount / principal) ** (1 / time) - 1) * 10000) / 100
  };
}

function calculateLoanAmortization(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = principal / numPayments;
    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(principal * 100) / 100,
      totalInterest: 0,
      schedule: [] // Simple case, no detailed schedule needed
    };
  }
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const schedule = [];
  let remainingBalance = principal;
  let totalInterest = 0;
  
  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    totalInterest += interestPayment;
    
    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(Math.max(0, remainingBalance) * 100) / 100
    });
    
    // Report progress
    if (month % 12 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((month / numPayments) * 100)
      });
    }
  }
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round((monthlyPayment * numPayments) * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    schedule: schedule.slice(0, 12) // Return first year for preview
  };
}