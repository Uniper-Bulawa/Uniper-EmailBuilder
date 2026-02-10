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
        case 'blue': return '<span style="color: #0078DC;">■</span>';
        case 'black': return '■';
        default: return '•';
    }
};

export const renderModuleToHtml = (module: ModuleData, prevModuleType?: ModuleType, nextModuleType?: ModuleType): string => {
    const { type, properties, id } = module;
    let content = '';

    switch (type) {
        case ModuleType.HEADER_LOGO:
            content = `<div style="text-align: ${properties.align || 'right'}; margin-bottom: 20px; margin-top: 40px;">
    <img src="${properties.imageUrl}" width="auto" alt="${properties.altText || getFileName(properties.imageUrl)}" style="display: inline-block; width: auto; max-width: 640px; height: auto;">
</div>`;
            break;

        case ModuleType.BANNER:
            const isFollowedByDP = nextModuleType === ModuleType.DELIVERY_PHASE;
            const bannerRadius = isFollowedByDP ? '12px 12px 0 0' : '12px';
            content = `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:50px;v-text-anchor:middle;width:640px;" arcsize="24%" stroke="f" fillcolor="${properties.color}">
    <w:anchorlock/>
    <center>
<![endif]-->
<div style="margin-top: 25px; text-align: center; padding: 12px; background-color: ${properties.color}; border-radius: ${bannerRadius};">
    <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">${properties.title}</h2>
</div>
<!--[if mso]>
    </center>
</v:roundrect>
<![endif]-->`;
            break;

        case ModuleType.TEXT:
            const textAlign = properties.align || 'left';
            content = properties.content?.split('\n').map(p => 
                p.trim() ? `<p style="margin-bottom: 15px; margin-top: 25px; font-size: 15px; text-align: ${textAlign};">${p}</p>` : ''
            ).filter(Boolean).join('\n') || '';
            break;

        case ModuleType.IMAGE:
            const w = formatDimension(properties.imageWidth);
            const h = formatDimension(properties.imageHeight);
            const imgAlign = properties.align || 'center';
            const margin = imgAlign === 'center' ? '0 auto' : (imgAlign === 'right' ? '0 0 0 auto' : '0');
            // Table width: 100% provides context for percentage resizing
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        <tr>
            <td align="${imgAlign}" style="padding: 0; text-align: ${imgAlign};">
                <img src="${properties.imageUrl}" alt="${properties.altText || getFileName(properties.imageUrl)}" style="display: block; width: ${w}; max-width: 100%; height: ${h}; margin: ${margin}; border-radius: 8px; border: 0; -ms-interpolation-mode: bicubic;">
            </td>
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.TABLE:
            const rows = properties.gridRows || [];
            const hasColumnHeaders = !!properties.hasColumnHeaders;
            const hasRowHeaders = !!properties.hasRowHeaders;

            const rowsHtml = rows.map((row, rIdx) => {
                const isHeaderRow = hasColumnHeaders && rIdx === 0;
                const cellsHtml = row.cells.map((cell, cIdx) => {
                    const isHeaderCell = (hasRowHeaders && cIdx === 0) || isHeaderRow;
                    const tag = isHeaderCell ? 'th' : 'td';
                    
                    let cellStyle = 'padding: 12px; border: 1px solid #D7E5FC; text-align: left;';
                    if (isHeaderRow) {
                        cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold;';
                    } else if (hasRowHeaders && cIdx === 0) {
                        cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold; width: 30%;';
                    } else {
                        cellStyle += ' background-color: #f9f9f9;';
                    }

                    return `\n            <${tag} style="${cellStyle}">${cell}</${tag}>`;
                }).join('');
                return `\n        <tr>${cellsHtml}\n        </tr>`;
            }).join('');

            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto; border-collapse: collapse; font-size: 14px; border: 1px solid #D7E5FC; border-radius: 8px; overflow: hidden;">
    <tbody>${rowsHtml}
    </tbody>
</table>`;
            break;

        case ModuleType.BUTTON:
            content = `<div style="margin-top: 25px; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <p style="margin: 0 0 15px 0; font-size: 13px; color: #666;">${properties.content}</p>
    <a href="${properties.url}" style="background-color: ${properties.color || '#0078DC'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; transition: all 0.3s ease;">${properties.buttonText}</a>
</div>`;
            break;

        case ModuleType.SIGNATURE:
            const ratingBaseUrl = 'https://apps.powerapps.com/play/e/default-db8e2f82-8a37-4c09-b7de-ed06547b5a20/a/8d6aa8c2-432f-47d4-a201-803bfee1702e?tenantId=db8e2f82-8a37-4c09-b7de-ed06547b5a20&hint=221a9b25-893f-4de1-9ff0-d792206ec37c&sourcetime=1706559731201&source=portal&HideNavBar=true&Rating=';
            
            const ratingHtml = properties.hasStarRating ? `\n<div style="text-align: center; margin-top: 15px; margin-bottom: 40px;">
    <p style="font-size: 10px; font-weight: bold; color: #C6C6C6; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px;">RATE YOUR EXPERIENCE</p>
    <div style="font-size: 28px; line-height: 1;">
        <a href="${ratingBaseUrl}1" title="1/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}2" title="2/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}3" title="3/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}4" title="4/5" style="text-decoration: none; color: #C6C6C6;">★</a>
        <a href="${ratingBaseUrl}5" title="5/5" style="text-decoration: none; color: #C6C6C6;">★</a>
    </div>
</div>` : '';

            content = `<p style="font-size: 11px; color: #C6C6C6; text-align: center; margin-top: 20px;">
    ${properties.content}
</p>
<div style="text-align: center; margin-top: 40px; ${!properties.hasStarRating ? 'margin-bottom: 40px;' : ''}">
    <img src="${properties.imageUrl}" alt="Footer Logo" style="display: inline-block; width: auto; max-width: 640px; height: 40px;">
</div>${ratingHtml}`;
            break;

        case ModuleType.DELIVERY_PHASE:
            const phases = ['L3 Prio', 'Assess', 'Design', 'Plan', 'Develop', 'Document', 'Train', 'Handover', 'Live'];
            const phaseCells = phases.map(p => {
                const isActive = p === properties.selectedPhase;
                const bg = isActive ? '#0078DC' : '#f2f2f2';
                const color = isActive ? '#ffffff' : '#999999';
                const weight = isActive ? 'bold' : 'normal';
                return `<td style="padding: 10px 4px; background-color: ${bg}; color: ${color}; font-size: 10px; text-align: center; font-weight: ${weight}; border-right: 1px solid #ffffff;">${p}</td>`;
            }).join('');
            const isFollowedBanner = prevModuleType === ModuleType.BANNER;
            const dpRadius = isFollowedBanner ? '0 0 12px 12px' : '12px';
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 0 auto 25px auto; border-collapse: collapse; overflow: hidden; border-radius: ${dpRadius};">
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
                <div style="background-color: #ffffff; border: 1px solid #eeeeee; border-top: 4px solid ${m.color}; padding: 15px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 24px; font-weight: bold; color: ${m.color}; margin-bottom: 4px;">${m.value}</div>
                    <div style="font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">${m.label}</div>
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
            const isTwoColRight = properties.imagePosition === 'right';
            const twoColTextContent = properties.content?.split('\n').map(p => 
                p.trim() ? `<p style="margin: 0 0 10px 0;">${p}</p>` : ''
            ).filter(Boolean).join('') || '';

            const twoColImgPart = `<td style="width: 45%; padding: 10px; vertical-align: middle;">
    <img src="${properties.imageUrl}" width="100%" style="display: block; width: 100%; height: auto; border-radius: 6px;">
</td>`;
            const twoColTextPart = `<td style="width: 55%; padding: 10px; vertical-align: middle;">
    <div style="font-size: 15px; color: #333333; line-height: 1.5;">${twoColTextContent}</div>
</td>`;
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        <tr>
            ${isTwoColRight ? twoColTextPart + twoColImgPart : twoColImgPart + twoColTextPart}
        </tr>
    </tbody>
</table>`;
            break;

        case ModuleType.CHECKLIST:
            const checklistHtml = (properties.checklistItems || []).map(item => `
        <tr>
            <td style="padding: 4px 6px 4px 20px; vertical-align: middle; font-size: 18px; line-height: 1; width: 24px; text-align: center;">
                ${getChecklistIcon(item.icon)}
            </td>
            <td style="padding: 4px 0; vertical-align: middle; font-size: 15px; color: #333333;">
                ${item.text}
            </td>
        </tr>`).join('');
            content = `<table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto;">
    <tbody>
        ${checklistHtml}
    </tbody>
</table>`;
            break;

        default:
            content = '';
    }

    return `<!-- START_ID:${id} -->\n\n${content.trim()}\n\n<!-- END_ID:${id} -->`;
};

export const generateFullHtml = (modules: ModuleData[]): string => {
    const insideModules = modules.filter(m => m.section === 'inside');
    const outsideModules = modules.filter(m => m.section === 'outside');

    const renderList = (list: ModuleData[]) => list.map((m, idx) => {
        const prevModuleType = list[idx - 1]?.type;
        const nextModuleType = list[idx + 1]?.type;
        return renderModuleToHtml(m, prevModuleType, nextModuleType);
    }).join('\n');

    const insideHtml = renderList(insideModules);
    const outsideHtml = renderList(outsideModules);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; }
        .cta-button:hover { background-color: #135B8B !important; }
    </style>
</head>
<body style="background-color: #f4f4f4; padding: 20px 0;">
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: auto; background-color: #ffffff; color: #333; padding: 20px 20px 40px 20px; border-radius: 8px; box-shadow: 0 0 60px -15px rgba(0,0,0,0.3);">
${insideHtml}
    </div>
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 40px auto 0 auto; color: #333;">
${outsideHtml}
    </div>
</body>
</html>`;
};