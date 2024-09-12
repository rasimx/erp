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
  AssemblingSourceDto,
  CreateProductBatchesByAssemblingDto,
} from '../../gql-types/graphql';
import { RecursivePartial } from '../../utils';

export interface SelectedProductBatch extends ProductBatch {
  selectedCount?: number | undefined;
}

export interface FormState
  extends RecursivePartial<CreateProductBatchesByAssemblingDto> {
  productSet?: Product | undefined;
  sources?: SelectedProductBatch[] | undefined;
}
export const FormContext = createContext<{
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
}>({ state: {}, setState: () => {} });

export const useFormState = () => {
  const { state, setState } = useContext(FormContext);
  console.log(state);

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

  const [newBathes, setNewBathes] = useState<ResultProductBatch[]>([]);

  useEffect(() => {
    if (state.sources && state.productSet !== null) {
      try {
        // @ts-ignore
        const a = assembleProduct({
          ...state,
          productBatches: state.sources,
        });
        setNewBathes(a);
      } catch (e) {
        setNewBathes([]);
      }
    }
  }, [state]);

  return { state, setState, updateSelectedSetSource, newBathes };
};

export type FormValues = RecursivePartial<CreateProductBatchesByAssemblingDto>;
export type FormProps = FormikProps<FormValues>;

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (
    values: CreateProductBatchesByAssemblingDto,
    formikBag: FormikBag<Props, CreateProductBatchesByAssemblingDto>,
  ) => Promise<unknown>;
}

export const AssemblingSourceValidationSchema: ObjectSchema<AssemblingSourceDto> =
  object().shape({
    id: number().required(),
    selectedCount: number().required(),
  });

export const createProductBatchesByAssemblingValidationSchema =
  (): ObjectSchema<CreateProductBatchesByAssemblingDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().nullable(),
      productSetId: number().required(),
      fullCount: number().required(),
      sources: array(AssemblingSourceValidationSchema.required()).required(),
    });
  };
