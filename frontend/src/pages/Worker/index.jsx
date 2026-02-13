import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Worker() {
  const translate = useLanguage();
  const entity = 'worker';
  const searchConfig = {
    displayLabels: ['name', 'surname'],
    searchFields: 'name,surname',
  };
  const deleteModalLabels = ['name', 'surname'];

  const Labels = {
    PANEL_TITLE: translate('Workers'),
    DATATABLE_TITLE: translate('Worker List'),
    ADD_NEW_ENTITY: translate('Add New Worker'),
    ENTITY_NAME: translate('worker'),
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
