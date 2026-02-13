import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Inventory() {
  const translate = useLanguage();
  const entity = 'product';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name', 'reference'];

  const Labels = {
    PANEL_TITLE: translate('Inventory'),
    DATATABLE_TITLE: translate('Inventory List'),
    ADD_NEW_ENTITY: translate('Add New Product'),
    ENTITY_NAME: translate('product'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
