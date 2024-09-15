type Path = {
  label: string;
  url: string;
  children?: Path[];
};

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
