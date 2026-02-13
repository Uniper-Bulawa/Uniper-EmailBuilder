import React, { useRef } from 'react';
import { ModuleData, ModuleType, KpiMetric, ChecklistItem, SecondaryButton } from '../types';

interface Props {
  module: ModuleData;
  isSelected: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onSelect: (id: string) => void;
  onChange: (id: string, properties: any) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const DEPT_OPTIONS = [
  { code: 'A', name: 'A - Transformation & Development' },
  { code: 'A1', name: 'A1 - Physical Commodities' },
  { code: 'A2', name: 'A2 - Trading Business Development' },
  { code: 'A3', name: 'A3 - Business Solutions' },
  { code: 'A4', name: 'A4 - Business Readiness' },
  { code: 'A5', name: 'A5 - Digial Operations Transformation' },
  { code: 'A6', name: 'A6 - Strategic Operations Development' },
  { code: 'B', name: 'B - Trading Operations' },
  { code: 'B1', name: 'B1 - Gas Long Term Contracts & Infrastructure' },
  { code: 'B2', name: 'B2 - Asset & Structured Contracts Ops' },
  { code: 'B3', name: 'B3 - Mass Market Operations' },
  { code: 'B4', name: 'B4 - North America Operations' },
  { code: 'B6', name: 'B6 - Physical Commodity Operations' },
  { code: 'B7', name: 'B7 - Exchange, Clearing & Margining Operations' },
  { code: 'CO', name: 'CO - Commercial Operations' },
  { code: 'D', name: 'D - Wholesale Operations' },
  { code: 'D1', name: 'D1 - Settlement Industry Customers' },
  { code: 'D2', name: 'D2 - Settlement Energy Partner' },
  { code: 'D3', name: 'D3 - Supplier Change Operations' },
  { code: 'D4', name: 'D4 - Energy Data Managment' }
];

const LOGO_BASE_URL = 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_';

const KPI_COLORS = ['#00944A', '#ED8C1C', '#E6252E', '#0078DC'];

const ModuleItemEditor: React.FC<Props> = ({ module, isSelected, isCollapsed, onToggleCollapse, onSelect, onChange, onRemove, onDuplicate, onMoveUp, onMoveDown }) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({});
  const lastFocusedKeyRef = useRef<string | null>(null);
  const lastFocusedCellRef = useRef<{ r: number, c: number } | null>(null);

  const updateProp = (key: string, value: any) => {
    onChange(module.id, { ...module.properties, [key]: value });
  };

  const getValueForKey = (key: string): string => {
    if (key.startsWith('metric-value-')) {
      const idx = parseInt(key.split('-')[2]);
      return module.properties.metrics?.[idx]?.value || "";
    } else if (key.startsWith('metric-label-')) {
      const idx = parseInt(key.split('-')[2]);
      return module.properties.metrics?.[idx]?.label || "";
    } else if (key.startsWith('metric-color-')) {
      const idx = parseInt(key.split('-')[2]);
      return module.properties.metrics?.[idx]?.color || "";
    } else if (key.startsWith('checklist-text-')) {
      const idx = parseInt(key.split('-')[2]);
      return module.properties.checklistItems?.[idx]?.text || "";
    } else if (key.startsWith('cell-')) {
      const parts = key.split('-');
      const r = parseInt(parts[1]);
      const c = parseInt(parts[2]);
      return module.properties.gridRows?.[r]?.cells[c] || "";
    } else if (key.startsWith('sec-btn-text-')) {
      const idx = parseInt(key.split('-')[3]);
      return module.properties.secondaryButtons?.[idx]?.text || "";
    } else if (key.startsWith('sec-btn-url-')) {
      const idx = parseInt(key.split('-')[3]);
      return module.properties.secondaryButtons?.[idx]?.url || "";
    }
    return (module.properties as any)[key] || "";
  };

