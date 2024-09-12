import { FormikProps } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  assembleProduct,
  type ResultProductBatch,
} from 'server/src/common/assembleProduct';
import { array, number, object, ObjectSchema } from 'yup';

import { Product } from '../../api/product/product.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import {
  CreateProductBatchesFromSourcesDto,
  SourceProductBatchDto,
} from '../../gql-types/graphql';
import { RecursivePartial } from '../../utils';

export interface FormState
  extends RecursivePartial<CreateProductBatchesFromSourcesDto> {
  product?: Product | undefined;
  sources?: SelectedProductBatch[] | undefined;
}
export const FormContext = createContext<{
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
}>({ state: {}, setState: () => {} });

export const useFormState = () => {
  const { state, setState } = useContext(FormContext);

  const updateSelectedSetSource = useCallback(
    (id: number, batch: SelectedProductBatch | undefined) => {
      setState(state => {
        const sources = state?.sources ? [...state.sources] : [];
        const index = sources.findIndex(item => item.id === id);

        if (batch) {
          if (index > -1) {
            sources[index] = batch;
          } else {
            sources.push(batch);
          }
        } else if (index > -1) {
          sources.splice(index, 1);
        }

        return { ...state, sources };
      });
    },
    [state, setState],
  );

  return { state, setState, updateSelectedSetSource };
};

export interface SelectedProductBatch extends ProductBatch {
  selectedCount: number | undefined;
}

export type FormValues = Partial<
  RecursivePartial<CreateProductBatchesFromSourcesDto>
>;
export type FormProps = FormikProps<FormValues>;

export interface Props {
  initialValues: Partial<FormValues>;
  closeModal: () => void;
  onSubmit: (
    values: CreateProductBatchesFromSourcesDto,
    formikBag: FormikBag<Props, CreateProductBatchesFromSourcesDto>,
  ) => Promise<unknown>;
}

export const SourceProductBatchValidationSchema: ObjectSchema<SourceProductBatchDto> =
  object().shape({
    id: number().required(),
    selectedCount: number().required(),
  });

export const createProductBatchesByAssemblingValidationSchema =
  (): ObjectSchema<CreateProductBatchesFromSourcesDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().nullable(),
      productId: number().required(),
      fullCount: number().required(),
      sources: array(SourceProductBatchValidationSchema.required()).required(),
    });
  };
