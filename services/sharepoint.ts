import { Template } from '../types';

// Full URLs provided by the user including the SAS signature (sig) parameters.
const FLOW_GET_URL = 'https://defaultdb8e2f828a374c09b7deed06547b5a.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/400a8b78fc5341e09da3332bec53ffca/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pus_xcdjsBpV03TYPWZT4lueo41OqtLpQSt7A80RFUY';
const FLOW_POST_URL = 'https://defaultdb8e2f828a374c09b7deed06547b5a.20.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4ff201ea47f2441cb66c365af93eb216/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SEbIoceYPCjXeo4IHkkw5pteyEgSiY-2ax0eg3MPqB0';

const checkUrlSignature = (url: string) => {
  if (!url.includes('sig=')) {
    console.warn('⚠️ URL Warning: This URL is missing a signature (sig=).');
    return false;
  }
  return true;
};

export const fetchTemplatesFromFlow = async (): Promise<Template[]> => {
  console.log('📡 SharePoint: Fetching templates...');
  checkUrlSignature(FLOW_GET_URL);
  
  try {
    const response = await fetch(FLOW_GET_URL, { 
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ SharePoint: Server error', response.status, errorBody);
      throw new Error(errorBody || `Server returned ${response.status}`);
    }
    
    const rawData = await response.json();
    const items = Array.isArray(rawData) ? rawData : (rawData.value || []);
    
    return items.map((item: any) => ({
      id: `sp-${item.ID || item.id}`,
      spId: item.ID || item.id,
      name: item.Title || item.name || 'Untitled Template',
      modules: JSON.parse(item.Content || item.content || '[]'),
      lastModified: new Date(item.Modified || item.modified || Date.now()).getTime()
    }));
  } catch (error: any) {
    console.error('❌ SharePoint Fetch Error:', error.message);
    throw error;
  }
};

export const saveTemplateToFlow = async (template: Template): Promise<boolean> => {
  console.log('📤 SharePoint: Saving template...', template.name);
  checkUrlSignature(FLOW_POST_URL);

  try {
    const payload = {
      name: template.name,
      content: JSON.stringify(template.modules),
      spId: template.spId ? String(template.spId) : ""
    };

    const response = await fetch(FLOW_POST_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SharePoint: Save failed', response.status, errorText);
      throw new Error(errorText || `Status ${response.status}`);
    }
    
    console.log('✅ SharePoint: Save successful');
    return true;
  } catch (error: any) {
    console.error('❌ SharePoint Save error:', error.message);
    throw error;
  }
};