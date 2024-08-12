type Path = {
  label: string;
  url: string;
  children?: Path[];
};

export { Link } from 'react-router-dom';

export const menu: Path = {
  label: 'ERP',
  url: '/',
  children: [
    {
      label: 'Batch',
      url: 'batch/',
    },
    {
      label: 'Status',
      url: 'status/1/',
    },
  ],
};

export default {};
