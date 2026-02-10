<%@ Page Language="C#" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Builder - SharePoint Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        input, textarea, select { background-color: white !important; }
        input::-webkit-scrollbar, textarea::-webkit-scrollbar { width: 4px; height: 4px; }
        input::-webkit-scrollbar-track, textarea::-webkit-scrollbar-track { background: white; }
        input::-webkit-scrollbar-thumb, textarea::-webkit-scrollbar-thumb { background: white; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900">
    <div id="root"></div>

    <script type="module">
        import React, { useState, useEffect, useCallback, useMemo, useRef } from 'https://esm.sh/react@19.2.4';
        import ReactDOM from 'https://esm.sh/react-dom@19.2.4/client';

        const ModuleType = {
            HEADER_LOGO: 'HEADER_LOGO',
            BANNER: 'BANNER',
            TEXT: 'TEXT',
            IMAGE: 'IMAGE',
            TABLE: 'TABLE',
            BUTTON: 'BUTTON',
            SIGNATURE: 'SIGNATURE'
        };

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

        const DEFAULT_MODULES = [
          {
            id: 'm1',
            type: ModuleType.HEADER_LOGO,
            properties: {
              imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_CO.png',
              align: 'right',
              altText: 'report_logo_CO.png'
            }
          },
          {
            id: 'm2',
            type: ModuleType.BANNER,
            properties: {
              title: 'USE CASE UPDATE',
              color: '#0078DC'
            }
          },
          {
            id: 'm3',
            type: ModuleType.TEXT,
            properties: {
              content: "Dear @{replace('!!!','Recipient')},\n\nHere is the query result for the best digitalization team out there:"
            }
          },
          {
            id: 'm4',
            type: ModuleType.IMAGE,
            properties: {
              imageUrl: 'cid:report.png',
              altText: 'report.png'
            }
          },
          {
            id: 'm5',
            type: ModuleType.TABLE,
            properties: {
              hasColumnHeaders: false,
              hasRowHeaders: true,
              gridRows: [
                { cells: ['Team Name', 'DOT'] },
                { cells: ['Dept Code', 'P_OI1-A5'] },
                { cells: ['Description:', 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'] }
              ]
            }
          },
          {
            id: 'm6',
            type: ModuleType.BUTTON,
            properties: {
              content: 'Please visit out platform for any digitalization related questions:',
              buttonText: 'CO Digi Guide',
              url: 'https://uniper.sharepoint.com/sites/CommOpsDigTransHub',
              color: '#0078DC'
            }
          },
          {
            id: 'm7',
            type: ModuleType.BANNER,
            properties: {
              title: '',
              color: '#0078DC'
            }
          },
          {
            id: 'm8',
            type: ModuleType.SIGNATURE,
            properties: {
              content: 'This is an automatically generated email.',
              imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png',
              hasStarRating: true
            }
          }
        ];

        const renderModuleToHtml = (module) => {
            const { type, properties } = module;
            switch (type) {
                case ModuleType.HEADER_LOGO:
                    return `<div style="text-align: ${properties.align || 'right'}; margin-bottom: 20px; margin-top: 40px;"><img src="${properties.imageUrl}" width="auto" style="display: inline-block; width: auto; max-width: 640px; height: auto;"></div>`;
                case ModuleType.BANNER:
                    return `
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:50px;v-text-anchor:middle;width:640px;" arcsize="24%" stroke="f" fillcolor="${properties.color}">
                        <w:anchorlock/>
                        <center>
                    <![endif]-->
                    <div style="margin-top: 25px; text-align: center; padding: 12px; background-color: ${properties.color}; border-radius: 12px;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">${properties.title}</h2>
                    </div>
                    <!--[if mso]>
                        </center>
                    </v:roundrect>
                    <![endif]-->`;
                case ModuleType.TEXT:
                    return properties.content?.split('\n').map(p => p.trim() ? `<p style="margin-bottom: 15px; margin-top: 25px; font-size: 15px;">${p}</p>` : '').join('') || '';
                case ModuleType.IMAGE:
                    return `<div style="margin: 25px 0;"><img src="${properties.imageUrl}" width="640" style="display: block; width: 100%; max-width: 640px; height: auto; border: 1px solid #dddddd; border-radius: 4px;"></div>`;
                case ModuleType.TABLE:
                    const rows = properties.gridRows || [];
                    const hCols = !!properties.hasColumnHeaders;
                    const hRows = !!properties.hasRowHeaders;
                    const rowsHtml = rows.map((r, ri) => {
                        const isHeaderRow = hCols && ri === 0;
                        const cells = r.cells.map((c, ci) => {
                            const isH = (hRows && ci === 0) || isHeaderRow;
                            const tag = isH ? 'th' : 'td';
                            let cellStyle = `padding: 12px; border: 1px solid #dddddd; text-align: left;`;
                            if (isHeaderRow) {
                                cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold;';
                            } else if (hRows && ci === 0) {
                                cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold; width: 30%;';
                            } else {
                                cellStyle += ' background-color: #f9f9f9;';
                            }
                            return `<${tag} style="${cellStyle}">${c}</${tag}>`;
                        }).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    return `<table style="width: 100%; max-width: 640px; margin: 25px auto; border-collapse: collapse; font-size: 14px; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden;"><tbody>${rowsHtml}</tbody></table>`;
                case ModuleType.BUTTON:
                    return `<div style="margin-top: 25px; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 8px;"><p style="margin: 0 0 15px 0; font-size: 13px; color: #666;">${properties.content}</p><a href="${properties.url}" style="background-color: ${properties.color || '#0078DC'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">${properties.buttonText}</a></div>`;
                case ModuleType.SIGNATURE:
                    const ratingBaseUrl = 'https://apps.powerapps.com/play/e/default-db8e2f82-8a37-4c09-b7de-ed06547b5a20/a/8d6aa8c2-432f-47d4-a201-803bfee1702e?tenantId=db8e2f82-8a37-4c09-b7de-ed06547b5a20&hint=221a9b25-893f-4de1-9ff0-d792206ec37c&sourcetime=1706559731201&source=portal&HideNavBar=true&Rating=';
                    const ratingHtml = properties.hasStarRating ? `
                        <div style="text-align: center; margin-top: 15px; margin-bottom: 40px;">
                          <p style="font-size: 10px; font-weight: bold; color: #C6C6C6; margin-bottom: 2px; text-transform: uppercase;">RATE YOUR EXPERIENCE</p>
                          <div style="font-size: 28px;">
                            <a href="${ratingBaseUrl}1" title="1/5" style="text-decoration: none; color: #C6C6C6;">★</a>
                            <a href="${ratingBaseUrl}2" title="2/5" style="text-decoration: none; color: #C6C6C6;">★</a>
                            <a href="${ratingBaseUrl}3" title="3/5" style="text-decoration: none; color: #C6C6C6;">★</a>
                            <a href="${ratingBaseUrl}4" title="4/5" style="text-decoration: none; color: #C6C6C6;">★</a>
                            <a href="${ratingBaseUrl}5" title="5/5" style="text-decoration: none; color: #C6C6C6;">★</a>
                          </div>
                        </div>` : '';
                    return `
                        <p style="font-size: 11px; color: #C6C6C6; text-align: center; margin-top: 20px;">${properties.content}</p>
                        <div style="text-align: center; margin-top: 40px; ${!properties.hasStarRating ? 'margin-bottom: 40px;' : ''}">
                            <img src="${properties.imageUrl}" style="display: inline-block; height: 40px;">
                        </div>
                        ${ratingHtml}`;
                default: return '';
            }
        };

        const generateFullHtml = (modules) => {
            const content = modules.map(m => renderModuleToHtml(m)).join('\n');
            return `<!DOCTYPE html><html><body style="background-color: #f4f4f4; padding: 20px 0;"><div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: auto; background-color: #ffffff; color: #333; padding: 20px; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">${content}</div></body></html>`;
        };

        const ModuleItemEditor = ({ module, onChange, onRemove, onMoveUp, onMoveDown }) => {
            const inputRefs = useRef({});
            const lastFocusedCellRef = useRef(null);

            const updateProp = (key, value) => onChange(module.id, { ...module.properties, [key]: value });
            
            const handleDeptSelect = (code) => {
                if (!code) return;
                updateProp('imageUrl', `${LOGO_BASE_URL}${code}.png`);
            };

            const handleInsertExpression = (key) => {
                const input = inputRefs.current[key];
                const varName = prompt("Enter Variable Name:", "VAR_NAME");
                if (varName === null) return;
                const expression = `@{replace('!!!','${varName}')}`;
                const currentValue = module.properties[key] || "";
                let newValue = "";
                if (input) {
                    const start = input.selectionStart || 0;
                    const end = input.selectionEnd || 0;
                    newValue = currentValue.substring(0, start) + expression + currentValue.substring(end);
                    updateProp(key, newValue);
                    setTimeout(() => { if (inputRefs.current[key]) { inputRefs.current[key].focus(); const newPos = start + expression.length; inputRefs.current[key].setSelectionRange(newPos, newPos); } }, 10);
                } else { updateProp(key, currentValue + expression); }
            };

            const handleTableCellInsert = () => {
              if (!lastFocusedCellRef.current) {
                const varName = prompt("Enter Variable Name:", "VAR_NAME");
                if (varName) navigator.clipboard.writeText(`@{replace('!!!','${varName}')}`);
                return;
              }
              const { r, c } = lastFocusedCellRef.current;
              const input = inputRefs.current[`cell-${r}-${c}`];
              const varName = prompt("Enter Variable Name:", "VAR_NAME");
              if (!varName) return;
              const expression = `@{replace('!!!','${varName}')}`;
              const rows = [...(module.properties.gridRows || [])];
              const val = rows[r].cells[c] || "";
              if (input) {
                const start = input.selectionStart || 0;
                const end = input.selectionEnd || 0;
                const nVal = val.substring(0, start) + expression + val.substring(end);
                const nRows = [...rows];
                const nCells = [...nRows[r].cells];
                nCells[c] = nVal;
                nRows[r] = { cells: nCells };
                updateProp('gridRows', nRows);
                setTimeout(() => { if (inputRefs.current[`cell-${r}-${c}`]) { inputRefs.current[`cell-${r}-${c}`].focus(); const pos = start + expression.length; inputRefs.current[`cell-${r}-${c}`].setSelectionRange(pos, pos); } }, 10);
              }
            };

            const renderLabelWithHelper = (label, fieldKey) => React.createElement('div', { className: 'flex justify-between items-center mb-1', key: 'label-' + fieldKey }, [
                React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 uppercase' }, label),
                React.createElement('button', { 
                    type: 'button',
                    onMouseDown: (e) => { e.preventDefault(); handleInsertExpression(fieldKey); },
                    className: 'text-[9px] text-slate-400 hover:text-blue-500 font-bold transition-colors flex items-center gap-1 cursor-pointer'
                }, [React.createElement('span', null, '</>'), 'Insert Expr.'])
            ]);

            const currentDeptCode = module.properties.imageUrl?.replace(LOGO_BASE_URL, '').replace('.png', '') || '';
            const isPresetLogo = DEPT_OPTIONS.some(opt => opt.code === currentDeptCode);

            return React.createElement('div', { className: 'bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm' }, [
                React.createElement('div', { className: 'flex justify-between items-center mb-4 pb-2 border-b border-slate-100', key: 'h' }, [
                    React.createElement('span', { className: 'bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase', key: 'p' }, module.type.replace(/_/g, ' ')),
                    React.createElement('div', { className: 'flex gap-1', key: 'b' }, [
                        React.createElement('button', { onClick: () => onMoveUp(module.id), className: 'p-1 hover:bg-slate-100 rounded text-slate-500', key: 'u' }, '↑'),
                        React.createElement('button', { onClick: () => onMoveDown(module.id), className: 'p-1 hover:bg-slate-100 rounded text-slate-500', key: 'd' }, '↓'),
                        React.createElement('button', { onClick: () => onRemove(module.id), className: 'p-1 hover:bg-red-50 text-red-400 rounded', key: 'r' }, '✕')
                    ])
                ]),
                React.createElement('div', { className: 'space-y-4', key: 'c' }, [
                    module.type === ModuleType.HEADER_LOGO && React.createElement('div', { key: 'dept' }, [
                        React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 uppercase mb-1' }, 'Preset Department Logo'),
                        React.createElement('select', { 
                            className: 'w-full text-sm border rounded p-1.5 outline-none bg-white mb-2 cursor-pointer shadow-sm',
                            onChange: e => handleDeptSelect(e.target.value),
                            value: isPresetLogo ? currentDeptCode : ''
                        }, [
                            React.createElement('option', { value: '', disabled: true, key: 'def' }, 'Select Department...'),
                            DEPT_OPTIONS.map(opt => React.createElement('option', { key: opt.code, value: opt.code }, opt.name))
                        ])
                    ]),
                    module.properties.title !== undefined && React.createElement('div', { key: 'title-wrap' }, [
                        renderLabelWithHelper('Title', 'title'),
                        React.createElement('input', { 
                            ref: el => { inputRefs.current['title'] = el; },
                            placeholder: 'Title', value: module.properties.title, onChange: e => updateProp('title', e.target.value), className: 'w-full text-sm border rounded p-1.5 outline-none shadow-sm' 
                        }),
                        module.type === ModuleType.BANNER && React.createElement('div', { className: 'mt-2 flex items-center gap-2', key: 'banner-color' }, [
                            React.createElement('input', { type: 'color', value: module.properties.color || '#0078DC', onChange: e => updateProp('color', e.target.value), className: 'h-8 w-12 border rounded p-0.5 cursor-pointer bg-white shadow-sm' }),
                            React.createElement('input', { type: 'text', value: module.properties.color || '#0078DC', onChange: e => updateProp('color', e.target.value), className: 'flex-1 text-sm border rounded p-1.5 outline-none font-mono uppercase shadow-sm' })
                        ])
                    ]),
                    module.properties.content !== undefined && React.createElement('div', { key: 'content-wrap' }, [
                        renderLabelWithHelper('Content Text', 'content'),
                        React.createElement('textarea', { 
                            ref: el => { inputRefs.current['content'] = el; },
                            rows: 3, placeholder: 'Content', value: module.properties.content, onChange: e => updateProp('content', e.target.value), className: 'w-full text-sm border rounded p-1.5 outline-none resize-none shadow-sm' 
                        })
                    ]),
                    module.properties.imageUrl !== undefined && React.createElement('div', { key: 'img-wrap' }, [
                        renderLabelWithHelper('Image URL / CID', 'imageUrl'),
                        React.createElement('input', { 
                            ref: el => { inputRefs.current['imageUrl'] = el; },
                            placeholder: 'Image URL / CID', value: module.properties.imageUrl, onChange: e => updateProp('imageUrl', e.target.value), className: 'w-full text-sm border rounded p-1.5 outline-none shadow-sm' 
                        })
                    ]),
                    module.type === ModuleType.SIGNATURE && React.createElement('div', { key: 'sig-options' }, [
                        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded border text-[10px] font-bold uppercase shadow-inner' }, [
                            React.createElement('input', { type: 'checkbox', checked: !!module.properties.hasStarRating, onChange: e => updateProp('hasStarRating', e.target.checked) }),
                            'Include Star Rating'
                        ])
                    ]),
                    module.type === ModuleType.TABLE && React.createElement('div', { className: 'space-y-4', key: 'table' }, [
                        React.createElement('div', { className: 'flex gap-4 p-2 bg-slate-50 rounded border shadow-inner' }, [
                            React.createElement('label', { className: 'flex items-center gap-1 cursor-pointer' }, [
                                React.createElement('input', { type: 'checkbox', checked: !!module.properties.hasColumnHeaders, onChange: e => updateProp('hasColumnHeaders', e.target.checked) }),
                                React.createElement('span', { className: 'text-[9px] font-bold uppercase' }, 'Col Headers')
                            ]),
                            React.createElement('label', { className: 'flex items-center gap-1 cursor-pointer' }, [
                                React.createElement('input', { type: 'checkbox', checked: !!module.properties.hasRowHeaders, onChange: e => updateProp('hasRowHeaders', e.target.checked) }),
                                React.createElement('span', { className: 'text-[9px] font-bold uppercase' }, 'Row Headers')
                            ])
                        ]),
                        React.createElement('div', { className: 'flex justify-between items-center mb-1', key: 'tch-head' }, [
                            React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 uppercase' }, 'Grid Editor'),
                            React.createElement('div', { className: 'flex gap-2' }, [
                                React.createElement('button', { onClick: handleTableCellInsert, className: 'text-[9px] text-slate-400 font-bold hover:text-blue-500' }, '</> INSERT'),
                                React.createElement('button', { onClick: () => { const rows = (module.properties.gridRows || [{ cells: ['', ''] }]).map(r => ({ cells: [...r.cells, ''] })); updateProp('gridRows', rows); }, className: 'text-[9px] bg-blue-50 text-blue-600 border px-1.5 py-0.5 rounded font-bold hover:bg-blue-100 transition-colors' }, '+ COL'),
                                React.createElement('button', { onClick: () => { const cellCount = module.properties.gridRows?.[0]?.cells.length || 2; const rows = [...(module.properties.gridRows || []), { cells: new Array(cellCount).fill('') }]; updateProp('gridRows', rows); }, className: 'text-[9px] bg-blue-50 text-blue-600 border px-1.5 py-0.5 rounded font-bold hover:bg-blue-100 transition-colors' }, '+ ROW')
                            ])
                        ]),
                        React.createElement('div', { className: 'overflow-x-auto pb-1 custom-scrollbar border rounded p-1 bg-slate-50/30', key: 'table-scroll' }, 
                            React.createElement('div', { className: 'min-w-max space-y-1' }, 
                                module.properties.gridRows?.map((r, ri) => React.createElement('div', { className: 'flex gap-1 items-center', key: ri }, [
                                    r.cells.map((c, ci) => {
                                        const isH = (module.properties.hasColumnHeaders && ri === 0) || (module.properties.hasRowHeaders && ci === 0);
                                        return React.createElement('input', { 
                                            key: ci, 
                                            ref: el => { inputRefs.current[`cell-${ri}-${ci}`] = el; },
                                            value: c, 
                                            onFocus: () => { lastFocusedCellRef.current = { r: ri, c: ci }; },
                                            onChange: e => { const nRows = [...module.properties.gridRows]; const nCells = [...nRows[ri].cells]; nCells[ci] = e.target.value; nRows[ri] = { cells: nCells }; updateProp('gridRows', nRows); }, 
                                            className: `w-24 text-[11px] border rounded p-1 outline-none shadow-sm ${isH ? 'bg-blue-50 border-blue-100 font-bold text-blue-800' : 'bg-white'}` 
                                        });
                                    }),
                                    React.createElement('button', { onClick: () => { const nRows = module.properties.gridRows.filter((_, idx) => idx !== ri); updateProp('gridRows', nRows); }, className: 'text-red-400 p-1 text-xs hover:bg-red-50 rounded transition-colors' }, '✕')
                                ]))
                            )
                        )
                    ]),
                    module.properties.buttonText !== undefined && React.createElement('div', { className: 'flex flex-col gap-4', key: 'btn-edit' }, [
                        React.createElement('div', { key: 'bt' }, [
                            renderLabelWithHelper('Button Text', 'buttonText'),
                            React.createElement('input', { ref: el => { inputRefs.current['buttonText'] = el; }, value: module.properties.buttonText, onChange: e => updateProp('buttonText', e.target.value), className: 'w-full text-sm border rounded p-1.5 outline-none shadow-sm' })
                        ]),
                        React.createElement('div', { key: 'bu' }, [
                            renderLabelWithHelper('Link URL', 'url'),
                            React.createElement('input', { ref: el => { inputRefs.current['url'] = el; }, value: module.properties.url, onChange: e => updateProp('url', e.target.value), className: 'w-full text-sm border rounded p-1.5 outline-none shadow-sm' })
                        ]),
                        React.createElement('div', { key: 'bc' }, [
                            React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 uppercase mb-1' }, 'Button Color'),
                            React.createElement('div', { className: 'flex items-center gap-2' }, [
                                React.createElement('input', { type: 'color', value: module.properties.color || '#0078DC', onChange: e => updateProp('color', e.target.value), className: 'h-8 w-12 border rounded p-0.5 cursor-pointer bg-white shadow-sm' }),
                                React.createElement('input', { type: 'text', value: module.properties.color || '#0078DC', onChange: e => updateProp('color', e.target.value), className: 'flex-1 text-sm border rounded p-1.5 outline-none font-mono uppercase shadow-sm' })
                            ])
                        ])
                    ])
                ])
            ]);
        };

        const App = () => {
            const [modules, setModules] = useState(DEFAULT_MODULES);
            const [activeTab, setActiveTab] = useState('preview');
            const [copySuccess, setCopySuccess] = useState(false);
            const fullHtml = useMemo(() => generateFullHtml(modules), [modules]);

            const addModule = (type) => {
                const id = `m-${Date.now()}`;
                let props = { content: 'Sample text' };
                if (type === ModuleType.HEADER_LOGO) props = { imageUrl: LOGO_BASE_URL + 'CO.png', align: 'right' };
                if (type === ModuleType.TABLE) props = { hasColumnHeaders: true, gridRows: [{cells: ['H1', 'H2']}, {cells: ['D1', 'D2']}] };
                if (type === ModuleType.BUTTON) props = { content: 'Action text', buttonText: 'Click', url: '#', color: '#0078DC' };
                if (type === ModuleType.BANNER) props = { title: 'New Banner', color: '#0078DC' };
                if (type === ModuleType.SIGNATURE) props = { content: 'Automatic signature', imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png', hasStarRating: true };
                setModules([...modules, { id, type, properties: props }]);
            };

            return React.createElement('div', { className: 'flex h-screen overflow-hidden' }, [
                React.createElement('div', { className: 'w-[30rem] border-r flex flex-col h-full bg-white z-10 shadow-lg', key: 's' }, [
                    React.createElement('div', { className: 'h-14 px-4 border-b flex justify-between items-center bg-slate-50' }, [
                        React.createElement('div', { className: 'flex items-center gap-3' }, [
                            React.createElement('img', { src: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/DOT_small_bm.png', className: 'h-5 w-auto' }),
                            React.createElement('div', { className: 'h-5 w-px bg-slate-200' }),
                            React.createElement('span', { className: 'font-bold text-sm text-slate-800' }, 'Email Builder')
                        ]),
                        React.createElement('div', { className: 'relative group' }, [
                            React.createElement('button', { className: 'bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all shadow-sm' }, 'ADD'),
                            React.createElement('div', { className: 'absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl invisible group-hover:visible transition-all z-50 py-1' }, 
                                Object.values(ModuleType).map(t => React.createElement('button', { key: t, onClick: () => addModule(t), className: 'w-full text-left px-4 py-2 text-[11px] hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors' }, t.replace(/_/g, ' ')))
                            )
                        ])
                    ]),
                    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30' }, 
                        modules.map(m => React.createElement(ModuleItemEditor, { key: m.id, module: m, onChange: (id, p) => setModules(modules.map(x => x.id === id ? {...x, properties: p} : x)), onRemove: id => setModules(modules.filter(x => x.id !== id)), onMoveUp: id => { const i = modules.findIndex(x => x.id === id); if (i > 0) { const nm = [...modules]; [nm[i], nm[i-1]] = [nm[i-1], nm[i]]; setModules(nm); } }, onMoveDown: id => { const i = modules.findIndex(x => x.id === id); if (i < modules.length - 1) { const nm = [...modules]; [nm[i], nm[i+1]] = [nm[i+1], nm[i]]; setModules(nm); } } }))
                    )
                ]),
                React.createElement('div', { className: 'flex-1 flex flex-col', key: 'm' }, [
                    React.createElement('div', { className: 'h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm' }, [
                        React.createElement('div', { className: 'flex bg-slate-100 p-1 rounded-lg' }, [
                            React.createElement('button', { onClick: () => setActiveTab('preview'), className: `px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}` }, 'Preview'),
                            React.createElement('button', { onClick: () => { setActiveTab('code') }, className: `px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}` }, 'Export HTML')
                        ]),
                        React.createElement('button', { onClick: () => { navigator.clipboard.writeText(fullHtml); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }, className: `text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'}` }, copySuccess ? 'Copied!' : 'Copy Code')
                    ]),
                    React.createElement('div', { className: 'flex-1 overflow-auto p-8 bg-slate-100/50 flex justify-center items-start' }, 
                        activeTab === 'preview' 
                        ? React.createElement('div', { className: 'w-full max-w-[680px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200' }, React.createElement('iframe', { srcDoc: fullHtml, className: 'w-full h-[calc(100vh-160px)] border-none' }))
                        : React.createElement('div', { className: 'w-full max-w-[900px] h-full' }, React.createElement('pre', { className: 'bg-slate-900 text-blue-300 p-6 rounded-xl text-sm h-[calc(100vh-160px)] overflow-auto shadow-2xl border border-slate-800 font-mono' }, fullHtml))
                    )
                ])
            ]);
        };

        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
    </script>
</body>
</html>