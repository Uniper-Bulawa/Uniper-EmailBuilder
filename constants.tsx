import { ModuleType, ModuleData } from './types';

export const DEFAULT_MODULES: ModuleData[] = [
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