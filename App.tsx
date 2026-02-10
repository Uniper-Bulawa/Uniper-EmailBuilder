import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ModuleData, ModuleType } from './types';
import { DEFAULT_MODULES } from './constants';
import { generateFullHtml } from './utils';
import ModuleItemEditor from './components/ModuleItemEditor';

const App: React.FC = () => {
  const [modules, setModules] = useState<ModuleData[]>(DEFAULT_MODULES);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(modules[0]?.id || null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const fullHtml = useMemo(() => generateFullHtml(modules), [modules]);

  const updateModule = useCallback((id: string, properties: any) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, properties } : m));
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (selectedModuleId === id) {
        setSelectedModuleId(filtered[0]?.id || null);
      }
      return filtered;
    });
  }, [selectedModuleId]);

  const moveModule = useCallback((id: string, direction: 'up' | 'down') => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      
      const currentModule = prev[index];
      const newModules = [...prev];

      if (direction === 'up') {
        if (index === 0) return prev;
        
        // Transition from Outside to Inside
        const prevModule = prev[index - 1];
        if (currentModule.section === 'outside' && prevModule.section === 'inside') {
          newModules[index] = { ...currentModule, section: 'inside' };
          return newModules;
        }

        // Normal swap
        [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];
      } else {
        if (index === prev.length - 1) return prev;

        // Transition from Inside to Outside
        const nextModule = prev[index + 1];
        if (currentModule.section === 'inside' && nextModule.section === 'outside') {
          newModules[index] = { ...currentModule, section: 'outside' };
          return newModules;
        }
        
        // Final boundary: if it's the last 'inside' module and there are no outside modules yet
        const lastInsideIndex = prev.reduce((last, m, i) => m.section === 'inside' ? i : last, -1);
        if (direction === 'down' && index === lastInsideIndex && index === prev.length - 1) {
           newModules[index] = { ...currentModule, section: 'outside' };
           return newModules;
        }

        // Normal swap
        [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
      }
      return newModules;
    });
  }, []);

  const addModule = (type: ModuleType) => {
    const id = `m-${Date.now()}`;
    const baseModule: Partial<ModuleData> = { id, type, section: 'inside' };
    
    switch (type) {
      case ModuleType.HEADER_LOGO:
        baseModule.properties = { imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_CO.png', align: 'right', altText: 'report_logo_CO.png' };
        break;
      case ModuleType.BANNER:
        baseModule.properties = { title: 'New Banner Title', color: '#0078DC' };
        break;
      case ModuleType.TEXT:
        baseModule.properties = { content: 'Add your text here...', align: 'left' };
        break;
      case ModuleType.IMAGE:
        baseModule.properties = { imageUrl: 'https://picsum.photos/640/300', altText: '300', align: 'center' };
        break;
      case ModuleType.TABLE:
        baseModule.properties = { 
          hasColumnHeaders: true,
          hasRowHeaders: false,
          gridRows: [
            { cells: ['Header 1', 'Header 2'] },
            { cells: ['Data 1', 'Data 2'] }
          ]
        };
        break;
      case ModuleType.BUTTON:
        baseModule.properties = { content: 'Call to action text', buttonText: 'Click Me', url: '#', color: '#0078DC' };
        break;
      case ModuleType.SIGNATURE:
        baseModule.properties = { content: 'Automatic Email Disclaimer', imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png', hasStarRating: true };
        baseModule.section = 'outside';
        break;
      case ModuleType.DELIVERY_PHASE:
        baseModule.properties = { selectedPhase: 'Assess' };
        break;
      case ModuleType.KPI_CARDS:
        baseModule.properties = { 
          metrics: [
            { value: '1.2M', label: 'Savings', color: '#00944A' },
            { value: '+15%', label: 'Efficiency', color: '#ED8C1C' },
            { value: 'On Track', label: 'Status', color: '#0078DC' }
          ] 
        };
        break;
      case ModuleType.TWO_COLUMN:
        baseModule.properties = { 
          imageUrl: 'https://picsum.photos/300/200', 
          content: 'Add your two-column text here. This layout works great for highlighting specific features or updates.',
          imagePosition: 'left'
        };
        break;
      case ModuleType.CHECKLIST:
        baseModule.properties = { 
          checklistItems: [
            { text: 'Completed task', icon: 'checked' },
            { text: 'Pending item', icon: 'empty' },
            { text: 'Important note', icon: 'blue' }
          ]
        };
        break;
    }
    
    setModules(prev => {
      // Add new inside modules after the last existing inside module
      const lastInsideIndex = prev.reduce((last, m, i) => m.section === 'inside' ? i : last, -1);
      const newModules = [...prev];
      if (baseModule.section === 'inside') {
        newModules.splice(lastInsideIndex + 1, 0, baseModule as ModuleData);
      } else {
        newModules.push(baseModule as ModuleData);
      }
      return newModules;
    });
    setSelectedModuleId(id);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullHtml);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    if (activeTab === 'code' && selectedModuleId) {
      setTimeout(() => {
        const element = document.getElementById(`code-block-${selectedModuleId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [activeTab, selectedModuleId]);

  const renderCodeSegments = () => {
    const segments = fullHtml.split(/(<!-- START_ID:.*? -->|<!-- END_ID:.*? -->)/);
    let currentId: string | null = null;
    let globalLineIndex = 1;
    
    return segments.map((segment, sIdx) => {
      if (segment.startsWith('<!-- START_ID:')) {
        currentId = segment.replace('<!-- START_ID:', '').replace(' -->', '');
        return null;
      }
      if (segment.startsWith('<!-- END_ID:')) {
        currentId = null;
        return null;
      }
      if (!segment && sIdx !== 0 && sIdx !== segments.length - 1) return null;

      const isSelected = currentId === selectedModuleId;
      const lines = segment.split('\n');
      
      return (
        <div 
          key={`segment-${sIdx}`}
          id={currentId ? `code-block-${currentId}` : undefined}
          className={`transition-all duration-300 ${isSelected ? 'bg-blue-500/10 border-l-4 border-blue-500 -ml-4 pl-3' : ''}`}
        >
          {lines.map((line, lIdx) => {
             if (sIdx === segments.length - 1 && lIdx === lines.length - 1 && !line) return null;
             const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
             return (
               <div key={lIdx} className="flex group leading-relaxed">
                 <div className="w-10 shrink-0 text-right pr-3 select-none opacity-25 group-hover:opacity-50 text-[10px] font-mono pt-1 text-blue-300 transition-opacity">
                   {globalLineIndex++}
                 </div>
                 <div 
                    className="whitespace-pre-wrap flex-1 py-0.5 text-blue-200"
                    style={{ 
                        paddingLeft: `${leadingSpaces}ch`, 
                        textIndent: `-${leadingSpaces}ch`,
                        overflowWrap: 'anywhere'
                    }}
                 >
                   {line || ' '}
                 </div>
               </div>
             );
          })}
        </div>
      );
    }).filter(Boolean);
  };

  const insideModules = modules.filter(m => m.section === 'inside');
  const outsideModules = modules.filter(m => m.section === 'outside');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <div className="w-96 border-r border-slate-200 flex flex-col h-full bg-white shadow-xl z-10">
        <div className="h-14 px-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img src="https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/DOT_small_bm.png" className="h-[20px] w-auto object-contain" alt="DOT Logo" />
            <div className="h-5 w-px bg-slate-200"></div>
            <h1 className="font-bold text-slate-800 text-sm whitespace-nowrap">Email Builder</h1>
          </div>
          <div className="relative group">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              ADD
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                {Object.values(ModuleType)
                  .sort((a, b) => a.replace(/_/g, ' ').localeCompare(b.replace(/_/g, ' ')))
                  .map(type => (
                    <button key={type} onClick={() => addModule(type)} className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0">
                      {type.replace(/_/g, ' ')}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
          {/* Main Body Section */}
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 ml-2 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Main Body
            </h3>
            {insideModules.length > 0 ? insideModules.map(module => (
              <ModuleItemEditor 
                key={module.id} 
                module={module} 
                isSelected={selectedModuleId === module.id}
                onSelect={setSelectedModuleId}
                onChange={updateModule}
                onRemove={removeModule}
                onMoveUp={(id) => moveModule(id, 'up')}
                onMoveDown={(id) => moveModule(id, 'down')}
              />
            )) : (
              <div className="text-[10px] text-slate-400 italic ml-2 mb-4">No modules inside main body</div>
            )}
          </div>

          {/* Outside Body Section */}
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 ml-2 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              Outside Body
            </h3>
            {outsideModules.length > 0 ? outsideModules.map(module => (
              <ModuleItemEditor 
                key={module.id} 
                module={module} 
                isSelected={selectedModuleId === module.id}
                onSelect={setSelectedModuleId}
                onChange={updateModule}
                onRemove={removeModule}
                onMoveUp={(id) => moveModule(id, 'up')}
                onMoveDown={(id) => moveModule(id, 'down')}
              />
            )) : (
              <div className="text-[10px] text-slate-400 italic ml-2">No modules outside main body</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
        <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Preview</button>
            <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Export HTML</button>
          </div>
          <button onClick={copyToClipboard} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'}`}>
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] relative">
          {activeTab === 'preview' ? (
            <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200">
              <iframe srcDoc={fullHtml} className="w-full h-[calc(100vh-160px)] border-none" title="Email Preview" />
            </div>
          ) : (
            <div className="w-full max-w-[1000px] h-full" ref={codeContainerRef}>
              <div className="bg-slate-900 text-blue-300 p-6 rounded-xl overflow-auto text-sm font-mono h-[calc(100vh-160px)] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 scroll-smooth custom-scrollbar">
                {renderCodeSegments()}
              </div>
            </div>
          )}
          <div className="absolute bottom-4 right-6 text-[10px] font-bold text-slate-400 pointer-events-none select-none uppercase tracking-widest opacity-50">
            v0.4.6
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;