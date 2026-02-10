import React, { useRef } from 'react';
import { ModuleData, ModuleType, KpiMetric, ChecklistItem } from '../types';

interface Props {
  module: ModuleData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, properties: any) => void;
  onRemove: (id: string) => void;
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

const ModuleItemEditor: React.FC<Props> = ({ module, isSelected, onSelect, onChange, onRemove, onMoveUp, onMoveDown }) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({});
  const lastFocusedKeyRef = useRef<string | null>(null);
  const lastFocusedCellRef = useRef<{ r: number, c: number } | null>(null);

  const updateProp = (key: string, value: any) => {
    onChange(module.id, { ...module.properties, [key]: value });
  };

  const handleInsertExpression = (key: string) => {
    const input = inputRefs.current[key];
    const expression = `@{replace('!!!','VAR_NAME')}`;
    
    let currentValue = "";
    if (key.startsWith('metric-value-')) {
       const idx = parseInt(key.split('-')[2]);
       currentValue = module.properties.metrics?.[idx]?.value || "";
    } else if (key.startsWith('metric-label-')) {
       const idx = parseInt(key.split('-')[2]);
       currentValue = module.properties.metrics?.[idx]?.label || "";
    } else if (key.startsWith('metric-color-')) {
       const idx = parseInt(key.split('-')[2]);
       currentValue = module.properties.metrics?.[idx]?.color || "";
    } else if (key.startsWith('checklist-text-')) {
       const idx = parseInt(key.split('-')[2]);
       currentValue = module.properties.checklistItems?.[idx]?.text || "";
    } else {
       currentValue = (module.properties as any)[key] || "";
    }
    
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + expression + currentValue.substring(end);
      
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
      } else {
          updateProp(key, newValue);
      }
      
      setTimeout(() => {
        if (inputRefs.current[key]) {
          const field = inputRefs.current[key]!;
          field.focus();
          const newPos = start + expression.length;
          field.setSelectionRange(newPos, newPos);
        }
      }, 10);
    } else {
      updateProp(key, currentValue + expression);
    }
  };

  const handleGlobalInsertExpression = () => {
    if (lastFocusedKeyRef.current) {
      handleInsertExpression(lastFocusedKeyRef.current);
    }
  };

  const handleTableCellInsert = () => {
    if (!lastFocusedCellRef.current) return;
    const { r, c } = lastFocusedCellRef.current;
    const fieldKey = `cell-${r}-${c}`;
    const input = inputRefs.current[fieldKey];
    const expression = `@{replace('!!!','VAR_NAME')}`;
    const currentRows = module.properties.gridRows || [];
    const currentValue = currentRows[r]?.cells[c] || "";
    if (input) {
      const start = (input as HTMLInputElement).selectionStart || 0;
      const end = (input as HTMLInputElement).selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + expression + currentValue.substring(end);
      handleCellChange(r, c, newValue);
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
      className={`bg-white border-2 rounded-xl p-4 mb-4 transition-all cursor-pointer ${
        isSelected 
        ? 'border-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] ring-1 ring-blue-500/20' 
        : 'border-slate-200 shadow-sm hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
          {module.type.replace(/_/g, ' ')}
        </span>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(module.id); }} title="Move Up" className="p-1.5 hover:bg-slate-100 rounded text-slate-500 outline-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(module.id); }} title="Move Down" className="p-1.5 hover:bg-slate-100 rounded text-slate-500 outline-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(module.id); }} title="Delete" className="p-1.5 hover:bg-red-50 text-red-400 rounded outline-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Alignment Buttons for specific types */}
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

        {/* Core Properties */}
        {module.type === ModuleType.HEADER_LOGO && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preset Logo</label>
            <select className={inputClass} onChange={(e) => handleDeptSelect(e.target.value)} value={isPresetLogo ? currentDeptCode : ""} onFocus={() => { lastFocusedKeyRef.current = 'header_preset'; }}>
              <option value="" disabled>Select Department...</option>
              {DEPT_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
            </select>
          </div>
        )}

        {(module.properties.title !== undefined) && (
          <div>
            {renderLabelWithHelper("Title", "title")}
            <input 
              ref={el => { inputRefs.current['title'] = el; }} 
              type="text" 
              value={module.properties.title} 
              onFocus={() => { lastFocusedKeyRef.current = 'title'; }}
              onChange={(e) => updateProp('title', e.target.value)} 
              className={inputClass} 
            />
          </div>
        )}

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

        {(module.properties.content !== undefined) && (
          <div>
            {renderLabelWithHelper("Content", "content")}
            <textarea 
              ref={el => { inputRefs.current['content'] = el; }} 
              rows={3} 
              value={module.properties.content} 
              onFocus={() => { lastFocusedKeyRef.current = 'content'; }}
              onChange={(e) => updateProp('content', e.target.value)} 
              className={`${inputClass} resize-none`} 
            />
          </div>
        )}

        {module.type === ModuleType.BUTTON && (
          <>
            <div>
              {renderLabelWithHelper("Button Text", "buttonText")}
              <input 
                ref={el => { inputRefs.current['buttonText'] = el; }} 
                type="text" 
                value={module.properties.buttonText || ''} 
                onFocus={() => { lastFocusedKeyRef.current = 'buttonText'; }}
                onChange={(e) => updateProp('buttonText', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <div>
              {renderLabelWithHelper("Button URL", "url")}
              <input 
                ref={el => { inputRefs.current['url'] = el; }} 
                type="text" 
                value={module.properties.url || ''} 
                onFocus={() => { lastFocusedKeyRef.current = 'url'; }}
                onChange={(e) => updateProp('url', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <div>
              {renderLabelWithHelper('Button Color', 'color')}
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
          </>
        )}

        {(module.properties.imageUrl !== undefined && module.type !== ModuleType.BUTTON) && (
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
            <select 
              value={module.properties.selectedPhase} 
              onChange={e => updateProp('selectedPhase', e.target.value)}
              className={inputClass}
            >
              {['L3 Prio', 'Assess', 'Design', 'Plan', 'Develop', 'Document', 'Train', 'Handover', 'Live'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
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

        {/* TWO COLUMN Editor */}
        {module.type === ModuleType.TWO_COLUMN && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image Position</label>
            <div className="flex bg-slate-50 p-1 rounded-lg border border-[#D7E5FC] mb-3">
              <button onClick={() => updateProp('imagePosition', 'left')} className={`flex-1 py-1 text-[10px] font-bold rounded outline-none ${module.properties.imagePosition === 'left' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>LEFT</button>
              <button onClick={() => updateProp('imagePosition', 'right')} className={`flex-1 py-1 text-[10px] font-bold rounded outline-none ${module.properties.imagePosition === 'right' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>RIGHT</button>
            </div>
          </div>
        )}

        {/* CHECKLIST Editor */}
        {module.type === ModuleType.CHECKLIST && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Checklist Items</label>
              <button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleGlobalInsertExpression(); }}
                className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none"
              >
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
                <textarea 
                  ref={el => { inputRefs.current[`checklist-text-${idx}`] = el; }}
                  onFocus={() => { lastFocusedKeyRef.current = `checklist-text-${idx}`; }}
                  rows={1} 
                  value={item.text} 
                  onChange={e => {
                    const newItems = [...(module.properties.checklistItems || [])];
                    newItems[idx].text = e.target.value;
                    updateProp('checklistItems', newItems);
                  }} 
                  className={`${inputClass} resize-none`} 
                  placeholder="Item text..." 
                />
                <button onClick={() => updateProp('checklistItems', module.properties.checklistItems?.filter((_, i) => i !== idx))} className="mt-2 text-red-300 hover:text-red-500 opacity-0 group-hover/check:opacity-100 outline-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button onClick={() => updateProp('checklistItems', [...(module.properties.checklistItems || []), { text: '', icon: 'empty' }])} className="w-full py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500/20">
              + ADD ITEM
            </button>
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
               <button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleTableCellInsert(); }}
                className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer outline-none"
               >
                 <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
                 Insert Expr.
               </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={addRow} className="text-[9px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC]">+ ROW</button>
              <button onClick={removeRow} className="text-[9px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC]">- ROW</button>
              <button onClick={addColumn} className="text-[9px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC]">+ COL</button>
              <button onClick={removeColumn} className="text-[9px] font-bold bg-slate-100 text-slate-600 py-1.5 rounded hover:bg-slate-200 transition-colors outline-none border border-[#D7E5FC]">- COL</button>
            </div>

            <div className="overflow-x-auto pb-2 custom-scrollbar border border-[#D7E5FC] rounded-lg p-2 bg-white">
              <div className="min-w-max space-y-2">
                {module.properties.gridRows?.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-2 items-center group/row">
                    {row.cells.map((cell, cIdx) => (
                      <input 
                        key={cIdx} 
                        ref={el => { inputRefs.current[`cell-${rIdx}-${cIdx}`] = el; }}
                        type="text" 
                        value={cell} 
                        onFocus={() => { 
                          lastFocusedCellRef.current = { r: rIdx, c: cIdx };
                          lastFocusedKeyRef.current = `cell-${rIdx}-${cIdx}`; 
                        }} 
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)} 
                        className="w-24 text-xs border border-[#D7E5FC] rounded px-2 py-1.5 focus:border-blue-400 outline-none focus:ring-1 focus:ring-blue-500/10 transition-all" 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleItemEditor;