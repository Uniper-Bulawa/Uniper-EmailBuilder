import React, { useRef } from 'react';
import { ModuleData, ModuleType, GridRow } from '../types';

interface Props {
  module: ModuleData;
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

const ModuleItemEditor: React.FC<Props> = ({ module, onChange, onRemove, onMoveUp, onMoveDown }) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({});
  const lastFocusedCellRef = useRef<{ r: number, c: number } | null>(null);

  const updateProp = (key: string, value: any) => {
    onChange(module.id, { ...module.properties, [key]: value });
  };

  const handleInsertExpression = (key: string) => {
    const input = inputRefs.current[key];
    const expression = `@{replace('!!!','VAR_NAME')}`;
    const currentValue = (module.properties as any)[key] || "";
    
    let newValue = "";
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      newValue = currentValue.substring(0, start) + expression + currentValue.substring(end);
      
      updateProp(key, newValue);
      
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

  const handleTableCellInsert = () => {
    if (!lastFocusedCellRef.current) {
      // If no cell is marked, fallback to clipboard
      const expression = `@{replace('!!!','VAR_NAME')}`;
      navigator.clipboard.writeText(expression);
      return;
    }

    const { r, c } = lastFocusedCellRef.current;
    const input = inputRefs.current[`cell-${r}-${c}`];
    const expression = `@{replace('!!!','VAR_NAME')}`;
    const currentRows = module.properties.gridRows || [];
    const currentValue = currentRows[r]?.cells[c] || "";
    
    if (input) {
      const start = (input as HTMLInputElement).selectionStart || 0;
      const end = (input as HTMLInputElement).selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + expression + currentValue.substring(end);
      
      handleCellChange(r, c, newValue);
      
      setTimeout(() => {
        const field = inputRefs.current[`cell-${r}-${c}`] as HTMLInputElement;
        if (field) {
          field.focus();
          const newPos = start + expression.length;
          field.setSelectionRange(newPos, newPos);
        }
      }, 10);
    }
  };

  const handleDeptSelect = (code: string) => {
    if (!code) return;
    updateProp('imageUrl', `${LOGO_BASE_URL}${code}.png`);
  };

  const currentDeptCode = module.properties.imageUrl?.replace(LOGO_BASE_URL, '').replace('.png', '') || '';
  const isPresetLogo = DEPT_OPTIONS.some(opt => opt.code === currentDeptCode);

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newGridRows = [...(module.properties.gridRows || [])];
    const newCells = [...newGridRows[rowIndex].cells];
    newCells[cellIndex] = value;
    newGridRows[rowIndex] = { cells: newCells };
    updateProp('gridRows', newGridRows);
  };

  const addGridRow = () => {
    const firstRow = module.properties.gridRows?.[0];
    const cellCount = firstRow ? firstRow.cells.length : 2;
    const newGridRows = [...(module.properties.gridRows || []), { cells: new Array(cellCount).fill('') }];
    updateProp('gridRows', newGridRows);
  };

  const removeGridRow = (index: number) => {
    const newGridRows = (module.properties.gridRows || []).filter((_, i) => i !== index);
    updateProp('gridRows', newGridRows);
  };

  const addColumn = () => {
    const newGridRows = (module.properties.gridRows || [{ cells: ['', ''] }]).map(row => ({
      cells: [...row.cells, '']
    }));
    updateProp('gridRows', newGridRows);
  };

  const removeColumn = (colIndex: number) => {
    const newGridRows = (module.properties.gridRows || []).map(row => ({
      cells: row.cells.filter((_, i) => i !== colIndex)
    }));
    updateProp('gridRows', newGridRows);
  };

  const renderLabelWithHelper = (label: string, fieldKey: string) => (
    <div className="flex justify-between items-center mb-1">
      <label className="block text-[10px] font-bold text-slate-400 uppercase">{label}</label>
      <button 
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); 
          handleInsertExpression(fieldKey);
        }}
        className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer"
        title="Insert Power Automate Expression"
      >
        <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
        Insert Expr.
      </button>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            {module.type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onMoveUp(module.id)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Move Up">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={() => onMoveDown(module.id)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Move Down">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => onRemove(module.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded transition-colors" title="Remove">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {module.type === ModuleType.HEADER_LOGO && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preset Department Logo</label>
            <select 
              className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white mb-2 cursor-pointer shadow-sm"
              onChange={(e) => handleDeptSelect(e.target.value)}
              value={isPresetLogo ? currentDeptCode : ""}
            >
              <option value="" disabled>Select Department...</option>
              {DEPT_OPTIONS.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.name}</option>
              ))}
            </select>
          </div>
        )}

        {(module.properties.title !== undefined) && (
          <div className="flex flex-col gap-4">
            <div>
              {renderLabelWithHelper("Title", "title")}
              <input 
                ref={el => { inputRefs.current['title'] = el; }}
                type="text" 
                value={module.properties.title} 
                onChange={(e) => updateProp('title', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm"
              />
            </div>
            {module.type === ModuleType.BANNER && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Banner Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={module.properties.color || '#0078DC'} 
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="h-8 w-12 border border-slate-200 rounded p-0.5 bg-white cursor-pointer shadow-sm"
                  />
                  <input 
                    type="text" 
                    value={module.properties.color || '#0078DC'} 
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {(module.properties.content !== undefined) && (
          <div>
            {renderLabelWithHelper("Content Text", "content")}
            <textarea 
              ref={el => { inputRefs.current['content'] = el; }}
              rows={3}
              value={module.properties.content} 
              onChange={(e) => updateProp('content', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white resize-none shadow-sm"
            />
          </div>
        )}

        {(module.properties.imageUrl !== undefined) && (
          <div>
            {renderLabelWithHelper("Image URL / CID", "imageUrl")}
            <input 
              ref={el => { inputRefs.current['imageUrl'] = el; }}
              type="text" 
              value={module.properties.imageUrl} 
              onChange={(e) => updateProp('imageUrl', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>
        )}

        {module.type === ModuleType.SIGNATURE && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors shadow-inner">
               <input 
                 type="checkbox" 
                 checked={!!module.properties.hasStarRating} 
                 onChange={e => updateProp('hasStarRating', e.target.checked)}
                 className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
               />
               <span className="text-[10px] font-bold text-slate-600 uppercase">Include Star Rating</span>
            </label>
          </div>
        )}

        {module.type === ModuleType.TABLE && (
          <div className="space-y-4">
            <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!module.properties.hasColumnHeaders} 
                    onChange={e => updateProp('hasColumnHeaders', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Column Headers</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!module.properties.hasRowHeaders} 
                    onChange={e => updateProp('hasRowHeaders', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Row Headers</span>
               </label>
            </div>

            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Grid Data</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleTableCellInsert();
                  }}
                  className="text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer mr-2"
                  title="Insert Expression into marked cell"
                >
                  <span className="font-mono text-[10px] opacity-70">&lt;/&gt;</span>
                  Insert Expr.
                </button>
                <button onClick={addColumn} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold hover:bg-blue-100 transition-colors">
                  + COL
                </button>
                <button onClick={addGridRow} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold hover:bg-blue-100 transition-colors">
                  + ROW
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto pb-2 custom-scrollbar border border-slate-100 rounded-lg p-2 bg-slate-50/50">
              <div className="min-w-max space-y-2">
                {module.properties.gridRows?.map((row, rIdx) => {
                  const isHeaderRow = module.properties.hasColumnHeaders && rIdx === 0;
                  return (
                    <div key={rIdx} className="flex gap-2 items-center group/row">
                      {row.cells.map((cell, cIdx) => {
                        const isHeaderCell = (module.properties.hasRowHeaders && cIdx === 0) || isHeaderRow;
                        return (
                          <div key={cIdx} className="relative group/col">
                            <input 
                              ref={el => { inputRefs.current[`cell-${rIdx}-${cIdx}`] = el; }}
                              type="text" 
                              value={cell} 
                              onFocus={() => { lastFocusedCellRef.current = { r: rIdx, c: cIdx }; }}
                              onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                              className={`w-24 text-xs border rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm transition-colors ${
                                isHeaderCell 
                                ? 'bg-blue-50/50 border-blue-200 font-bold text-blue-800' 
                                : 'bg-white border-slate-200'
                              }`}
                              placeholder={isHeaderCell ? "Header" : "Data"}
                            />
                            {rIdx === 0 && (
                              <button 
                                onClick={() => removeColumn(cIdx)} 
                                className="absolute -top-1.5 -right-1.5 bg-white shadow-md border border-red-100 text-red-400 hover:text-red-600 rounded-full p-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity z-10"
                                title="Remove Column"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <button onClick={() => removeGridRow(rIdx)} className="text-red-300 hover:text-red-500 transition-colors p-1" title="Remove Row">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {(module.properties.buttonText !== undefined) && (
          <div className="flex flex-col gap-4">
            <div>
              {renderLabelWithHelper("Button Text", "buttonText")}
              <input 
                ref={el => { inputRefs.current['buttonText'] = el; }}
                type="text" 
                value={module.properties.buttonText} 
                onChange={(e) => updateProp('buttonText', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm"
              />
            </div>
            <div>
              {renderLabelWithHelper("Link URL", "url")}
              <input 
                ref={el => { inputRefs.current['url'] = el; }}
                type="text" 
                value={module.properties.url} 
                onChange={(e) => updateProp('url', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Button Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={module.properties.color || '#0078DC'} 
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="h-8 w-12 border border-slate-200 rounded p-0.5 bg-white cursor-pointer shadow-sm"
                />
                <input 
                  type="text" 
                  value={module.properties.color || '#0078DC'} 
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleItemEditor;