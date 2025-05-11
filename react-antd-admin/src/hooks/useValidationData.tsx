import { useEffect, useState } from 'react';
import { ZodObject } from 'zod';

const useValidationData = (
  data: any,
  validator: ZodObject<any>,
  nextError?: (error: unknown) => void
) => {
  const [validating, setValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleValidateData = async () => {
    setValidating(true);
    try {
      await validator.parseAsync(data);
      setIsValid(true);
    } catch (error) {
      nextError?.(error);
      setIsValid(false);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (!data) return;
    handleValidateData();
    // eslint-disable-next-line
  }, [data]);

  return {
    isValid,
    validating,
  };
};

export default useValidationData;
