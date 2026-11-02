import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

type FormSchema = Parameters<typeof zodResolver>[0];

interface FORM_PROPS {
  children: ReactNode | ((methods: UseFormReturn<FieldValues>) => ReactNode);
  defaultValues?: DefaultValues<FieldValues>;
  onSubmit: SubmitHandler<FieldValues>;
  schema: FormSchema;
}

const Form = ({ children, defaultValues, onSubmit, schema }: FORM_PROPS) => {
  const methods = useForm<FieldValues>({
    resolver: zodResolver(schema) as Resolver<FieldValues>,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
};

export default Form;
