import { useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { callGroq, buildModuleGenerationPrompt, parseGeneratedModule } from '../lib/groq';
import { Sparkles, Loader2, Wand2, FileText, Upload, Link, Type, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LearningModule } from '../types';

export default function CreateModuleView() {
  const { state, addModule } = useApp();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topic' | 'document' | 'url'>('topic');
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDocumentText(text.slice(0, 8000));
      if (!topic) {
        setTopic(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = useCallback(async () => {
    if (!state.apiKey) return;
    const promptContent = activeTab === 'topic' ? topic.trim() : documentText.trim();
    if (!promptContent) return;

    setLoading(true);
    setError(null);

    let desc = description.trim();
    if (activeTab === 'document' && documentText) {
      desc = `Based on this document content: ${documentText.slice(0, 2000)}\n\n${desc || 'Create a comprehensive learning module from this material.'}`;
    }

    const prompt = buildModuleGenerationPrompt(promptContent, desc || 'General learning');
    const result = await callGroq(prompt, state.apiKey);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    const generated = parseGeneratedModule(result.text);
    if (!generated) {
      setError('Failed to parse AI-generated module. Try again.');
      return;
    }
    const newModule: LearningModule = {
      id: `custom-${Date.now()}`,
      name: generated.name,
      icon: generated.icon || 'BookOpen',
      color: generated.color || '#FF9600',
      milestones: generated.milestones.map((m, i) => ({
        id: `custom-${Date.now()}-${i}`,
        title: m.title,
        description: m.description,
        locked: i !== 0,
        completed: false,
        exercises: m.exercises.map((e, j) => ({
          id: `custom-${Date.now()}-${i}-${j}`,
          type: e.type,
          prompt: e.prompt,
          options: e.options,
          correctAnswer: e.correctAnswer,
          blocks: e.blocks,
          context: e.context,
        })),
      })),
    };
    addModule(newModule);
    setTopic('');
    setDescription('');
    setDocumentText('');
    setFileName(null);
  }, [topic, description, documentText, activeTab, state.apiKey, addModule]);

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-extrabold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Create Module
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="duo-card p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-purple)' }}>
            <Wand2 size={20} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            AI Module Generator
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'topic', icon: Type, label: 'Topic' },
            { id: 'document', icon: FileText, label: 'Document' },
            { id: 'url', icon: Link, label: 'URL' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`duo-btn flex-1 flex items-center justify-center gap-2 h-10 text-xs ${active ? 'duo-btn-blue' : 'duo-btn-gray'}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Topic Tab */}
        {activeTab === 'topic' && (
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Microbiology Culture Media"
              className="w-full p-3 rounded-xl border-2 text-sm font-bold outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderBottomWidth: '4px', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        )}

        {/* Document Tab */}
        {activeTab === 'document' && (
          <div className="mb-4 space-y-3">
            {/* Drag & Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${dragActive ? 'border-solid' : ''}`}
              style={{
                backgroundColor: dragActive ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                borderColor: dragActive ? 'var(--accent-purple)' : 'var(--border-color)',
                opacity: dragActive ? 0.1 : 1,
              }}
            >
              <Upload size={32} className="mx-auto mb-2" style={{ color: 'var(--accent-purple)' }} />
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Drop a file here, or click to browse
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                Supports .txt, .md, .csv, .pdf (text extraction)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".txt,.md,.csv,.pdf,.doc,.docx"
                className="hidden"
              />
            </div>

            {/* Paste text area */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Or paste text directly
              </label>
              <textarea
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  if (!topic && e.target.value) {
                    setTopic(e.target.value.slice(0, 30) + '...');
                  }
                }}
                placeholder="Paste your notes, textbook excerpt, or any learning material here..."
                className="w-full p-3 rounded-xl border-2 text-sm font-medium outline-none transition-colors resize-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '120px' }}
              />
            </div>

            {/* File indicator */}
            {fileName && (
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-green-light)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {fileName}
                </span>
                <button
                  onClick={() => { setFileName(null); setDocumentText(''); }}
                  className="ml-auto p-1 rounded-md"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
              URL
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., https://en.wikipedia.org/wiki/Photosynthesis"
              className="w-full p-3 rounded-xl border-2 text-sm font-bold outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderBottomWidth: '4px', borderRadius: 'var(--radius-sm)' }}
            />
            <div className="text-xs font-medium mt-2" style={{ color: 'var(--text-muted)' }}>
              Note: We will use the URL as a topic reference. Paste the page content in the Document tab for better results.
            </div>
          </div>
        )}

        {/* Description - always visible */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Learning Goals (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to learn..."
            className="w-full p-3 rounded-xl border-2 text-sm font-bold outline-none transition-colors resize-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '80px', borderBottomWidth: '4px', borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleCreate}
          disabled={!state.apiKey || loading || (!topic.trim() && !documentText.trim())}
          className="duo-btn duo-btn-green w-full h-12 text-sm"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} className="mr-2" /> Generate Module</>}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--accent-red-light)', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {!state.apiKey && (
          <div className="mt-3 text-xs font-bold text-center" style={{ color: 'var(--text-muted)' }}>
            Add your Groq API key in Settings to generate modules.
          </div>
        )}
      </motion.div>
    </div>
  );
}
