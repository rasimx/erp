import NiceModal from '@ebay/nice-modal-react';
import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  InputLabel,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Compact } from '@uiw/react-color';
import { format, parse } from 'date-fns';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import React, { type FC, useEffect, useState } from 'react';
import { number, object, ObjectSchema, string } from 'yup';

import { useProductList } from '../../api/product/product.hooks';
import {
  CreateProductBatchDto,
  ProductBatchFragment,
  ProductFragment,
} from '../../gql-types/graphql';
import { fromRouble, toRouble } from '../../utils';
import withModal from '../withModal';
import SelectProductBatch from './SelectProductBatch';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export interface FormValues extends Omit<CreateProductBatchDto, 'productId'> {
  product: ProductFragment;
}

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
}

export const createProductBatchValidationSchema =
  (): ObjectSchema<CreateProductBatchDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().nullable(),
      parentId: number(),
      count: number().required(),
      name: string().required(),
      productId: number().required(),
      costPricePerUnit: number().required(),
      date: string().required(),
      color: string().required(),
    });
  };

const Form: FC<Props & FormikProps<FormValues>> = ({
  initialValues,
  setFieldValue,
  handleSubmit,
  values,
  handleChange,
  handleBlur,
  touched,
  errors,
}) => {
  const { items: productList } = useProductList();

  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const [parent, setParent] = useState<ProductBatchFragment | null>(null);
  const [product, setProduct] = useState<ProductFragment | null>(null);

  useEffect(() => {
    if (parent) {
      setFieldValue('parentId', parent.id);
      setFieldValue('date', parent.date);
      setFieldValue('name', parent.name);
      setFieldValue('costPricePerUnit', toRouble(parent.costPricePerUnit));
      setFieldValue('color', parent.color);
    } else {
      setFieldValue('parentId', undefined);
      setFieldValue('date', values.date ?? undefined);
      setFieldValue('name', values.name ?? undefined);
      setFieldValue('costPricePerUnit', values.costPricePerUnit ?? undefined);
    }
  }, [parent]);

  useEffect(() => {
    if (productList.length && values.product) {
      const product = productList.find(item => item.id === values.product.id);
      if (product) setProduct(product);
    }
  }, [productList, values]);

  useEffect(() => {
    if (product) {
      handleChange('productId');
      setFieldValue('productId', product.id);
      setFieldValue('product', product);
      setFieldValue('name', product.name);
    }
  }, [product]);

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep == 2) {
      handleSubmit();
    } else {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }

      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  console.log(errors);

  return (
    <Box sx={{ ...style }}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Добавить новую партию
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          '& .MuiTextField-root': { width: '100%' },
        }}
        noValidate
        autoComplete="off"
      >
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel>Выберите товар</StepLabel>
          </Step>
          <Step>
            <StepLabel
              optional={<Typography variant="caption">Optional</Typography>}
            >
              Выбрать исходную партию
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>Новая партия</StepLabel>
          </Step>
        </Stepper>
        <Box sx={{ pt: 2, pb: 2, minHeight: 200 }}>
          {(() => {
            switch (activeStep) {
              case 0:
                return (
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Autocomplete
                          fullWidth
                          options={productList}
                          getOptionLabel={option =>
                            `${option.sku}: ${option.name}`
                          }
                          value={product}
                          onChange={(e, obj) => {
                            setProduct(obj);
                          }}
                          onBlur={handleBlur}
                          renderInput={params => (
                            <TextField
                              {...params}
                              name="name"
                              label="Товар"
                              inputProps={{
                                ...params.inputProps,
                              }}
                              error={touched.product && Boolean(errors.product)}
                              helperText={
                                touched.product &&
                                errors.product &&
                                errors.product.id
                              }
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={6}>
                        Вы должны выбрать товар, который хотите добавить в
                        группу
                      </Grid>
                    </Grid>
                  </Box>
                );
              case 1:
                return (
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      {values.product ? (
                        <SelectProductBatch
                          valueId={values.parentId}
                          productId={values.product.id}
                          onChange={parent => setParent(parent ?? null)}
                        />
                      ) : (
                        'не выбран товар'
                      )}
                    </Grid>
                    <Grid size={6}>
                      Вы можете выбрать исходную партию, из которой нужно
                      перенести товары в новую партию
                    </Grid>
                  </Grid>
                );
              case 2:
                return (
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <TextField
                        required
                        id="outlined-required"
                        label="Название"
                        name="name"
                        value={values.name}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />

                      <TextField
                        sx={{ mt: 2 }}
                        fullWidth
                        required
                        id="outlined-required"
                        type="number"
                        label="Закупочная цена"
                        name="costPricePerUnit"
                        value={values.costPricePerUnit}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />

                      <DatePicker
                        sx={{ mt: 2 }}
                        label="Дата"
                        format="yyyy-MM-dd"
                        value={
                          values.date
                            ? parse(values.date, 'yyyy-MM-dd', new Date())
                            : null
                        }
                        // onBlur={handleBlur}
                        onChange={value => {
                          setFieldValue(
                            'date',
                            value ? format(value, 'yyyy-MM-dd') : undefined,
                          );
                        }}
                      />
                      <TextField
                        sx={{ mt: 2 }}
                        fullWidth
                        required
                        id="outlined-required"
                        type="number"
                        label="Количество"
                        name="count"
                        value={values.count}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={touched.count && Boolean(errors.count)}
                      />
                      <InputLabel htmlFor="my-input" sx={{ pt: 2 }}>
                        Цвет карточки
                      </InputLabel>
                      <FormHelperText id="my-helper-text">
                        Поможет легче ориентироваться на дашборде.
                      </FormHelperText>
                      <Compact
                        color={values.color}
                        style={{
                          boxShadow:
                            'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
                        }}
                        onChange={color => {
                          setFieldValue('color', color.hex);
                        }}
                      />
                    </Grid>
                    <Grid size={6}>
                      Вы должны выбрать товар, который хотите добавить в группу
                    </Grid>
                  </Grid>
                );
              default:
                return null;
            }
          })()}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
              Skip
            </Button>
          )}

          <Button onClick={handleNext}>
            {activeStep === 2 ? 'Создать партию' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const ProductBatchForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as FormValues;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: (values, formikBag) => {
    return formikBag.props
      .onSubmit(
        { ...values, costPricePerUnit: fromRouble(values.costPricePerUnit) },
        formikBag,
      )
      .then(() => {
        formikBag.props.closeModal();
      });
  },
})(Form);

export default NiceModal.create(withModal(ProductBatchForm));
