import { ModuleData, ModuleType } from './types';

const getFileName = (url?: string) => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
};

export const renderModuleToHtml = (module: ModuleData): string => {
  const { type, properties } = module;

  switch (type) {
    case ModuleType.HEADER_LOGO:
      return `
        <div style="text-align: ${properties.align || 'right'}; margin-bottom: 20px; margin-top: 40px;">
            <img src="${properties.imageUrl}" width="auto" alt="${properties.altText || getFileName(properties.imageUrl)}" style="display: inline-block; width: auto; max-width: 640px; height: auto;">
        </div>`;

    case ModuleType.BANNER:
      return `
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:50px;v-text-anchor:middle;width:640px;" arcsize="24%" stroke="f" fillcolor="${properties.color}">
            <w:anchorlock/>
            <center>
        <![endif]-->
        <div style="margin-top: 25px; text-align: center; padding: 12px; 
                    background-color: ${properties.color}; 
                    border-radius: 12px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">${properties.title}</h2>
        </div>
        <!--[if mso]>
            </center>
        </v:roundrect>
        <![endif]-->`;

    case ModuleType.TEXT:
      return properties.content?.split('\n').map(p => 
        p.trim() ? `<p style="margin-bottom: 15px; margin-top: 25px; font-size: 15px;">${p}</p>` : ''
      ).join('') || '';

    case ModuleType.IMAGE:
      return `
        <table cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; margin: auto;">
            <tbody><tr>
                <td style="padding: 0;">
                    <img src="${properties.imageUrl}" width="640" alt="${properties.altText || getFileName(properties.imageUrl)}" style="display: block; width: 100%; max-width: 640px; height: auto; border: 1px solid #dddddd; border-radius: 4px; -ms-interpolation-mode: bicubic;">
                </td>
            </tr>
        </tbody></table>`;

    case ModuleType.TABLE:
      const rows = properties.gridRows || [];
      const hasColumnHeaders = !!properties.hasColumnHeaders;
      const hasRowHeaders = !!properties.hasRowHeaders;

      const rowsHtml = rows.map((row, rIdx) => {
        const isHeaderRow = hasColumnHeaders && rIdx === 0;
        const cellsHtml = row.cells.map((cell, cIdx) => {
          const isHeaderCell = (hasRowHeaders && cIdx === 0) || isHeaderRow;
          const tag = isHeaderCell ? 'th' : 'td';
          
          let cellStyle = 'padding: 12px; border: 1px solid #dddddd; text-align: left;';
          if (isHeaderRow) {
            cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold;';
          } else if (hasRowHeaders && cIdx === 0) {
            cellStyle += ' background-color: #f2f2f2; color: #0078DC; font-weight: bold; width: 30%;';
          } else {
            cellStyle += ' background-color: #f9f9f9;';
          }

          return `<${tag} style="${cellStyle}">${cell}</${tag}>`;
        }).join('');
        return `<tr>${cellsHtml}</tr>`;
      }).join('');

      return `
        <table cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; margin: 25px auto; border-collapse: collapse; font-size: 14px; border: 1px solid #dddddd; border-radius: 8px; overflow: hidden;">
            <tbody>${rowsHtml}</tbody>
        </table>`;

    case ModuleType.BUTTON:
      return `
        <div style="margin-top: 25px; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #666;">${properties.content}</p>
            <a href="${properties.url}" style="background-color: ${properties.color || '#0078DC'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; transition: all 0.3s ease;">${properties.buttonText}</a>
        </div>`;

    case ModuleType.SIGNATURE:
      const ratingBaseUrl = 'https://apps.powerapps.com/play/e/default-db8e2f82-8a37-4c09-b7de-ed06547b5a20/a/8d6aa8c2-432f-47d4-a201-803bfee1702e?tenantId=db8e2f82-8a37-4c09-b7de-ed06547b5a20&hint=221a9b25-893f-4de1-9ff0-d792206ec37c&sourcetime=1706559731201&source=portal&HideNavBar=true&Rating=';
      
      const ratingHtml = properties.hasStarRating ? `
        <div style="text-align: center; margin-top: 15px; margin-bottom: 40px;">
          <p style="font-size: 10px; font-weight: bold; color: #C6C6C6; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px;">RATE YOUR EXPERIENCE</p>
          <div style="font-size: 28px; line-height: 1;">
            <a href="${ratingBaseUrl}1" title="1/5" style="text-decoration: none; color: #C6C6C6;">★</a>
            <a href="${ratingBaseUrl}2" title="2/5" style="text-decoration: none; color: #C6C6C6;">★</a>
            <a href="${ratingBaseUrl}3" title="3/5" style="text-decoration: none; color: #C6C6C6;">★</a>
            <a href="${ratingBaseUrl}4" title="4/5" style="text-decoration: none; color: #C6C6C6;">★</a>
            <a href="${ratingBaseUrl}5" title="5/5" style="text-decoration: none; color: #C6C6C6;">★</a>
          </div>
        </div>
      ` : '';

      return `
        <p style="font-size: 11px; color: #C6C6C6; text-align: center; margin-top: 20px;">
            ${properties.content}
        </p>
        <div style="text-align: center; margin-top: 40px; ${!properties.hasStarRating ? 'margin-bottom: 40px;' : ''}">
            <img src="${properties.imageUrl}" alt="Footer Logo" style="display: inline-block; width: auto; max-width: 640px; height: 40px;">
        </div>
        ${ratingHtml}`;

    default:
      return '';
  }
};

export const generateFullHtml = (modules: ModuleData[]): string => {
  const content = modules.map(m => renderModuleToHtml(m)).join('\n');
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; padding: 0; }
  .cta-button:hover { background-color: #135B8B !important; }
</style>
</head>
<body style="background-color: #f4f4f4; padding: 20px 0;">
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: auto; background-color: #ffffff; color: #333; padding: 20px; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        ${content}
    </div>
</body>
</html>`;
};