import { App } from 'antd';
import { useCreateResource } from '@hooks/react-query/useAuthz';
import { CreateResourcePayload } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorCreateResource, validatorResponseCreateResource } from '@validations/schemas/authz';
import ResourceForm, { DEFAULT_VALUES } from '../components/ResourceForm';

type ResourceFormData = Omit<CreateResourcePayload, '_id'>;

const CreateResource = () => {
  const { notification } = App.useApp();
  const { mutate: executeCreateResource } = useCreateResource();

  const handleOnSubmit = (formData: ResourceFormData) => {
    executeCreateResource(formData, {
      onSuccess: async response => {
        try {
          await validatorResponseCreateResource.parseAsync(response.data);
          notification.success({
            message: 'Success',
            description: response.data.message,
          });
        } catch (error) {
          notification.error({
            message: 'Error',
            description: getError(error),
          });
        }
      },
      onError: error => {
        notification.error({
          message: 'Error',
          description: getError(error),
        });
      },
    });
  };

  return (
    <ResourceForm
      initialValues={DEFAULT_VALUES}
      schema={validatorCreateResource}
      onSubmit={handleOnSubmit}
      submitButtonText="Create"
      modalTitle="Create resource"
      modalContent="Are you sure to create this resource?"
    />
  );
};

export default CreateResource;