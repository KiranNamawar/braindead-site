import React, { useState, useCallback } from 'react';
import { Shield, Copy, Upload, Download, CheckCircle, XCircle, Eye, EyeOff, AlertTriangle, Info } from 'lucide-react';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

interface JWTPayload {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  error?: string;
  algorithm?: string;
  expiresAt?: Date;
  issuedAt?: Date;
  notBefore?: Date;
  issuer?: string;
  audience?: string;
  subject?: string;
}

const JWTDecoderPage: React.FC = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [decodedJWT, setDecodedJWT] = useState<JWTPayload | null>(null);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [error, setError] = useState('');
  const [showSignature, setShowSignature] = useState(false);

  const base64UrlDecode = useCallback((str: string): string => {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (err) {
      throw new Error('Invalid base64url encoding');
    }
  }, []);

  const decodeJWT = useCallback((token: string): JWTPayload => {
    if (!token.trim()) {
      throw new Error('JWT token is required');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
    }

    try {
      // Decode header
      const headerJson = base64UrlDecode(parts[0]);
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = base64UrlDecode(parts[1]);
      const payload = JSON.parse(payloadJson);

      // Extract signature (keep as base64url)
      const signature = parts[2];

      // Extract common claims
      const algorithm = header.alg;
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : undefined;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined;
      const notBefore = payload.nbf ? new Date(payload.nbf * 1000) : undefined;
      const issuer = payload.iss;
      const audience = payload.aud;
      const subject = payload.sub;

      return {
        header,
        payload,
        signature,
        isValid: true,
        algorithm,
        expiresAt,
        issuedAt,
        notBefore,
        issuer,
        audience,
        subject
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to decode JWT');
    }
  }, [base64UrlDecode]);

  const processJWT = useCallback(() => {
    if (!jwtToken.trim()) {
      setDecodedJWT(null);
      setError('');
      return;
    }

    if (jwtToken.length > LIMITS.maxTextLength) {
      setError(`JWT too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB`);
      setDecodedJWT(null);
      return;
    }

    try {
      const decoded = decodeJWT(jwtToken.trim());
      setDecodedJWT(decoded);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setDecodedJWT(null);
    }
  }, [jwtToken, decodeJWT]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      setError(`File too large. Maximum size is ${LIMITS.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJwtToken(content.trim());
    };
    reader.readAsText(file);
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTokenStatus = (decoded: JWTPayload) => {
    if (!decoded.expiresAt) {
      return { status: 'unknown', message: 'No expiration time' };
    }

    const now = new Date();
    const timeUntilExpiry = decoded.expiresAt.getTime() - now.getTime();

    if (timeUntilExpiry < 0) {
      return { status: 'expired', message: 'Token has expired' };
    } else if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
      return { status: 'expiring', message: 'Token expires soon' };
    } else {
      return { status: 'valid', message: 'Token is valid' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString() + ` (${Math.floor((date.getTime() - Date.now()) / 1000 / 60)} minutes from now)`;
  };

  const sampleJWTs = [
    {
      name: 'Basic JWT',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    },
    {
      name: 'JWT with Expiration',
      token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJpYXQiOjE2MDk0NTkyMDAsImV4cCI6MTYwOTQ2MjgwMCwiYXVkIjoiYXBpLmV4YW1wbGUuY29tIiwiaXNzIjoiYXV0aC5leGFtcGxlLmNvbSJ9.example-signature-here'
    },
    {
      name: 'JWT with Custom Claims',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNDU2IiwibmFtZSI6IkFsaWNlIEpvaG5zb24iLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjA5NDU5MjAwLCJleHAiOjE2MDk0NjI4MDAsImF1ZCI6WyJhcGkuZXhhbXBsZS5jb20iLCJ3ZWIuZXhhbXBsZS5jb20iXSwiaXNzIjoiYXV0aC5leGFtcGxlLmNvbSIsInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfQ.example-signature-here-with-custom-claims'
    }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processJWT();
    }, 300);
    return () => clearTimeout(timer);
  }, [processJWT]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
          JWT Decoder
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Decode and analyze JSON Web Tokens with detailed header and payload inspection.
          <span className="text-orange-400"> JWT structure explanation included!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* JWT Input */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">JWT Token</h3>
              <div className="flex items-center space-x-2">
                {decodedJWT?.isValid === true && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Valid</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Invalid</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".txt,.jwt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload JWT</span>
                </label>
              </div>

              <textarea
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                placeholder="Paste your JWT token here..."
                className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-orange-500 focus:outline-none"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sample JWTs */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample JWTs</h3>
            <div className="space-y-2">
              {sampleJWTs.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setJwtToken(sample.token)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">{sample.name}</div>
                  <div className="text-gray-400 text-xs font-mono truncate">{sample.token}</div>
                </button>
              ))}
            </div>
          </div>

          {/* JWT Structure Info */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔐 JWT Structure</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <span className="text-orange-400 font-semibold">Header:</span> Contains algorithm and token type
              </div>
              <div>
                <span className="text-orange-400 font-semibold">Payload:</span> Contains claims (user data)
              </div>
              <div>
                <span className="text-orange-400 font-semibold">Signature:</span> Verifies token integrity
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Format: header.payload.signature (base64url encoded)
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Token Status */}
          {decodedJWT && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Token Status</h3>
              
              <div className="space-y-4">
                {(() => {
                  const status = getTokenStatus(decodedJWT);
                  return (
                    <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
                      status.status === 'expired' 
                        ? 'bg-red-500/20 border-red-500/30' 
                        : status.status === 'expiring'
                        ? 'bg-yellow-500/20 border-yellow-500/30'
                        : 'bg-green-500/20 border-green-500/30'
                    }`}>
                      {status.status === 'expired' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : status.status === 'expiring' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <span className={`font-semibold ${
                        status.status === 'expired' 
                          ? 'text-red-400' 
                          : status.status === 'expiring'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {status.message}
                      </span>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 gap-4">
                  {decodedJWT.algorithm && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Algorithm:</span>
                      <span className="text-white font-mono">{decodedJWT.algorithm}</span>
                    </div>
                  )}
                  {decodedJWT.issuer && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Issuer:</span>
                      <span className="text-white font-mono">{decodedJWT.issuer}</span>
                    </div>
                  )}
                  {decodedJWT.subject && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Subject:</span>
                      <span className="text-white font-mono">{decodedJWT.subject}</span>
                    </div>
                  )}
                  {decodedJWT.audience && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Audience:</span>
                      <span className="text-white font-mono">
                        {Array.isArray(decodedJWT.audience) 
                          ? decodedJWT.audience.join(', ') 
                          : decodedJWT.audience}
                      </span>
                    </div>
                  )}
                  {decodedJWT.issuedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Issued At:</span>
                      <span className="text-white text-sm">{decodedJWT.issuedAt.toLocaleString()}</span>
                    </div>
                  )}
                  {decodedJWT.expiresAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Expires At:</span>
                      <span className="text-white text-sm">{formatDate(decodedJWT.expiresAt)}</span>
                    </div>
                  )}
                  {decodedJWT.notBefore && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Not Before:</span>
                      <span className="text-white text-sm">{decodedJWT.notBefore.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          {decodedJWT && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Header</h3>
                {copyFeedback && (
                  <span className="text-green-400 text-sm">{copyFeedback}</span>
                )}
              </div>

              <pre className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm overflow-x-auto">
                {JSON.stringify(decodedJWT.header, null, 2)}
              </pre>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decodedJWT.header, null, 2), 'Header')}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => downloadJSON(decodedJWT.header, 'jwt-header.json')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Payload */}
          {decodedJWT && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Payload</h3>
              </div>

              <pre className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm overflow-x-auto max-h-80 overflow-y-auto">
                {JSON.stringify(decodedJWT.payload, null, 2)}
              </pre>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2), 'Payload')}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => downloadJSON(decodedJWT.payload, 'jwt-payload.json')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Signature */}
          {decodedJWT && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Signature</h3>
                <button
                  onClick={() => setShowSignature(!showSignature)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 text-sm transition-colors flex items-center space-x-1"
                >
                  {showSignature ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showSignature ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              {showSignature ? (
                <div className="space-y-4">
                  <pre className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm overflow-x-auto break-all">
                    {decodedJWT.signature}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(decodedJWT.signature, 'Signature')}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <Info className="w-5 h-5" />
                    <span>Signature hidden for security</span>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Security Note:</div>
                <div className="text-yellow-300 text-sm">
                  This tool only decodes JWTs. Signature verification requires the secret key and should be done server-side.
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🛡️ Security Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Never share JWT tokens containing sensitive data</li>
              <li>• Always verify signatures server-side</li>
              <li>• Check expiration times before using tokens</li>
              <li>• Use HTTPS when transmitting JWTs</li>
              <li>• Store JWTs securely (not in localStorage for sensitive apps)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWTDecoderPage;