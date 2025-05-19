import { App } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetResource, useUpdateResource } from '@hooks/react-query/useAuthz';
import { CreateResourcePayload, UpdateResourcePayload } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorUpdateResource, validatorResponseUpdateResource } from '@validations/schemas/authz';
import ResourceForm from '../components/ResourceForm';

type ResourceFormData = Omit<UpdateResourcePayload, '_id'>;

const ResourceEdit = () => {
  const { id } = useParams();
  const { notification } = App.useApp();
  const { data: response } = useGetResource(id);
  const { mutate: executeUpdateResource } = useUpdateResource();
  const [initialValues, setInitialValues] = useState<ResourceFormData>();

  const handleOnSubmit = (formData: ResourceFormData) => {
    if (!id)
      return notification.error({
        message: 'Error!',
        description: 'Resource ID invalid!',
      });

    // Add _id to the payload for update
    const updatePayload: UpdateResourcePayload = {
      ...formData,
      _id: id
    };

    executeUpdateResource(
      {
        id,
        payload: updatePayload,
      },
      {
        onSuccess: async response => {
          try {
            await validatorResponseUpdateResource.parseAsync(response.data);
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
      }
    );
  };

  useEffect(() => {
    if (response?.data.data) {
      // Remove _id from the initial values since form doesn't need it
      const { _id, ...formData } = response.data.data;
      setInitialValues(formData);
    }
  }, [response?.data.data]);

  if (!response?.data.data) {
    return null;
  }

  return (
    <ResourceForm
      initialValues={initialValues}
      schema={validatorUpdateResource}
      onSubmit={handleOnSubmit}
      submitButtonText="Save changes"
      modalTitle="Edit resource"
      modalContent={`Are you sure to edit resource ${response.data.data.name}?`}
      showReset
      onReset={() => {
        const { _id, ...formData } = response.data.data;
        setInitialValues(formData);
      }}
    />
  );
};

export default ResourceEdit;