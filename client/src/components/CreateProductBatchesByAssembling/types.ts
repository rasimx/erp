import { FormikProps } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Nullable } from 'primereact/ts-helpers';
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

import { Product } from '../../api/product/product.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { CreateProductBatchesFromSourcesListDto } from '../../gql-types/graphql';
import { DeepNullable } from '../../utils';

export interface SelectedProductBatch extends ProductBatch {
  selectedCount?: number | null;
}

export interface FormState {
  product?: Nullable<Product>;
  count?: Nullable<number>;
  sources?: SelectedProductBatch[];
}

export const FormContext = createContext<{
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
}>({ state: {}, setState: () => {} });

export const useFormState = () => {
  const { state, setState } = useContext(FormContext);

  const updateSelectedSetSource = useCallback(
    (id: number, batch: SelectedProductBatch | null) => {
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
    try {
      if (
        state.count &&
        state.product &&
        state.sources?.length &&
        !state.sources.filter(item => !item.selectedCount).length
      ) {
        setNewBathes(
          assembleProduct({
            product: state.product,
            count: state.count,
            // @ts-expect-error
            sources: state.sources,
          }),
        );
      }
    } catch (e) {
      setNewBathes([]);
    }
  }, [state]);

  return { state, setState, updateSelectedSetSource, newBathes };
};

export type FormValues = DeepNullable<CreateProductBatchesFromSourcesListDto>;
export type FormProps = FormikProps<FormValues>;

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (
    values: CreateProductBatchesFromSourcesListDto,
    formikBag: FormikBag<Props, CreateProductBatchesFromSourcesListDto>,
  ) => Promise<unknown>;
}
