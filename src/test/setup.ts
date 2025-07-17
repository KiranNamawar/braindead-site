import '@testing-library/jest-dom';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});

// Mock canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,test');
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => callback(new Blob()));

// Mock scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock anchor element click for downloads
HTMLAnchorElement.prototype.click = vi.fn();

// Mock FileReader
global.FileReader = class {
  readAsText = vi.fn();
  readAsDataURL = vi.fn();
  onload = null;
  result = '';
};

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test');
global.URL.revokeObjectURL = vi.fn();