
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ModuleData, ModuleType } from './types';
import { DEFAULT_MODULES } from './constants';
import { generateFullHtml } from './utils';
import ModuleItemEditor from './components/ModuleItemEditor';

const App: React.FC = () => {
  const [modules, setModules] = useState<ModuleData[]>(DEFAULT_MODULES);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);

  const fullHtml = useMemo(() => generateFullHtml(modules), [modules]);

  const updateModule = useCallback((id: string, properties: any) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, properties } : m));
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  }, []);

  const moveModule = useCallback((id: string, direction: 'up' | 'down') => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newModules = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
      return newModules;
    });
  }, []);

  const addModule = (type: ModuleType) => {
    const id = `m-${Date.now()}`;
    const baseModule: Partial<ModuleData> = { id, type };
    
    // Add default properties based on type
    switch (type) {
      case ModuleType.HEADER_LOGO:
        baseModule.properties = { imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_CO.png', align: 'right', altText: 'report_logo_CO.png' };
        break;
      case ModuleType.BANNER:
        baseModule.properties = { title: 'New Banner Title', color: '#0078DC' };
        break;
      case ModuleType.TEXT:
        baseModule.properties = { content: 'Add your text here...' };
        break;
      case ModuleType.IMAGE:
        baseModule.properties = { imageUrl: 'https://picsum.photos/640/300', altText: '300' };
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
        baseModule.properties = { content: 'Automatic Email Disclaimer', imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png' };
        break;
    }
    
    setModules(prev => [...prev, baseModule as ModuleData]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullHtml);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Modules Management */}
      <div className="w-96 border-r border-slate-200 flex flex-col h-full bg-white shadow-xl z-10">
        <div className="h-14 px-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img src="https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/DOT_small_bm.png" className="h-[20px] w-auto object-contain" alt="DOT Logo" />
            <div className="h-5 w-px bg-slate-200"></div>
            <h1 className="font-bold text-slate-800 text-sm whitespace-nowrap">
              Email Builder
            </h1>
          </div>
          
          <div className="relative group">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              ADD
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-1">
                {Object.values(ModuleType).map(type => (
                  <button 
                    key={type}
                    onClick={() => addModule(type)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
          {modules.map(module => (
            <ModuleItemEditor 
              key={module.id} 
              module={module} 
              onChange={updateModule}
              onRemove={removeModule}
              onMoveUp={(id) => moveModule(id, 'up')}
              onMoveDown={(id) => moveModule(id, 'down')}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
        <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Preview
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Export HTML
            </button>
          </div>
          
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'}`}
          >
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
          {activeTab === 'preview' ? (
            <div className="w-full max-w-[720px] bg-white rounded-xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200">
              <iframe 
                srcDoc={fullHtml} 
                className="w-full h-[calc(100vh-160px)] border-none"
                title="Email Preview"
              />
            </div>
          ) : (
            <div className="w-full max-w-[1000px] h-full">
              <pre className="bg-slate-900 text-blue-300 p-6 rounded-xl overflow-auto text-sm font-mono h-[calc(100vh-160px)] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800">
                {fullHtml}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
