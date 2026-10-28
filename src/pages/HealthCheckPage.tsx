import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Clock, 
  Database, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check,
  FileJson,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchHealthCheck, HealthCheckResult } from '../api/health';

export const HealthCheckPage: React.FC = () => {
  const { isUrdu, language } = useLanguage();
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const runHealthCheck = async () => {
    setLoading(true);
    const res = await fetchHealthCheck();
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const curlCommand = `curl -i http://localhost:3000/api/health`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-canvas">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-subtle border border-accent/30 text-xs text-accent-hover font-semibold mb-3">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'تشخیصی کنسول' : 'Diagnostic Console'}</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
          {isUrdu ? 'سسٹم اور اے پی آئی ویریفیکیشن' : 'API Health & System Verification'}
        </h1>
        <p className={`text-sm text-content-muted mt-2 font-normal ${isUrdu ? 'font-urdu-body' : 'font-sans'}`}>
          {isUrdu
            ? 'نوڈ جے ایس ایکسپریس بیک اینڈ، رسپانس کی رفتار اور زبان کے سیٹ اپ کی تصدیق کریں۔'
            : 'Verify the Node.js Express backend health endpoint, response latency, and runtime environment.'}
        </p>
      </div>

      {/* Main Status Panel */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${
              loading
                ? 'bg-accent-subtle border-accent/40 text-accent-hover'
                : result?.data?.status === 'ok'
                ? 'bg-success-subtle border-success/30 text-success'
                : 'bg-error-subtle border-error/30 text-error'
            }`}>
              {loading ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : result?.data?.status === 'ok' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className={`text-xl font-bold text-content ${isUrdu ? 'font-urdu-body font-bold' : ''}`}>
                  {loading
                    ? (isUrdu ? 'ٹیسٹ ہو رہا ہے...' : 'Testing Endpoint...')
                    : result?.data
                    ? (isUrdu ? 'بیک اینڈ کامیابی سے فعال ہے' : 'Backend API Operational')
                    : (isUrdu ? 'رابطہ منقطع' : 'Connection Failed')}
                </h2>
                {!loading && result?.data && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-subtle text-success border border-success/30">
                    HTTP 200 OK
                  </span>
                )}
              </div>
              <p className="text-xs text-content-muted mt-1 font-mono">
                GET /api/health • Port 3000 • Express • {language.toUpperCase()} (RTL: {isUrdu ? 'Yes' : 'No'})
              </p>
            </div>
          </div>

          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="min-h-[48px] h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'دوبارہ ٹیسٹ کریں' : 'Re-Check Health'}</span>
          </button>
        </div>

        {/* Metric Cards */}
        {result?.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-canvas p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs text-content-muted mb-1">
                <span>{isUrdu ? 'رسپانس کی رفتار' : 'Response Latency'}</span>
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold text-primary font-mono">
                {result.latencyMs} <span className="text-xs font-normal text-content-muted">ms</span>
              </p>
              <span className="text-xs text-success font-medium mt-1 block">
                {isUrdu ? 'انتہائی تیز رفتار' : 'Ultra-low local latency'}
              </span>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs text-content-muted mb-1">
                <span>{isUrdu ? 'سرور اپ ٹائم' : 'Process Uptime'}</span>
                <Server className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold text-content font-mono">
                {result.data.uptimeSeconds} <span className="text-xs font-normal text-content-muted">sec</span>
              </p>
              <span className="text-xs text-content-muted mt-1 block">
                {isUrdu ? 'لائیو نوڈ جے ایس سرور' : 'Live Node.js runtime'}
              </span>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs text-content-muted mb-1">
                <span>{isUrdu ? 'ڈیٹا بیس' : 'Database'}</span>
                <Database className="w-4 h-4 text-accent" />
              </div>
              <p className="text-base font-bold text-content font-mono mt-1">
                {result.data.database.status}
              </p>
              <span className="text-xs text-content-muted mt-1 block">
                {result.data.database.type} (Step 3)
              </span>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs text-content-muted mb-1">
                <span>{isUrdu ? 'زبان کی کیفیت' : 'Active Language'}</span>
                <Globe className="w-4 h-4 text-accent" />
              </div>
              <p className="text-base font-bold text-primary mt-1">
                {isUrdu ? 'اردو (RTL)' : 'English (LTR)'}
              </p>
              <span className="text-xs text-content-muted mt-1 block">
                {isUrdu ? 'نستعلیق / نسخ فونٹ فعال' : 'DM Sans / Playfair Display'}
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {result?.error && (
          <div className="mt-6 p-4 rounded-xl bg-error-subtle border border-error/30 text-error text-sm">
            <p className="font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Error contacting endpoint:
            </p>
            <p className="mt-1 font-mono text-xs">{result.error}</p>
          </div>
        )}

        {/* JSON Inspector */}
        {result?.data && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <FileJson className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu-body' : ''}>
                  {isUrdu ? 'تصدیق شدہ JSON ڈیٹا:' : 'Validated JSON Payload:'}
                </span>
              </div>
              <span className="text-xs text-content-muted font-mono">Content-Type: application/json</span>
            </div>
            <pre 
              dir="ltr"
              className="p-4 rounded-xl bg-canvas-subtle border border-border text-content font-mono text-xs overflow-x-auto leading-relaxed text-left shadow-inner"
            >
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Terminal Curl Instructions */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-content">
            <Terminal className="w-4 h-4 text-accent" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>
              {isUrdu ? 'ٹرمینل پر ٹیسٹ کرنے کا کمانڈ' : 'Terminal / cURL Test'}
            </span>
          </div>
          <button
            onClick={copyCurl}
            className="min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-canvas-subtle hover:bg-border text-xs text-content font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-accent" />}
            <span>{copied ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>
        <p className={`text-xs text-content-muted mb-3 font-normal ${isUrdu ? 'font-urdu-body' : ''}`}>
          {isUrdu
            ? 'آپ ٹرمینل یا پوسٹ مین سے بھی اس ہیلتھ چیک کو براہ راست ٹیسٹ کر سکتے ہیں:'
            : 'You can test the health check directly via shell or any REST client:'}
        </p>
        <div dir="ltr" className="p-3 rounded-lg bg-canvas-subtle border border-border font-mono text-xs text-content text-left">
          <code>{curlCommand}</code>
        </div>
      </div>
    </div>
  );
};
