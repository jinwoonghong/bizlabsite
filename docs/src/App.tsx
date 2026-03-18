/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, ExternalLink, Search, Trash2, FileText, X, Sparkles, AlertCircle, Upload, Link as LinkIcon, Loader2, User, BookOpen, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Paper } from './types';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, et al.',
    year: 2017,
    journal: 'NIPS',
    url: 'https://arxiv.org/abs/1706.03762',
    dateAdded: '2024-03-10'
  }
];

export default function App() {
  const [papers, setPapers] = useState<Paper[]>(() => {
    const saved = localStorage.getItem('paperhub_data');
    return saved ? JSON.parse(saved) : INITIAL_PAPERS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    journal: '',
    author: ''
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Paper>>({
    title: '', authors: '', year: new Date().getFullYear(), journal: '', url: ''
  });

  useEffect(() => {
    localStorage.setItem('paperhub_data', JSON.stringify(papers));
  }, [papers]);

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      setError('제목과 URL은 필수 항목입니다.');
      return;
    }

    const paper: Paper = {
      id: crypto.randomUUID(),
      title: formData.title!,
      authors: formData.authors || 'Unknown',
      year: Number(formData.year) || new Date().getFullYear(),
      journal: formData.journal || 'N/A',
      url: formData.url!,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setPapers([paper, ...papers]);
    closeModal();
  };

  const extractMetadata = async (content: { text?: string, file?: { data: string, mimeType: string } }) => {
    setIsExtracting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      let prompt = "Extract academic paper metadata. Return ONLY a JSON object with keys: title, authors, year, journal, url. If a field is missing, use an empty string. For 'url', prioritize finding a DOI (convert to https://doi.org/ format), arXiv link, or the publisher's official page link. Translate title to Korean if possible, but keep original authors.";
      let parts: any[] = [{ text: prompt }];

      if (content.text) {
        parts.push({ text: `Input (could be a URL or text snippet): ${content.text}` });
      }
      if (content.file) {
        parts.push({
          inlineData: {
            data: content.file.data,
            mimeType: content.file.mimeType
          }
        });
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts }],
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(result.text);
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        authors: data.authors || prev.authors,
        year: data.year || prev.year,
        journal: data.journal || prev.journal,
        url: data.url || prev.url || (content.text && content.text.startsWith('http') ? content.text : '')
      }));
    } catch (err) {
      console.error(err);
      setError('메타데이터 추출에 실패했습니다. 수동으로 입력해 주세요.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      await extractMetadata({ file: { data: base64, mimeType: file.type } });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlExtract = async () => {
    if (!formData.url) return;
    await extractMetadata({ text: formData.url });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', authors: '', year: new Date().getFullYear(), journal: '', url: '' });
    setError(null);
  };

  const filteredPapers = papers.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.journal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = !filters.year || p.year.toString() === filters.year;
    const matchesJournal = !filters.journal || p.journal === filters.journal;
    const matchesAuthor = !filters.author || p.authors.toLowerCase().includes(filters.author.toLowerCase());
    
    return matchesSearch && matchesYear && matchesJournal && matchesAuthor;
  });

  const uniqueYears = Array.from(new Set(papers.map(p => p.year))).sort((a: number, b: number) => b - a);
  const uniqueJournals = Array.from(new Set(papers.map(p => p.journal))).sort();

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#141414] font-sans selection:bg-[#B11F24] selection:text-white">
      <header className="border-b-4 border-[#B11F24] p-4 md:p-8 flex flex-col md:flex-row justify-between items-center sticky top-0 bg-[#F8F7F4] z-10 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#B11F24] flex items-center justify-center text-white font-serif text-2xl md:text-3xl font-bold rounded-sm shrink-0">B</div>
          <div>
            <h1 className="font-serif text-xl md:text-3xl font-bold tracking-tight">Business Archive</h1>
            <p className="text-[10px] md:text-sm uppercase tracking-widest text-[#B11F24] font-bold mt-1">Sogang University GS Metaverse</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#B11F24] text-white px-6 md:px-8 py-3 md:py-4 hover:bg-[#8E191D] transition-all shadow-xl rounded-sm"
        >
          <Plus size={20} />
          <span className="text-xs md:text-sm font-black uppercase tracking-widest">연구 등록</span>
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 mb-8 md:mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-[#B11F24] transition-all" size={24} />
            <input 
              type="text" 
              placeholder="아카이브 통합 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#141414]/10 focus:border-[#B11F24] pl-12 md:pl-16 pr-4 py-4 md:py-8 focus:outline-none text-xl md:text-3xl font-serif italic placeholder:opacity-20 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-5 py-2.5 border-2 border-[#141414] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 h-fit ${isFilterOpen ? 'bg-[#141414] text-white' : 'hover:bg-[#141414] hover:text-white'}`}
          >
            {isFilterOpen ? <X size={14} /> : <Search size={14} />}
            상세 필터
          </button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 p-6 md:p-8 bg-white border border-[#141414]/10 rounded-sm shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black opacity-40">발행 연도</label>
                  <select 
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    className="w-full bg-transparent border-b border-[#141414]/20 py-2 focus:outline-none focus:border-[#B11F24] text-sm font-mono"
                  >
                    <option value="">전체 연도</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black opacity-40">학술지 / 컨퍼런스</label>
                  <select 
                    value={filters.journal}
                    onChange={(e) => setFilters({...filters, journal: e.target.value})}
                    className="w-full bg-transparent border-b border-[#141414]/20 py-2 focus:outline-none focus:border-[#B11F24] text-sm"
                  >
                    <option value="">전체 학술지</option>
                    {uniqueJournals.map(journal => (
                      <option key={journal} value={journal}>{journal}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black opacity-40">저자 검색</label>
                  <input 
                    type="text"
                    placeholder="저자 이름 입력..."
                    value={filters.author}
                    onChange={(e) => setFilters({...filters, author: e.target.value})}
                    className="w-full bg-transparent border-b border-[#141414]/20 py-2 focus:outline-none focus:border-[#B11F24] text-sm"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button 
                    onClick={() => setFilters({ year: '', journal: '', author: '' })}
                    className="text-[10px] uppercase tracking-widest font-black text-[#B11F24] hover:underline"
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-[#141414]/10 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[80px_2fr_1fr_1fr_140px] p-6 border-b-2 border-[#141414] bg-[#141414]/5 opacity-60 uppercase text-[11px] tracking-[0.3em] font-black">
            <div>INDEX</div>
            <div>Title & Authors</div>
            <div>Journal</div>
            <div>Year</div>
            <div className="text-right">Actions</div>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredPapers.map((paper, index) => (
              <motion.div 
                key={paper.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col md:grid md:grid-cols-[80px_2fr_1fr_1fr_140px] p-6 md:p-8 border-b border-[#141414]/10 hover:bg-[#B11F24]/5 transition-all group items-start md:items-center gap-4 md:gap-0"
              >
                <div className="font-mono text-xs md:text-sm opacity-30">#{String(index + 1).padStart(3, '0')}</div>
                <div className="w-full">
                  <h3 className="font-serif text-xl md:text-2xl leading-tight mb-2 md:mb-3 group-hover:text-[#B11F24] transition-colors">{paper.title}</h3>
                  <div className="flex items-center gap-2 opacity-60">
                    <User size={12} />
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{paper.authors}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-tighter opacity-80">
                  <BookOpen size={14} className="opacity-40" />
                  <span className="md:hidden text-[10px] uppercase tracking-widest font-black opacity-40 mr-1">Journal:</span>
                  {paper.journal}
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-tighter opacity-80">
                  <Calendar size={14} className="opacity-40" />
                  <span className="md:hidden text-[10px] uppercase tracking-widest font-black opacity-40 mr-1">Year:</span>
                  {paper.year}
                </div>
                <div className="flex justify-end gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex justify-center p-3 md:p-4 bg-white hover:bg-[#B11F24] hover:text-white rounded-sm transition-all border border-[#141414]/10 shadow-sm">
                    <ExternalLink size={18} md:size={20} />
                  </a>
                  <button 
                    onClick={() => setPapers(papers.filter(p => p.id !== paper.id))}
                    className="flex-1 md:flex-none flex justify-center p-3 md:p-4 bg-white hover:bg-red-600 hover:text-white rounded-sm transition-all border border-[#141414]/10 shadow-sm"
                  >
                    <Trash2 size={18} md:size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-[#141414]/80 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }} 
              className="relative bg-[#F8F7F4] w-full max-w-3xl border-t-8 border-[#B11F24] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-6 md:p-10 border-b border-[#141414]/10 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl md:text-4xl font-bold">Business Archive 등록</h2>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B11F24] font-bold mt-2">New Research Entry</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-[#141414]/5 rounded-full transition-all"><X size={24} md:size={36} /></button>
              </div>

              <div className="p-6 md:p-10">
                <div className="mb-8 md:mb-12 p-6 md:p-8 border-2 border-dashed border-[#B11F24]/20 rounded-sm bg-[#B11F24]/5">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={20} md:size={24} className="text-[#B11F24]" />
                    <span className="text-[10px] md:text-xs uppercase tracking-widest font-black text-[#B11F24]">AI 스마트 메타데이터 추출</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isExtracting}
                      className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4 p-6 md:p-8 bg-white border-2 border-[#141414]/10 hover:border-[#B11F24] hover:bg-[#B11F24] hover:text-white transition-all group disabled:opacity-50 shadow-sm"
                    >
                      {isExtracting ? <Loader2 className="animate-spin" size={24} md:size={32} /> : <Upload size={24} md:size={32} />}
                      <span className="text-[10px] md:text-xs uppercase font-black tracking-widest">PDF 파일 업로드</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                    
                    <button 
                      onClick={handleUrlExtract}
                      disabled={isExtracting || !formData.url}
                      className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4 p-6 md:p-8 bg-white border-2 border-[#141414]/10 hover:border-[#B11F24] hover:bg-[#B11F24] hover:text-white transition-all group disabled:opacity-50 shadow-sm"
                    >
                      {isExtracting ? <Loader2 className="animate-spin" size={24} md:size={32} /> : <LinkIcon size={24} md:size={32} />}
                      <span className="text-[10px] md:text-xs uppercase font-black tracking-widest">URL에서 추출</span>
                    </button>
                  </div>
                  <p className="mt-4 text-[9px] md:text-[10px] opacity-50 text-center italic">PDF를 업로드하거나 URL을 입력한 뒤 버튼을 누르면 AI가 논문 정보를 자동으로 분석합니다.</p>
                </div>

                {error && (
                  <div className="mb-8 p-4 md:p-5 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs md:text-sm flex items-center gap-3">
                    <AlertCircle size={18} md:size={20} /> {error}
                  </div>
                )}

                <form onSubmit={handleAddPaper} className="space-y-6 md:space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] uppercase tracking-widest font-black opacity-40">논문 제목 (Title)</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full bg-transparent border-b-2 border-[#141414]/10 focus:border-[#B11F24] py-3 md:py-4 focus:outline-none font-serif text-xl md:text-3xl transition-all" 
                      placeholder="논문 제목을 입력하세요"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-[11px] uppercase tracking-widest font-black opacity-40">저자 (Authors)</label>
                      <input 
                        type="text" 
                        value={formData.authors} 
                        onChange={e => setFormData({...formData, authors: e.target.value})} 
                        className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#B11F24] py-2 md:py-3 focus:outline-none text-sm md:text-base transition-all" 
                        placeholder="저자 정보를 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-[11px] uppercase tracking-widest font-black opacity-40">발행 연도 (Year)</label>
                      <input 
                        type="number" 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} 
                        className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#B11F24] py-2 md:py-3 focus:outline-none text-sm md:text-base font-mono transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-[11px] uppercase tracking-widest font-black opacity-40">학술지 / 컨퍼런스</label>
                      <input 
                        type="text" 
                        value={formData.journal} 
                        onChange={e => setFormData({...formData, journal: e.target.value})} 
                        className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#B11F24] py-2 md:py-3 focus:outline-none text-sm md:text-base transition-all" 
                        placeholder="e.g. Nature, NeurIPS"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-[11px] uppercase tracking-widest font-black opacity-40">원문 URL</label>
                      <input 
                        required 
                        type="url" 
                        value={formData.url} 
                        onChange={e => setFormData({...formData, url: e.target.value})} 
                        className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#B11F24] py-2 md:py-3 focus:outline-none text-sm md:text-base font-mono transition-all" 
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#B11F24] text-white py-4 md:py-6 uppercase tracking-[0.3em] font-black hover:bg-[#8E191D] transition-all shadow-2xl rounded-sm text-xs md:text-sm"
                  >
                    아카이브에 저장하기
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="p-8 md:p-16 border-t border-[#141414]/10 mt-16 md:mt-32 bg-white flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#B11F24] flex items-center justify-center text-white font-serif text-xl font-bold rounded-sm">B</div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest">Business Archive</p>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Sogang University GS Metaverse</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Business Research Archive</p>
          <p className="text-[9px] opacity-30 mt-2 italic">AI-Powered Academic Repository System v2.0</p>
        </div>
      </footer>
    </div>
  );
}