  const setValueForKey = (key: string, newValue: string) => {
    if (key.startsWith('metric-value-')) {
      const idx = parseInt(key.split('-')[2]);
      const newMetrics = [...(module.properties.metrics || [])];
      newMetrics[idx].value = newValue;
      updateProp('metrics', newMetrics);
    } else if (key.startsWith('metric-label-')) {
      const idx = parseInt(key.split('-')[2]);
      const newMetrics = [...(module.properties.metrics || [])];
      newMetrics[idx].label = newValue;
      updateProp('metrics', newMetrics);
    } else if (key.startsWith('metric-color-')) {
      const idx = parseInt(key.split('-')[2]);
      const newMetrics = [...(module.properties.metrics || [])];
      newMetrics[idx].color = newValue;
      updateProp('metrics', newMetrics);
    } else if (key.startsWith('checklist-text-')) {
      const idx = parseInt(key.split('-')[2]);
      const newItems = [...(module.properties.checklistItems || [])];
      newItems[idx].text = newValue;
      updateProp('checklistItems', newItems);
    } else if (key.startsWith('cell-')) {
      const parts = key.split('-');
      const r = parseInt(parts[1]);
      const c = parseInt(parts[2]);
      handleCellChange(r, c, newValue);
    } else if (key.startsWith('sec-btn-text-')) {
      const idx = parseInt(key.split('-')[3]);
      updateSecondaryButton(idx, { text: newValue });
    } else if (key.startsWith('sec-btn-url-')) {
      const idx = parseInt(key.split('-')[3]);
      updateSecondaryButton(idx, { url: newValue });
    } else {
      updateProp(key, newValue);
    }
  };

  const handleFormatting = (key: string, type: 'bold' | 'italic' | 'underline' | 'strike' | 'link' | 'expr') => {
    const input = inputRefs.current[key];
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = getValueForKey(key);
    const selectedText = currentValue.substring(start, end);
    
    let wrappedText = "";

    if (type === 'expr') {
      wrappedText = `@{replace('!!!','REFERENCE')}`;
    } else if (type === 'bold') {
      wrappedText = `<b>${selectedText}</b>`;
    } else if (type === 'italic') {
      wrappedText = `<i>${selectedText}</i>`;
    } else if (type === 'underline') {
      wrappedText = `<u>${selectedText}</u>`;
    } else if (type === 'strike') {
      wrappedText = `<s>${selectedText}</s>`;
    } else if (type === 'link') {
      wrappedText = `<a href="URL" style="color:#0078DC;">${selectedText || 'DISPLAY TEXT'}</a>`;
    }

    const newValue = currentValue.substring(0, start) + wrappedText + currentValue.substring(end);
    setValueForKey(key, newValue);

    setTimeout(() => {
      const field = inputRefs.current[key];
      if (field) {
        field.focus();
        const newPos = start + wrappedText.length;
        field.setSelectionRange(newPos, newPos);
      }
    }, 30);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;

    const code = e.code;
    const formatMap: Record<string, 'bold' | 'italic' | 'underline' | 'strike' | 'link' | 'expr'> = {
      'KeyB': 'bold',
      'KeyI': 'italic',
      'KeyU': 'underline',
      'KeyS': 'strike',
      'KeyK': 'link',
      'KeyE': 'expr'
    };

    if (formatMap[code]) {
      e.preventDefault();
      e.stopPropagation();
      handleFormatting(key, formatMap[code]);
    }
  };

  const handleInsertExpression = (key: string) => {
    handleFormatting(key, 'expr');
  };

  const handleGlobalInsertExpression = () => {
    if (lastFocusedKeyRef.current) {
      handleInsertExpression(lastFocusedKeyRef.current);
    }
  };

  const handleTableCellInsert = () => {
    if (lastFocusedCellRef.current) {
      const { r, c } = lastFocusedCellRef.current;
      handleInsertExpression(`cell-${r}-${c}`);
    }
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newGridRows = [...(module.properties.gridRows || [])];
    const newCells = [...newGridRows[rowIndex].cells];
    newCells[cellIndex] = value;
    newGridRows[rowIndex] = { cells: newCells };
    updateProp('gridRows', newGridRows);
  };

  const addRow = () => {
    const gridRows = [...(module.properties.gridRows || [])];
    const colCount = gridRows[0]?.cells.length || 2;
    gridRows.push({ cells: new Array(colCount).fill('') });
    updateProp('gridRows', gridRows);
  };

  const removeRow = () => {
    const gridRows = [...(module.properties.gridRows || [])];
    if (gridRows.length > 1) {
      gridRows.pop();
      updateProp('gridRows', gridRows);
    }
  };

  const addColumn = () => {
    const gridRows = module.properties.gridRows?.map(row => ({
      cells: [...row.cells, '']
    })) || [];
    updateProp('gridRows', gridRows);
  };

  const removeColumn = () => {
    const gridRows = module.properties.gridRows?.map(row => ({
      cells: row.cells.slice(0, -1)
    })) || [];
    if (gridRows[0]?.cells.length > 0) {
      updateProp('gridRows', gridRows);
    }
  };

  const handleDeptSelect = (code: string) => {
    updateProp('imageUrl', `${LOGO_BASE_URL}${code}.png`);
  };

  const addSecondaryButton = () => {
    const btns = [...(module.properties.secondaryButtons || [])];
    if (btns.length < 2) {
      btns.push({ text: 'Secondary', url: '#', color: '#0078DC' });
      updateProp('secondaryButtons', btns);
    }
  };

  const updateSecondaryButton = (idx: number, updates: Partial<SecondaryButton>) => {
    const btns = [...(module.properties.secondaryButtons || [])];
    btns[idx] = { ...btns[idx], ...updates };
    updateProp('secondaryButtons', btns);
  };

  const removeSecondaryButton = (idx: number) => {
    const btns = (module.properties.secondaryButtons || []).filter((_, i) => i !== idx);
    updateProp('secondaryButtons', btns);
  };

  const currentDeptCode = module.properties.imageUrl?.replace(LOGO_BASE_URL, '').replace('.png', '') || '';
  const isPresetLogo = DEPT_OPTIONS.some(opt => opt.code === currentDeptCode);

