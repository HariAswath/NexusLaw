// src/pages/DraftAssistant.jsx
import { useState } from 'react';
import { MdAutoAwesome, MdContentCopy, MdClear, MdSave } from 'react-icons/md';
import Layout from '../components/Layout';
import { generateDraft } from '../api/ai';
import { useToast } from '../context/ToastContext';

const EXAMPLE_PROMPTS = [
  "Draft a formal 15-day legal notice for non-payment of rent.",
  "Write a summary for a hit-and-run criminal case.",
  "Create a bail application petition for a theft accused.",
  "Draft a letter to opposing counsel requesting a settlement meeting."
];

export default function DraftAssistant() {
  const [prompt, setPrompt]   = useState('');
  const [context, setContext] = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error }    = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return error('Please enter a prompt');
    
    setLoading(true);
    try {
      const text = await generateDraft(prompt, context);
      setResult(text);
      success('Draft generated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate draft. Please check your API key.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    success('Copied to clipboard!');
  };

  const handleClear = () => {
    setPrompt('');
    setContext('');
    setResult('');
  };

  return (
    <Layout title="AI Draft Assistant" subtitle="Powered by Gemini 1.5 Flash">
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', height: 'calc(100vh - 220px)' }}>
        
        {/* Left: Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
              Instructions & Context
            </h2>
            
            <div className="form-group mb-md">
              <label className="form-label">What do you want to draft?</label>
              <textarea 
                className="form-textarea" 
                placeholder="e.g. Draft a legal notice for breach of contract..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ height: '120px' }}
              />
            </div>

            <div className="form-group mb-lg">
              <label className="form-label">Additional Case Context (Optional)</label>
              <textarea 
                className="form-textarea" 
                placeholder="Names, dates, specific clauses or case details..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                style={{ height: '100px' }}
              />
            </div>

            <div className="mb-lg">
              <span className="form-label" style={{ display: 'block', marginBottom: 8 }}>Try an example:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EXAMPLE_PROMPTS.map((p, idx) => (
                  <button 
                    key={idx} 
                    className="badge badge-user" 
                    style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
                    onClick={() => setPrompt(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-sm" style={{ marginTop: 'auto' }}>
              <button className="btn btn-secondary" onClick={handleClear} style={{ flex: 1 }}>
                <MdClear /> Clear
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate} 
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <MdAutoAwesome />}
                {loading ? 'Generating...' : 'Generate Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)' }}>
              Generated Document
            </h2>
            {result && (
              <div className="flex gap-sm">
                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  <MdContentCopy /> Copy
                </button>
              </div>
            )}
          </div>
          
          <div className="draft-text-area" style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)', whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.6 }}>
            {result ? (
              result
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', itemsCenter: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <MdAutoAwesome style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }} />
                <p>Your AI-generated draft will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
