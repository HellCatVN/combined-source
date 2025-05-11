import type { Rule } from "antd/es/form";
import Form, { FormInstance, FormListFieldData } from "antd/lib/form";
import { useCallback, useMemo } from "react";
import { z, ZodIssue, ZodError } from "zod";

type UseFormProps<T extends object> = {
  form?: FormInstance<T>;
  schema: z.ZodSchema<T> | null;
  onSubmit: (data: T | null, error: FormListFieldData | null) => void;
};

type UseFormTypes<T> = {
  formField: {
    form: FormInstance<T>;
    onFinish: (values: T) => void;
    onChange: React.FormEventHandler<HTMLFormElement>;
  };
  inputField: {
    rules: Rule[];
  };
};

const mapErrorFromZodIssue = (issues: ZodIssue[]) =>
  issues.reduce(
    (
      obj: {
        [key: string]: string[];
      },
      issue: ZodIssue
    ) => {
      const fieldName = issue.path.join(".");
      if (!obj[fieldName]) {
        obj[fieldName] = [issue.message];
      } else {
        obj[fieldName].push(issue.message);
      }
      return obj;
    },
    {}
  );

const zodValidator = <T extends z.AnyZodObject>(
  schema: z.ZodSchema<T>,
  getFieldsValue: () => T
) => ({
  async validator({ field }: Record<string, string>) {
    try {
      await schema.parseAsync(getFieldsValue());
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMap = mapErrorFromZodIssue(error.issues);

        if (errorMap[field]?.length) {
          throw new Error(errorMap[field].pop());
        }
      }
    }
  },
});

export default function useForm<T extends Record<string, any>>({
  form: propsForm,
  schema,
  onSubmit,
}: UseFormProps<T>): UseFormTypes<T> {
  const [form] = Form.useForm<T>(propsForm);
  const { getFieldsValue } = form;

  const rules = useMemo(
    () => (schema ? zodValidator(schema, getFieldsValue) : {}),
    [getFieldsValue, schema]
  );

  const onChange = useCallback(
    (e: any) => {
      const fieldName = e.target.id.split("_");

      const errors =
        form
          .getFieldsError()
          .find((err) => fieldName.every((n: string) => err.name.includes(n)))
          ?.errors ?? [];

      if (errors.length) form.setFields([{ name: fieldName, errors: [] }]);
    },
    [form]
  );

  const onFinish = useCallback(
    (data: T) => {
      if (!schema) return onSubmit(data, null);
      if (schema) {
        schema
          .parseAsync(data)
          .then(() => onSubmit(data, null))
          .catch((e) => {
            const errorMap = mapErrorFromZodIssue(e.issues);

            const fields = Object.keys(errorMap).map((field) => ({
              name: field.split(".") as any,
              errors: errorMap[field],
            }));

            form.setFields(fields);
            onSubmit(null, e);
          });
      }
    },
    [onSubmit, schema, form]
  );

  return {
    formField: { form, onFinish, onChange },
    inputField: { rules: [rules] },
  };
}
