export const fields = {
  name: {
    type: 'string',
  },
  category: {
    type: 'selectWithTranslation',
    options: [
      { value: 'material', label: 'Material' },
      { value: 'salary', label: 'Salary' },
      { value: 'utility', label: 'Utility' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'other', label: 'Other' },
    ],
  },
  amount: {
    type: 'number',
  },
  date: {
    type: 'date',
  },
  description: {
    type: 'textarea',
  },
};
