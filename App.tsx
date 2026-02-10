import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ModuleData, ModuleType, Template } from './types';
import { DEFAULT_MODULES } from './constants';
import { generateFullHtml } from './utils';
import ModuleItemEditor from './components/ModuleItemEditor';

const APP_VERSION = 'v0.8.1';
const STORAGE_KEY = 'dot_email_templates';

const App: React.FC = () => {
  const [modules, setModules] = useState<ModuleData[]>(DEFAULT_MODULES);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalName, setSaveModalName] = useState('');
  
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isPreviewDarkMode, setIsPreviewDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(modules[0]?.id || null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Persistence: Load templates on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let loadedTemplates: Template[] = [];
    
    if (saved) {
      try {
        loadedTemplates = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }

    // Initialize Demo template if it doesn't exist
    if (!loadedTemplates.some(t => t.name === 'Demo')) {
      const demoTemplate: Template = {
        id: 'tpl-demo',
        name: 'Demo',
        modules: DEFAULT_MODULES,
        lastModified: Date.now()
      };
      loadedTemplates = [demoTemplate, ...loadedTemplates];
    }

    setTemplates(loadedTemplates);
    
    // Load Demo by default
    const demo = loadedTemplates.find(t => t.name === 'Demo');
    if (demo) {
      setModules(demo.modules);
      setCurrentTemplateId(demo.id);
    }
  }, []);

  // Persistence: Save templates to localStorage when changed
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates]);

  const exportHtml = useMemo(() => generateFullHtml(modules, false), [modules]);
  const previewHtml = useMemo(() => generateFullHtml(modules, isPreviewDarkMode), [modules, isPreviewDarkMode]);

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

  const duplicateModule = useCallback((id: string) => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      const sourceModule = prev[index];
      const newId = `m-dup-${Date.now()}`;
      const newModule: ModuleData = {
        ...sourceModule,
        id: newId,
        properties: JSON.parse(JSON.stringify(sourceModule.properties))
      };
      const newModules = [...prev];
      newModules.splice(index + 1, 0, newModule);
      setSelectedModuleId(newId);
      return newModules;
    });
  }, []);

  const moveModule = useCallback((id: string, direction: 'up' | 'down') => {
    setModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      const currentModule = prev[index];
      const newModules = [...prev];
      if (direction === 'up') {
        if (index === 0) return prev;
        const prevModule = prev[index - 1];
        if (currentModule.section === 'outside' && prevModule.section === 'inside') {
          newModules[index] = { ...currentModule, section: 'inside' };
          return newModules;
        }
        [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];
      } else {
        if (index === prev.length - 1) return prev;
        const nextModule = prev[index + 1];
        if (currentModule.section === 'inside' && nextModule.section === 'outside') {
          newModules[index] = { ...currentModule, section: 'outside' };
          return newModules;
        }
        const lastInsideIndex = prev.reduce((last, m, i) => m.section === 'inside' ? i : last, -1);
        if (direction === 'down' && index === lastInsideIndex && index === prev.length - 1) {
           newModules[index] = { ...currentModule, section: 'outside' };
           return newModules;
        }
        [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
      }
      return newModules;
    });
  }, []);

  const openSaveModal = () => {
    const active = templates.find(t => t.id === currentTemplateId);
    setSaveModalName(active?.name || '');
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = (overwrite: boolean) => {
    if (!saveModalName.trim()) return;

    if (overwrite && currentTemplateId) {
      setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { 
        ...t, 
        name: saveModalName, 
        modules: JSON.parse(JSON.stringify(modules)), 
        lastModified: Date.now() 
      } : t));
    } else {
      const newTemplate: Template = {
        id: `tpl-${Date.now()}`,
        name: saveModalName,
        modules: JSON.parse(JSON.stringify(modules)),
        lastModified: Date.now()
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setCurrentTemplateId(newTemplate.id);
    }
    setIsSaveModalOpen(false);
  };

  const loadTemplate = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    if (tpl) {
      setModules(JSON.parse(JSON.stringify(tpl.modules)));
      setCurrentTemplateId(tpl.id);
      setIsTemplatePanelOpen(false);
      setSelectedModuleId(tpl.modules[0]?.id || null);
    }
  };

  const deleteTemplate = (id: string) => {
    if (templates.find(t => t.id === id)?.name === 'Demo') {
      alert("You cannot delete the Demo template.");
      return;
    }
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (currentTemplateId === id) setCurrentTemplateId(null);
    }
  };

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
        baseModule.properties = { content: "Dear @{replace('!!!','Recipient')},\n\nAdd your text here...", align: 'left' };
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
        baseModule.properties = { content: '<b>Automatic Email Disclaimer</b>', imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png', hasStarRating: true };
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
          col1Type: 'image',
          col1ImageUrl: 'https://picsum.photos/300/200',
          col2Type: 'text',
          col2Text: 'Add your two-column text here. This layout works great for highlighting specific features or updates.'
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
      case ModuleType.LEGAL:
        baseModule.properties = {
          chairman: 'Michael Lewis',
          board: 'Dr. Carsten Poppinga (Vorsitzender/Chairman), Dr. Thomas Linßen'
        };
        baseModule.section = 'outside';
        break;
    }
    
    setModules(prev => {
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
    navigator.clipboard.writeText(exportHtml);
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
    const segments = exportHtml.split(/(<!-- START_ID:.*? -->|<!-- END_ID:.*? -->)/);
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
                 <div className="whitespace-pre-wrap flex-1 py-0.5 text-blue-200" style={{ paddingLeft: `${leadingSpaces}ch`, textIndent: `-${leadingSpaces}ch`, overflowWrap: 'anywhere' }}>
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
  const activeTemplate = templates.find(t => t.id === currentTemplateId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Save Template</h3>
              <p className="text-xs text-slate-500 mb-4">Enter a name for your current configuration to save it for later use.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Template Name</label>
                  <input 
                    type="text" 
                    value={saveModalName} 
                    onChange={(e) => setSaveModalName(e.target.value)}
                    placeholder="e.g. Monthly Status Update"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={() => handleSaveConfirm(true)}
                  disabled={!saveModalName.trim() || !currentTemplateId}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  UPDATE EXISTING
                </button>
                <button 
                  onClick={() => handleSaveConfirm(false)}
                  disabled={!saveModalName.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg disabled:opacity-50 transition-all shadow-sm"
                >
                  SAVE AS NEW
                </button>
              </div>
              <button 
                onClick={() => setIsSaveModalOpen(false)}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 py-2 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-96 border-r border-slate-200 flex flex-col h-full bg-white shadow-xl z-10">
        <div className="h-14 px-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img src="https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/DOT_small_bm.png" className="h-[20px] w-auto object-contain" alt="DOT Logo" />
            <div className="h-5 w-px bg-slate-200"></div>
            <h1 className="font-bold text-slate-800 text-sm whitespace-nowrap leading-none">Email Builder</h1>
          </div>
          
          <div className="flex gap-1.5 items-center">
             {/* Template Management Button */}
             <div className="relative">
                <button 
                  onClick={() => setIsTemplatePanelOpen(!isTemplatePanelOpen)}
                  className={`p-2 rounded-lg transition-all ${isTemplatePanelOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Templates"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </button>
                
                {isTemplatePanelOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saved Templates</span>
                      <button onClick={openSaveModal} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">+ NEW</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                      {templates.length === 0 ? (
                        <div className="px-4 py-6 text-center text-[10px] text-slate-400 italic">No templates saved yet</div>
                      ) : templates.map(t => (
                        <div key={t.id} className={`group flex items-center justify-between px-4 py-2 hover:bg-blue-50 transition-colors ${currentTemplateId === t.id ? 'bg-blue-50/50' : ''}`}>
                          <button 
                            onClick={() => loadTemplate(t.id)}
                            className={`flex-1 text-left text-xs font-medium truncate ${currentTemplateId === t.id ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                          >
                            {t.name}
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteTemplate(t.id)} className="p-1 text-red-400 hover:bg-red-100 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        </div>

        {/* Template Status Bar */}
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Template:</span>
              <span className="text-[10px] font-bold text-blue-700 truncate">{activeTemplate?.name || 'Unsaved Layout'}</span>
           </div>
           <button 
             onClick={openSaveModal}
             className="text-[9px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
             SAVE
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
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
                onDuplicate={duplicateModule}
                onMoveUp={(id) => moveModule(id, 'up')}
                onMoveDown={(id) => moveModule(id, 'down')}
              />
            )) : (
              <div className="text-[10px] text-slate-400 italic ml-2 mb-4">No modules inside main body</div>
            )}
          </div>

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
                onDuplicate={duplicateModule}
                onMoveUp={(id) => moveModule(id, 'up')}
                onMoveDown={(id) => moveModule(id, 'down')}
              />
            )) : (
              <div className="text-[10px] text-slate-400 italic ml-2">No modules outside main body</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
        <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Preview</button>
              <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>HTML</button>
            </div>
            
            {activeTab === 'preview' && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mode</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setIsPreviewDarkMode(false)} 
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isPreviewDarkMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    LIGHT
                  </button>
                  <button 
                    onClick={() => setIsPreviewDarkMode(true)} 
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isPreviewDarkMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    DARK
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={copyToClipboard} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'}`}>
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div 
          className="flex-1 overflow-auto p-8 flex justify-center items-start relative bg-[#f8fafc]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        >
          {activeTab === 'preview' ? (
            <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
              <iframe srcDoc={previewHtml} className="w-full h-[calc(100vh-160px)] border-none" title="Email Preview" />
            </div>
          ) : (
            <div className="w-full max-w-[1000px] h-full" ref={codeContainerRef}>
              <div className="bg-slate-900 text-blue-300 p-6 rounded-xl overflow-auto text-sm font-mono h-[calc(100vh-160px)] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 scroll-smooth custom-scrollbar">
                {renderCodeSegments()}
              </div>
            </div>
          )}
          <div className="absolute bottom-4 right-6 text-[10px] font-bold text-slate-400 pointer-events-none select-none uppercase tracking-widest opacity-50">
            {APP_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;