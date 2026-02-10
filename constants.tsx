import { ModuleType, ModuleData } from './types';

export const DEFAULT_MODULES: ModuleData[] = [
  {
    id: 'm1',
    type: ModuleType.HEADER_LOGO,
    section: 'inside',
    properties: {
      imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_CO.png',
      align: 'right',
      altText: 'report_logo_CO.png'
    }
  },
  {
    id: 'm2',
    type: ModuleType.BANNER,
    section: 'inside',
    properties: {
      title: 'USE CASE UPDATE',
      color: '#0078DC'
    }
  },
  {
    id: 'm-dp',
    type: ModuleType.DELIVERY_PHASE,
    section: 'inside',
    properties: {
      selectedPhase: 'Develop'
    }
  },
  {
    id: 'm3',
    type: ModuleType.TEXT,
    section: 'inside',
    properties: {
      content: "Dear @{replace('!!!','Recipient')},\n\nWelcome to the Email Builder. This professional tool enables you to create brand-aligned HTML snippets for customized automated emails. Simply assemble your content using the modular system and export the clean code for Power Automate.",
      align: 'left'
    }
  },
  {
    id: 'm-shortcuts',
    type: ModuleType.CHECKLIST,
    section: 'inside',
    properties: {
      checklistItems: [
        { text: '<b>Ctrl + B</b>: Bold', icon: 'blue' },
        { text: '<b>Ctrl + I</b>: Italic', icon: 'blue' },
        { text: '<b>Ctrl + U</b>: Underline', icon: 'blue' },
        { text: '<b>Ctrl + S</b>: Strike through', icon: 'blue' },
        { text: '<b>Ctrl + K</b>: Insert Link tag', icon: 'blue' },
        { text: '<b>Ctrl + E</b>: Insert @{replace(\'!!!\',\'REFERENCE\')}', icon: 'blue' }
      ]
    }
  },
  {
    id: 'm-kpi',
    type: ModuleType.KPI_CARDS,
    section: 'inside',
    properties: {
      metrics: [
        { value: '1.2M', label: 'Savings', color: '#00944A' },
        { value: '+15%', label: 'Efficiency', color: '#ED8C1C' },
        { value: 'Active', label: 'Status', color: '#0078DC' }
      ]
    }
  },
  {
    id: 'm4',
    type: ModuleType.IMAGE,
    section: 'inside',
    properties: {
      imageUrl: 'cid:report.png',
      altText: 'report.png',
      align: 'center'
    }
  },
  {
    id: 'm5',
    type: ModuleType.TABLE,
    section: 'inside',
    properties: {
      hasColumnHeaders: false,
      hasRowHeaders: true,
      gridRows: [
        { cells: ['Team Name', 'DOT'] },
        { cells: ['Dept Code', 'P_OI1-A5'] },
        { cells: ['Description:', 'Detailed status report attached.'] }
      ]
    }
  },
  {
    id: 'm6',
    type: ModuleType.BUTTON,
    section: 'inside',
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
    section: 'inside',
    properties: {
      title: '',
      color: '#0078DC'
    }
  },
  {
    id: 'm-legal',
    type: ModuleType.LEGAL,
    section: 'outside',
    properties: {
      chairman: 'Michael Lewis',
      board: 'Dr. Carsten Poppinga (Vorsitzender/Chairman), Dr. Thomas Linßen'
    }
  },
  {
    id: 'm8',
    type: ModuleType.SIGNATURE,
    section: 'outside',
    properties: {
      content: '<br><b>This is an automatically generated email.</b>',
      imageUrl: 'https://raw.githubusercontent.com/Uniper-Bulawa/dot-email-assets/main/report_logo_DOT.png',
      hasStarRating: true
    }
  }
];