  const renderLabelWithHelper = (label: string, fieldKey: string) => (
    <div className="flex justify-between items-center mb-1">
      <label className="block text-[10px] font-bold text-slate-400 uppercase">{label}</label>
      <button 
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleInsertExpression(fieldKey); }}
        className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none"
      >
        <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
        Insert Expr.
      </button>
    </div>
  );

  const inputClass = "w-full text-sm border border-[#D7E5FC] rounded px-2 py-1.5 outline-none bg-white shadow-sm focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div 
      onClick={() => onSelect(module.id)}
      className={`bg-white border-2 rounded-xl transition-all ${
        isCollapsed ? 'p-3' : 'p-4'
      } mb-4 ${
        isSelected 
        ? 'border-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] ring-1 ring-blue-500/20' 
        : 'border-slate-200 shadow-sm hover:border-slate-300'
      }`}
    >
      <div className={`flex justify-between items-center overflow-hidden transition-all ${isCollapsed ? 'mb-0' : 'mb-4 pb-2 border-b border-slate-100'}`}>
        <div 
          className="flex items-center gap-2 cursor-pointer flex-1 group"
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(module.id); onSelect(module.id); }}
        >
          <svg 
            className={`w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {module.type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(module.id); }} title="Move Up" className="p-1 hover:bg-slate-100 rounded text-slate-500 outline-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(module.id); }} title="Move Down" className="p-1 hover:bg-slate-100 rounded text-slate-500 outline-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(module.id); }} title="Duplicate" className="p-1 hover:bg-blue-50 text-blue-400 rounded outline-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(module.id); }} title="Delete" className="p-1 hover:bg-red-50 text-red-400 rounded outline-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Alignment Buttons */}
          {(module.type === ModuleType.HEADER_LOGO || module.type === ModuleType.TEXT || module.type === ModuleType.IMAGE) && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alignment</label>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-[#D7E5FC]">
                <button 
                  onClick={() => updateProp('align', 'left')} 
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all outline-none ${module.properties.align === 'left' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  LEFT
                </button>
                <button 
                  onClick={() => updateProp('align', 'center')} 
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all outline-none ${(module.properties.align === 'center' || (!module.properties.align && module.type === ModuleType.IMAGE)) ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  CENTER
                </button>
                <button 
                  onClick={() => updateProp('align', 'right')} 
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all outline-none ${(module.properties.align === 'right' || (!module.properties.align && module.type === ModuleType.HEADER_LOGO)) ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  RIGHT
                </button>
              </div>
            </div>
          )}

          {/* Banner - Divider Mode Toggle */}
          {module.type === ModuleType.BANNER && (
            <div className="flex items-center gap-2 py-1">
               <input type="checkbox" id={`divider-${module.id}`} checked={!!module.properties.isDivider} onChange={e => updateProp('isDivider', e.target.checked)} className="w-4 h-4 outline-none border-[#D7E5FC]" />
               <label htmlFor={`divider-${module.id}`} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Divider Mode (Small height, no text)</label>
            </div>
          )}

          {/* Preset Logo */}
          {module.type === ModuleType.HEADER_LOGO && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preset Logo</label>
              <select className={inputClass} onChange={(e) => handleDeptSelect(e.target.value)} value={isPresetLogo ? currentDeptCode : ""} onFocus={() => { lastFocusedKeyRef.current = 'header_preset'; }}>
                <option value="" disabled>Select Department...</option>
                {DEPT_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
              </select>
            </div>
          )}

          {/* Title */}
          {(module.properties.title !== undefined && !module.properties.isDivider) && (
            <div>
              {renderLabelWithHelper("Title", "title")}
              <input 
                ref={el => { inputRefs.current['title'] = el; }} 
                type="text" 
                value={module.properties.title} 
                onFocus={() => { lastFocusedKeyRef.current = 'title'; }}
                onKeyDown={(e) => handleKeyDown(e, 'title')}
                onChange={(e) => updateProp('title', e.target.value)} 
                className={inputClass} 
                placeholder="Title text (Ctrl+B, Ctrl+K, etc.)"
              />
            </div>
          )}

          {/* Banner Color */}
          {(module.type === ModuleType.BANNER) && (
            <div>
              {renderLabelWithHelper('Banner Color', 'color')}
              <div className="flex gap-2">
                <input type="color" value={module.properties.color?.startsWith('#') ? module.properties.color : '#0078DC'} onChange={(e) => updateProp('color', e.target.value)} className="h-8 w-12 border border-[#D7E5FC] rounded cursor-pointer outline-none focus:ring-1 focus:ring-blue-500/20" />
                <input 
                  ref={el => { inputRefs.current['color'] = el; }} 
                  type="text" 
                  value={module.properties.color || '#0078DC'} 
                  onFocus={() => { lastFocusedKeyRef.current = 'color'; }}
                  onChange={(e) => updateProp('color', e.target.value)} 
                  className={`${inputClass} flex-1 font-mono`} 
                  placeholder="#HEX or @{expr}" 
                />
              </div>
            </div>
          )}

          {/* Button - Content Box Toggle */}
          {module.type === ModuleType.BUTTON && (
            <div className="flex items-center gap-2 py-1">
               <input type="checkbox" id={`box-${module.id}`} checked={module.properties.hasContentBox !== false} onChange={e => updateProp('hasContentBox', e.target.checked)} className="w-4 h-4 outline-none border-[#D7E5FC]" />
               <label htmlFor={`box-${module.id}`} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Show Content Box (Bg & Hint)</label>
            </div>
          )}

          {/* General Content */}
          {(module.properties.content !== undefined && module.type !== ModuleType.TWO_COLUMN && (module.type !== ModuleType.BUTTON || module.properties.hasContentBox !== false)) && (
            <div>
              {renderLabelWithHelper("Content", "content")}
              <textarea 
                ref={el => { inputRefs.current['content'] = el; }} 
                rows={3} 
                value={module.properties.content} 
                onFocus={() => { lastFocusedKeyRef.current = 'content'; }}
                onKeyDown={(e) => handleKeyDown(e, 'content')}
                onChange={(e) => updateProp('content', e.target.value)} 
                className={`${inputClass} resize-none`} 
                placeholder="Multiline content. Use Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+S, Ctrl+K for formatting."
              />
            </div>
          )}

          {/* Button fields */}
          {module.type === ModuleType.BUTTON && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-[#D7E5FC] shadow-inner">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Primary Button</label>
                <div className="space-y-2">
                  <div>
                    {renderLabelWithHelper("Button Text", "buttonText")}
                    <input ref={el => { inputRefs.current['buttonText'] = el; }} type="text" value={module.properties.buttonText || ''} onFocus={() => { lastFocusedKeyRef.current = 'buttonText'; }} onKeyDown={(e) => handleKeyDown(e, 'buttonText')} onChange={(e) => updateProp('buttonText', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    {renderLabelWithHelper("Button URL", "url")}
                    <input ref={el => { inputRefs.current['url'] = el; }} type="text" value={module.properties.url || ''} onFocus={() => { lastFocusedKeyRef.current = 'url'; }} onKeyDown={(e) => handleKeyDown(e, 'url')} onChange={(e) => updateProp('url', e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex gap-2">
                    <input type="color" value={module.properties.color?.startsWith('#') ? module.properties.color : '#0078DC'} onChange={(e) => updateProp('color', e.target.value)} className="h-8 w-12 border border-[#D7E5FC] rounded cursor-pointer outline-none" />
                    <input type="text" value={module.properties.color || '#0078DC'} onChange={(e) => updateProp('color', e.target.value)} className={`${inputClass} flex-1 font-mono`} placeholder="#HEX" />
                  </div>
                </div>
              </div>

              {/* Secondary Buttons List */}
              {module.properties.secondaryButtons?.map((btn, idx) => {
                const textKey = `sec-btn-text-${idx}`;
                const urlKey = `sec-btn-url-${idx}`;
                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-[#D7E5FC] shadow-inner relative group">
                    <button onClick={() => removeSecondaryButton(idx)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm text-red-400 opacity-0 group-hover:opacity-100 transition-opacity border border-red-50 outline-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Button {idx + 2}</label>
                    <div className="space-y-2">
                      <div>
                        {renderLabelWithHelper("Button Text", textKey)}
                        <input 
                          ref={el => { inputRefs.current[textKey] = el; }}
                          type="text" 
                          value={btn.text} 
                          onFocus={() => { lastFocusedKeyRef.current = textKey; }}
                          onKeyDown={(e) => handleKeyDown(e, textKey)}
                          onChange={e => updateSecondaryButton(idx, { text: e.target.value })} 
                          className={inputClass} 
                          placeholder="Button Text" 
                        />
                      </div>
                      <div>
                        {renderLabelWithHelper("Button URL", urlKey)}
                        <input 
                          ref={el => { inputRefs.current[urlKey] = el; }}
                          type="text" 
                          value={btn.url} 
                          onFocus={() => { lastFocusedKeyRef.current = urlKey; }}
                          onKeyDown={(e) => handleKeyDown(e, urlKey)}
                          onChange={e => updateSecondaryButton(idx, { url: e.target.value })} 
                          className={inputClass} 
                          placeholder="URL" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <input type="color" value={btn.color?.startsWith('#') ? btn.color : '#0078DC'} onChange={e => updateSecondaryButton(idx, { color: e.target.value })} className="h-8 w-12 border border-[#D7E5FC] rounded cursor-pointer outline-none" />
                        <input type="text" value={btn.color || '#0078DC'} onChange={e => updateSecondaryButton(idx, { color: e.target.value })} className={`${inputClass} flex-1 font-mono`} placeholder="#HEX" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {(module.properties.secondaryButtons?.length || 0) < 2 && (
                <button onClick={addSecondaryButton} className="w-full py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded outline-none">+ ADD BUTTON</button>
              )}
            </div>
          )}

          {/* General Image fields */}
          {(module.properties.imageUrl !== undefined && module.type !== ModuleType.BUTTON && module.type !== ModuleType.TWO_COLUMN) && (
            <div className="space-y-4">
              <div>
                {renderLabelWithHelper("Image URL / CID", "imageUrl")}
                <input 
                  ref={el => { inputRefs.current['imageUrl'] = el; }} 
                  type="text" 
                  value={module.properties.imageUrl} 
                  onFocus={() => { lastFocusedKeyRef.current = 'imageUrl'; }}
                  onChange={(e) => updateProp('imageUrl', e.target.value)} 
                  className={inputClass} 
                />
              </div>
              {/* Added Link URL for Header, Image, Signature */}
              <div>
                {renderLabelWithHelper("Image Link URL (Optional)", "url")}
                <input 
                  ref={el => { inputRefs.current['url'] = el; }} 
                  type="text" 
                  placeholder="https://..."
                  value={module.properties.url || ''} 
                  onFocus={() => { lastFocusedKeyRef.current = 'url'; }}
                  onKeyDown={(e) => handleKeyDown(e, 'url')}
                  onChange={(e) => updateProp('url', e.target.value)} 
                  className={inputClass} 
                />
              </div>
              {module.type === ModuleType.IMAGE && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Width</label>
                    <input 
                      ref={el => { inputRefs.current['imageWidth'] = el; }} 
                      type="text" 
                      placeholder="e.g. 300 or 100%"
                      value={module.properties.imageWidth || ''} 
                      onFocus={() => { lastFocusedKeyRef.current = 'imageWidth'; }}
                      onChange={(e) => updateProp('imageWidth', e.target.value)} 
                      className={inputClass} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Height</label>
                    <input 
                      ref={el => { inputRefs.current['imageHeight'] = el; }} 
                      type="text" 
                      placeholder="e.g. 200 or 100%"
                      value={module.properties.imageHeight || ''} 
                      onFocus={() => { lastFocusedKeyRef.current = 'imageHeight'; }}
                      onChange={(e) => updateProp('imageHeight', e.target.value)} 
                      className={inputClass} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KPI CARDS Editor */}
          {module.type === ModuleType.KPI_CARDS && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Metrics</label>
                <button 
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleGlobalInsertExpression(); }}
                  className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none"
                >
                  <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
                  Insert Expr.
                </button>
              </div>
              {module.properties.metrics?.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-[#D7E5FC] relative group/metric">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input 
                      ref={el => { inputRefs.current[`metric-value-${idx}`] = el; }}
                      onFocus={() => { lastFocusedKeyRef.current = `metric-value-${idx}`; }}
                      onKeyDown={(e) => handleKeyDown(e, `metric-value-${idx}`)}
                      type="text" 
                      placeholder="Value" 
                      value={m.value} 
                      onChange={e => {
                        const newMetrics = [...(module.properties.metrics || [])];
                        newMetrics[idx].value = e.target.value;
                        updateProp('metrics', newMetrics);
                      }} 
                      className={`${inputClass} text-xs py-1`} 
                    />
                    <input 
                      ref={el => { inputRefs.current[`metric-label-${idx}`] = el; }}
                      onFocus={() => { lastFocusedKeyRef.current = `metric-label-${idx}`; }}
                      onKeyDown={(e) => handleKeyDown(e, `metric-label-${idx}`)}
                      type="text" 
                      placeholder="Label" 
                      value={m.label} 
                      onChange={e => {
                        const newMetrics = [...(module.properties.metrics || [])];
                        newMetrics[idx].label = e.target.value;
                        updateProp('metrics', newMetrics);
                      }} 
                      className={`${inputClass} text-xs py-1`} 
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      {KPI_COLORS.map(c => (
                        <button key={c} onClick={() => {
                          const newMetrics = [...(module.properties.metrics || [])];
                          newMetrics[idx].color = c;
                          updateProp('metrics', newMetrics);
                        }} className={`w-5 h-5 rounded-full border-2 ${m.color === c ? 'border-slate-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <input 
                        ref={el => { inputRefs.current[`metric-color-${idx}`] = el; }}
                        type="text" 
                        value={m.color} 
                        onFocus={() => { lastFocusedKeyRef.current = `metric-color-${idx}`; }}
                        onChange={e => {
                          const newMetrics = [...(module.properties.metrics || [])];
                          newMetrics[idx].color = e.target.value;
                          updateProp('metrics', newMetrics);
                        }} 
                        className={`${inputClass} text-[10px] py-1 font-mono`} 
                        placeholder="Hex or @{expr}" 
                      />
                    </div>
                  </div>
                  {module.properties.metrics && module.properties.metrics.length > 1 && (
                    <button onClick={() => updateProp('metrics', module.properties.metrics?.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm text-red-400 opacity-0 group-hover/metric:opacity-100 transition-opacity border border-red-50 outline-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
              {module.properties.metrics && module.properties.metrics.length < 3 && (
                <button onClick={() => updateProp('metrics', [...(module.properties.metrics || []), { value: '0', label: 'New Metric', color: '#00944A' }])} className="w-full py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500/20">
                  + ADD METRIC
                </button>
              )}
            </div>
          )}

          {/* Two Column Editor */}
          {module.type === ModuleType.TWO_COLUMN && (
            <div className="space-y-4">
              {/* Column 1 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-[#D7E5FC] shadow-inner">
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-[10px] font-black text-slate-500 uppercase">Column 1</label>
                   <div className="flex bg-slate-200 p-1 rounded-md">
                      <button onClick={() => updateProp('col1Type', 'text')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${(module.properties.col1Type || 'image') === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>TEXT</button>
                      <button onClick={() => updateProp('col1Type', 'image')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${(module.properties.col1Type || 'image') === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>IMAGE</button>
                   </div>
                 </div>
                 {(module.properties.col1Type || 'image') === 'text' ? (
                   <div>
                     {renderLabelWithHelper("Col 1 Text", "col1Text")}
                     <textarea ref={el => { inputRefs.current['col1Text'] = el; }} rows={3} value={module.properties.col1Text || module.properties.content || ''} onFocus={() => { lastFocusedKeyRef.current = 'col1Text'; }} onKeyDown={(e) => handleKeyDown(e, 'col1Text')} onChange={(e) => updateProp('col1Text', e.target.value)} className={`${inputClass} resize-none`} />
                   </div>
                 ) : (
                   <div>
                     {renderLabelWithHelper("Col 1 Image URL", "col1ImageUrl")}
                     <input ref={el => { inputRefs.current['col1ImageUrl'] = el; }} type="text" value={module.properties.col1ImageUrl || module.properties.imageUrl || ''} onFocus={() => { lastFocusedKeyRef.current = 'col1ImageUrl'; }} onChange={(e) => updateProp('col1ImageUrl', e.target.value)} className={inputClass} />
                   </div>
                 )}
              </div>

              {/* Column 2 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-[#D7E5FC] shadow-inner">
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-[10px] font-black text-slate-500 uppercase">Column 2</label>
                   <div className="flex bg-slate-200 p-1 rounded-md">
                      <button onClick={() => updateProp('col2Type', 'text')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${(module.properties.col2Type || 'text') === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>TEXT</button>
                      <button onClick={() => updateProp('col2Type', 'image')} className={`px-2 py-0.5 text-[9px] font-bold rounded ${(module.properties.col2Type || 'text') === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>IMAGE</button>
                   </div>
                 </div>
                 {(module.properties.col2Type || 'text') === 'text' ? (
                   <div>
                     {renderLabelWithHelper("Col 2 Text", "col2Text")}
                     <textarea ref={el => { inputRefs.current['col2Text'] = el; }} rows={3} value={module.properties.col2Text || module.properties.content || ''} onFocus={() => { lastFocusedKeyRef.current = 'col2Text'; }} onKeyDown={(e) => handleKeyDown(e, 'col2Text')} onChange={(e) => updateProp('col2Text', e.target.value)} className={`${inputClass} resize-none`} />
                   </div>
                 ) : (
                   <div>
                     {renderLabelWithHelper("Col 2 Image URL", "col2ImageUrl")}
                     <input ref={el => { inputRefs.current['col2ImageUrl'] = el; }} type="text" value={module.properties.col2ImageUrl || module.properties.imageUrl || ''} onFocus={() => { lastFocusedKeyRef.current = 'col2ImageUrl'; }} onChange={(e) => updateProp('col2ImageUrl', e.target.value)} className={inputClass} />
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Signature details */}
          {module.type === ModuleType.SIGNATURE && (
            <div className="flex items-center gap-2 py-1">
               <input type="checkbox" id={`rating-${module.id}`} checked={!!module.properties.hasStarRating} onChange={e => updateProp('hasStarRating', e.target.checked)} className="w-4 h-4 outline-none border-[#D7E5FC]" />
               <label htmlFor={`rating-${module.id}`} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Include Star Rating</label>
            </div>
          )}

          {/* DELIVERY PHASE Editor */}
          {module.type === ModuleType.DELIVERY_PHASE && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selected Phase</label>
              <select value={module.properties.selectedPhase} onChange={e => updateProp('selectedPhase', e.target.value)} className={inputClass}>
                {['L3 Prio', 'Assess', 'Design', 'Plan', 'Develop', 'Document', 'Train', 'Handover', 'Live'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* CHECKLIST Editor */}
          {module.type === ModuleType.CHECKLIST && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Checklist Items</label>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleGlobalInsertExpression(); }} className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none">
                  <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
                  Insert Expr.
                </button>
              </div>
              {module.properties.checklistItems?.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start group/check">
                  <select value={item.icon} onChange={e => {
                    const newItems = [...(module.properties.checklistItems || [])];
                    newItems[idx].icon = e.target.value as any;
                    updateProp('checklistItems', newItems);
                  }} className={`${inputClass.replace('w-full', '')} px-1 w-[50px] shrink-0 border border-[#D7E5FC]`}>
                    <option value="empty">☐</option>
                    <option value="checked">▣</option>
                    <option value="circle">○</option>
                    <option value="disc">●</option>
                    <option value="arrow">➔</option>
                    <option value="star">★</option>
                    <option value="blue">🟦</option>
                    <option value="black">⬛</option>
                  </select>
                  <textarea ref={el => { inputRefs.current[`checklist-text-${idx}`] = el; }} onFocus={() => { lastFocusedKeyRef.current = `checklist-text-${idx}`; }} onKeyDown={(e) => handleKeyDown(e, `checklist-text-${idx}`)} rows={1} value={item.text} onChange={e => {
                    const newItems = [...(module.properties.checklistItems || [])];
                    newItems[idx].text = e.target.value;
                    updateProp('checklistItems', newItems);
                  }} className={`${inputClass} resize-none`} placeholder="Item text..." />
                  <button onClick={() => updateProp('checklistItems', module.properties.checklistItems?.filter((_, i) => i !== idx))} className="mt-2 text-red-300 hover:text-red-500 opacity-0 group-hover/check:opacity-100 outline-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={() => updateProp('checklistItems', [...(module.properties.checklistItems || []), { text: '', icon: 'empty' }])} className="w-full py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500/20">+ ADD ITEM</button>
            </div>
          )}

          {/* LEGAL Editor */}
          {module.type === ModuleType.LEGAL && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Chairman of the Supervisory Board</label>
                <input ref={el => { inputRefs.current['chairman'] = el; }} type="text" value={module.properties.chairman || ''} onFocus={() => { lastFocusedKeyRef.current = 'chairman'; }} onChange={(e) => updateProp('chairman', e.target.value)} className={inputClass} placeholder="Name of Chairman" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Board of Management</label>
                <textarea ref={el => { inputRefs.current['board'] = el; }} rows={2} value={module.properties.board || ''} onFocus={() => { lastFocusedKeyRef.current = 'board'; }} onChange={(e) => updateProp('board', e.target.value)} className={`${inputClass} resize-none`} placeholder="Names of Board Members" />
              </div>
            </div>
          )}

          {/* Table Editor */}
          {module.type === ModuleType.TABLE && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-[#D7E5FC]">
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!module.properties.hasColumnHeaders} onChange={e => updateProp('hasColumnHeaders', e.target.checked)} className="w-4 h-4 outline-none" /><span className="text-[10px] font-bold text-slate-600 uppercase">Cols</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!module.properties.hasRowHeaders} onChange={e => updateProp('hasRowHeaders', e.target.checked)} className="w-4 h-4 outline-none" /><span className="text-[10px] font-bold text-slate-600 uppercase">Rows</span></label>
                 </div>
                 <button type="button" onMouseDown={(e) => { e.preventDefault(); handleTableCellInsert(); }} className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none">
                   <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
                   Insert Expr.
                 </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={addRow} className="text-[8px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC] whitespace-nowrap">+ ROW</button>
                <button onClick={removeRow} className="text-[8px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC] whitespace-nowrap">- ROW</button>
                <button onClick={addColumn} className="text-[8px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC] whitespace-nowrap">+ COL</button>
                <button onClick={removeColumn} className="text-[8px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC] whitespace-nowrap">- COL</button>
              </div>
              <div className="overflow-x-auto pb-2 custom-scrollbar border border-[#D7E5FC] rounded-lg p-2 bg-white">
                <div className="min-w-max space-y-2">
                  {module.properties.gridRows?.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-center group/row">
                      {row.cells.map((cell, cIdx) => (
                        <input key={cIdx} ref={el => { inputRefs.current[`cell-${rIdx}-${cIdx}`] = el; }} type="text" value={cell} onFocus={() => { lastFocusedCellRef.current = { r: rIdx, c: cIdx }; lastFocusedKeyRef.current = `cell-${rIdx}-${cIdx}`; }} onKeyDown={(e) => handleKeyDown(e, `cell-${rIdx}-${cIdx}`)} onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)} className="w-24 text-xs border border-[#D7E5FC] rounded px-2 py-1.5 focus:border-blue-400 outline-none focus:ring-1 focus:ring-blue-500/10 transition-all" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleItemEditor;