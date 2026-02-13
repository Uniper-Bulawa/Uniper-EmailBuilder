import { ModuleData, ModuleType, ChecklistItem } from './types';

const getFileName = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
};

const formatDimension = (val?: string) => {
    if (!val || val.trim() === '') return 'auto';
    const trimmed = val.trim();
    // If it's a number (integer or decimal), append 'px'
    if (/^\d*\.?\d+$/.test(trimmed)) {
        return `${trimmed}px`;
    }
    return trimmed;
};

const getChecklistIcon = (type: ChecklistItem['icon']) => {
    switch (type) {
        case 'empty': return '☐';
        case 'checked': return '▣';
        case 'circle': return '○';
        case 'disc': return '●';
        case 'arrow': return '➔';
        case 'star': return '★';
        case 'blue': return '<span class="checklist-blue" style="color: #0078DC;">■</span>';
        case 'black': return '■';
        default: return '•';
    }
};

export const renderModuleToHtml = (module: ModuleData, prevModuleType?: ModuleType, nextModuleType?: ModuleType, firstBannerColor: string = '#0078DC'): string => {
    const { type, properties, id } = module;
    let content = '';

    switch (type) {
        case ModuleType.HEADER_LOGO:
            const logoImgHtml = `<img src="${properties.imageUrl}" width="auto" alt="${getFileName(properties.imageUrl)}" style="display: inline-block; width: auto; max-width: 640px; height: auto;">`;
            const logoContent = properties.url ? `<a href="${properties.url}" style="text-decoration: none;">${logoImgHtml}</a>` : logoImgHtml;
            content = `<div class="header-logo" style="text-align: ${properties.align || 'right'}; margin-bottom: 20px; margin-top: 20px;">
    ${logoContent}
</div>`;
            break;

        case ModuleType.BANNER:
            const isFollowedByDP = nextModuleType === ModuleType.DELIVERY_PHASE;
            const bannerRadius = isFollowedByDP ? '12px 12px 0 0' : '12px';
            const vmlTag = isFollowedByDP ? 'v:rect' : 'v:roundrect';
            const arcSize = isFollowedByDP ? '' : 'arcsize="24%"';
            const bannerHeight = properties.isDivider ? '8px' : '50px';
            const vmlHeight = properties.isDivider ? '8' : '50';

            content = `<!--[if mso]>
<${vmlTag} xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:${vmlHeight}px;v-text-anchor:middle;width:640px;" ${arcSize} stroke="f" fillcolor="${properties.color}">
    <w:anchorlock/>
    <center>
<![endif]-->
<div class="banner-bg" style="margin-top: 25px; text-align: center; ${properties.isDivider ? `height: ${bannerHeight}; padding: 0;` : 'padding: 12px;'} background-color: ${properties.color}; border-radius: ${bannerRadius};">
    ${properties.isDivider ? '' : `<h2 class="banner-text" style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">${properties.title}</h2>`}
</div>
<!--[if mso]>
    </center>
</${vmlTag}>
<![endif]-->`;
            break;

        case ModuleType.TEXT:
            const textAlign = properties.align || 'left';
            const formattedText = (properties.content || '').replace(/\n/g, '<br>');
            content = `<div class="text-block" style="margin-top: 25px; margin-bottom: 15px; font-size: 15px; text-align: ${textAlign}; line-height: 1.5;">${formattedText}</div>`;
            break;

        case ModuleType.IMAGE:
            const w = formatDimension(properties.imageWidth);
            const h = formatDimension(properties.imageHeight);
            const imgAlign = properties.align || 'center';
            const margin = imgAlign === 'center' ? '0 auto' : (imgAlign === 'right' ? '0 0 0 auto' : '0');
            const mainImgHtml = `<img src="${properties.imageUrl}" alt="${getFileName(properties.imageUrl)}" style="display: block; width: ${w}; max-width: 100%; height: ${h}; margin: ${margin}; border-radius: 8px; border: 0; -ms-interpolation-mode: bicubic;">`;
            const mainImgContent = properties.url ? `<a href="${properties.url}" style="text-decoration: none;">${mainImgHtml}</a>` : mainImgHtml;
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        <tr>
            <td align="${imgAlign}" style="padding: 0; text-align: ${imgAlign};">
                ${mainImgContent}
            </td>
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.TABLE:
            const rows = properties.gridRows || [];
            const hasColumnHeaders = !!properties.hasColumnHeaders;
            const hasRowHeaders = !!properties.hasRowHeaders;
            const tableBorderColor = '#EEEEEE';

            const rowsHtml = rows.map((row, rIdx) => {
                const isHeaderRow = hasColumnHeaders && rIdx === 0;
                const cellsHtml = row.cells.map((cell, cIdx) => {
                    const isHeaderCell = (hasRowHeaders && cIdx === 0) || isHeaderRow;
                    const tag = isHeaderCell ? 'th' : 'td';
                    const cellClass = isHeaderCell ? 'table-header-cell' : 'table-cell';
                    
                    let cellStyle = `padding: 12px; border: 1px solid ${tableBorderColor}; text-align: left;`;
                    if (isHeaderRow) {
                        cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold;';
                    } else if (hasRowHeaders && cIdx === 0) {
                        cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold; width: 30%;';
                    } else {
                        cellStyle += ' background-color: #f9f9f9;';
                    }

                    return `\n            <${tag} class="${cellClass}" style="${cellStyle}">${cell}</${tag}>`;
                }).join('');
                return `\n        <tr>${cellsHtml}\n        </tr>`;
            }).join('');

            content = `<table class="content-table" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto; border-collapse: collapse; font-size: 14px; border: 1px solid ${tableBorderColor}; border-radius: 8px; overflow: hidden;">
    <tbody>${rowsHtml}
    </tbody>
</table>`;
            break;

        case ModuleType.BUTTON:
            const showBox = properties.hasContentBox !== false;
            const formattedButtonContent = (properties.content || '').replace(/\n/g, '<br>');
            const mainBtn = `<a href="${properties.url}" class="button-link" style="background-color: ${properties.color || '#0078DC'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; margin: 5px;">${properties.buttonText}</a>`;
            const secBtns = (properties.secondaryButtons || []).map(btn => 
                `<a href="${btn.url}" class="button-link" style="background-color: ${btn.color || '#0078DC'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; margin: 5px;">${btn.text}</a>`
            ).join('');

            const buttonsContainer = `<div style="text-align: center; font-size: 0;">${mainBtn}${secBtns}</div>`;

            if (showBox) {
                content = `<div class="button-section" style="margin-top: 25px; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <p class="button-hint" style="margin: 0 0 15px 0; font-size: 13px; color: #666; line-height: 1.5;">${formattedButtonContent}</p>
    ${buttonsContainer}
</div>`;
            } else {
                content = `<div class="button-section-no-box" style="margin-top: 25px; text-align: center;">
    ${buttonsContainer}
</div>`;
            }
            break;

        case ModuleType.SIGNATURE:
            const ratingBaseUrl = 'https://apps.powerapps.com/play/e/default-db8e2f82-8a37-4c09-b7de-ed06547b5a20/a/8d6aa8c2-432f-47d4-a201-803bfee1702e?tenantId=db8e2f82-8a37-4c09-b7de-ed06547b5a20&hint=221a9b25-893f-4de1-9ff0-d792206ec37c&sourcetime=1706559731201&source=portal&HideNavBar=true&Rating=';
            
            const ratingHtml = properties.hasStarRating ? `\n<div class="rating-section" style="text-align: center; margin-top: 15px; margin-bottom: 40px;">
    <p style="font-size: 10px; font-weight: bold; color: #C6C6C6; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px;">RATE YOUR EXPERIENCE</p>
    <div style="font-size: 28px; line-height: 1;">
        <a href="${ratingBaseUrl}1" title="1/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}2" title="2/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}3" title="3/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}4" title="4/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}5" title="5/5" style="text-decoration: none; color: #C6C6C6;">★</a>
    </div>
</div>` : '';

            const formattedSigContent = (properties.content || '').replace(/\n/g, '<br>');
            const sigImgHtml = `<img src="${properties.imageUrl}" alt="${getFileName(properties.imageUrl)}" style="display: inline-block; width: auto; max-width: 640px; height: 40px;">`;
            const sigLogoContent = properties.url ? `<a href="${properties.url}" style="text-decoration: none;">${sigImgHtml}</a>` : sigImgHtml;
            content = `<p class="signature-text" style="font-size: 11px; color: #C6C6C6; text-align: center; margin-top: 20px; line-height: 1.5;">
    ${formattedSigContent}
</p>
<div class="signature-logo" style="text-align: center; margin-top: 40px; ${!properties.hasStarRating ? 'margin-bottom: 40px;' : ''}">
    ${sigLogoContent}
</div>${ratingHtml}`;
            break;

        case ModuleType.DELIVERY_PHASE:
            const phases = ['L3 Prio', 'Assess', 'Design', 'Plan', 'Develop', 'Document', 'Train', 'Handover', 'Live'];
            const gridColor = '#E0E0E0';
            const phaseCells = phases.map((p, idx) => {
                const isActive = p === properties.selectedPhase;
                const bg = isActive ? firstBannerColor : '#f2f2f2';
                const color = isActive ? '#ffffff' : '#999999';
                const weight = isActive ? 'bold' : 'normal';
                const borderStyle = idx === phases.length - 1 ? '' : `border-right: 1px solid ${gridColor};`;
                const cellClass = isActive ? 'phase-cell phase-active' : 'phase-cell';
                
                return `<td class="${cellClass}" style="padding: 10px 4px; background-color: ${bg}; color: ${color}; font-size: 10px; text-align: center; font-weight: ${weight}; ${borderStyle}">${p}</td>`;
            }).join('');
            
            const isFollowedBanner = prevModuleType === ModuleType.BANNER;
            const dpRadius = isFollowedBanner ? '0 0 12px 12px' : '12px';
            const dpMarginTop = isFollowedBanner ? '0' : '25px';

            content = `<table class="phase-table" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: ${dpMarginTop} auto 25px auto; border-collapse: collapse; overflow: hidden; border-radius: ${dpRadius};">
    <tbody>
        <tr>
            ${phaseCells}
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.KPI_CARDS:
            const metrics = properties.metrics || [];
            const metricCells = metrics.map(m => `
            <td style="padding: 10px; width: ${100/metrics.length}%;">
                <div class="kpi-card" style="background-color: #ffffff; border: 1px solid #eeeeee; border-top: 4px solid ${m.color}; padding: 15px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div class="kpi-value" style="font-size: 24px; font-weight: bold; color: ${m.color}; margin-bottom: 4px;">${m.value}</div>
                    <div class="kpi-label" style="font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">${m.label}</div>
                </div>
            </td>`).join('');
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        <tr>
            ${metricCells}
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.TWO_COLUMN:
            const col1Type = properties.col1Type || (properties.imagePosition === 'right' ? 'text' : 'image');
            const col2Type = properties.col2Type || (properties.imagePosition === 'right' ? 'image' : 'text');
            
            const renderColumn = (cType: string, cText?: string, cImg?: string) => {
                if (cType === 'image') {
                    const src = cImg || properties.imageUrl || 'https://picsum.photos/300/200';
                    return `<td style="width: 50%; padding: 10px; vertical-align: middle;">
    <img src="${src}" width="100%" alt="${getFileName(src)}" style="display: block; width: 100%; height: auto; border-radius: 6px; border: 0;">
</td>`;
                } else {
                    const text = cText || properties.content || 'Add text here...';
                    const formatted = text.replace(/\n/g, '<br>');
                    return `<td style="width: 50%; padding: 10px; vertical-align: middle;">
    <div class="text-block" style="font-size: 15px; color: #333333; line-height: 1.5;">${formatted}</div>
</td>`;
                }
            };

            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        <tr>
            ${renderColumn(col1Type, properties.col1Text, properties.col1ImageUrl)}
            ${renderColumn(col2Type, properties.col2Text, properties.col2ImageUrl)}
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.CHECKLIST:
            const checklistHtml = (properties.checklistItems || []).map(item => `
        <tr>
            <td class="checklist-icon-cell" style="padding: 4px 6px 4px 20px; vertical-align: middle; font-size: 18px; line-height: 1; width: 24px; text-align: center;">
                ${getChecklistIcon(item.icon)}
            </td>
            <td class="checklist-text-cell" style="padding: 4px 0; vertical-align: middle; font-size: 15px; color: #333333;">
                ${item.text}
            </td>
        </tr>`).join('');
            content = `<table class="checklist-table" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        ${checklistHtml}
    </tbody>
</table>`;
            break;

        case ModuleType.LEGAL:
            content = `<div class="legal-block" style="margin-top: 25px; margin-bottom: 25px; font-size: 11px; color: #C6C6C6; text-align: left; line-height: 1.5;">
    Uniper Global Commodities SE, Holzstraße 6, 40221 Düsseldorf, Germany<br>
    Sitz/Registered Office: Düsseldorf, Amtsgericht/DistrictCourt Düsseldorf HRB 61123<br>
    Vorsitzender des Aufsichtsrats/Chairman of the Supervisory Board: ${properties.chairman || '[CHAIRMAN]'}<br>
    Vorstand/Board of Management: ${properties.board || '[BOARD]'}<br><br>
    Besucheradresse/Visiting address: Franziusstraße 10, 40219 Düsseldorf, Germany
</div>`;
            break;

        default:
            content = '';
    }

    return `<!-- START_ID:${id} --><div id="module-${id}">\n\n${content.trim()}\n\n</div><!-- END_ID:${id} -->`;
};

export const generateFullHtml = (modules: ModuleData[], isDarkMode: boolean = false): string => {
    const insideModules = modules.filter(m => m.section === 'inside');
    const outsideModules = modules.filter(m => m.section === 'outside');

    // Find the first banner's color to use as the primary brand color for synchronizing Delivery Phase
    const firstBannerColor = modules.find(m => m.type === ModuleType.BANNER)?.properties.color || '#0078DC';

    const renderList = (list: ModuleData[]) => list.map((m, idx) => {
        const prevModuleType = list[idx - 1]?.type;
        const nextModuleType = list[idx + 1]?.type;
        return renderModuleToHtml(m, prevModuleType, nextModuleType, firstBannerColor);
    }).join('\n');

    const insideHtml = renderList(insideModules);
    const outsideHtml = renderList(outsideModules);

    // Precise Dark Mode Simulation for Outlook Preview
    const darkSimulationStyles = isDarkMode ? `
        body { background-color: #292929 !important; }
        .main-container { 
            background-color: #292929 !important; 
            box-shadow: 0 4px 30px rgba(0,0,0,0.3) !important;
            border: 0px solid #333 !important;
        }
        
        /* General Text Color, Table Body Text, Image Alt Text, Non-Blue Checklist Icons - Enforce #D7D7D7 */
        .text-block, .checklist-text-cell, .checklist-icon-cell, .button-hint, .kpi-label, .legal-block, .table-cell, img {
            color: #D7D7D7 !important;
        }

        /* Specific Blue Brand Elements (Enforced #0078DC) */
        .checklist-blue, .table-header-cell, .main-container a:not(.button-link) {
            color: #0078DC !important;
        }

        /* Banners & Highlights (Enforced dynamically based on first banner) */
        .banner-bg, .phase-active { background-color: ${firstBannerColor} !important; }
        .banner-text, .button-link { color: #FFFFFF !important; }

        /* Tables & Grids - Enforced #EEEEEE */
        .content-table, .content-table td, .content-table th { border-color: #EEEEEE !important; }
        .table-header-cell { background-color: #2F2F2F !important; }
        .table-cell { background-color: #2C2C2C !important; }
        
        /* Modules with secondary backgrounds - Maintain accent borders and semantic values */
        .button-section, .kpi-card { 
            background-color: #2C2C2C !important;
        }
        /* Button module has no border in dark mode */
        .button-section { border: none !important; }
        
        .kpi-card { 
            border-left: 1px solid #3d3d3d !important; 
            border-right: 1px solid #3d3d3d !important; 
            border-bottom: 1px solid #3d3d3d !important; 
        }
        
        /* Phase Grid - Enforced #E0E0E0 */
        .phase-table { border-color: #E0E0E0 !important; }
        .phase-cell:not(.phase-active) { background-color: #2F2F2F !important; color: #777 !important; border-color: #E0E0E0 !important; }
        
        /* KPI values should maintain their custom semantic colors */
        .kpi-value { opacity: 1 !important; }
        
        /* Prevent inversion of images */
        img { opacity: 0.9; }
    ` : '';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; transition: background-color 0.3s ease; scroll-behavior: smooth; }
        .cta-button:hover { background-color: #135B8B !important; }
        ${darkSimulationStyles}
    </style>
</head>
<body style="background-color: #ffffff; padding: 20px 0;">
    <div class="main-container" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 40px auto 0 auto; background-color: #ffffff; color: #333; padding: 20px 20px 60px 20px; border-radius: 12px; box-shadow: 0 4px 30px rgba(0,0,0,0.06); transition: all 0.3s ease;">
${insideHtml}
    </div>
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 40px auto 0 auto; color: #333;">
${outsideHtml}
    </div>
</body>
</html>`;
};