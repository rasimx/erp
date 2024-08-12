import NiceModal from '@ebay/nice-modal-react';
import { Autocomplete, Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import React, { type FC, useEffect, useState } from 'react';
import { object, ObjectSchema } from 'yup';

import { useProductList } from '../../api/product/product.hooks';
import { ProductBatchFragment, ProductFragment } from '../../gql-types/graphql';
import SelectProductBatch from '../CreateProductBatch/SelectProductBatch';
import withModal from '../withModal';

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

export interface FormValues {
  product: ProductFragment;
  productBatch: ProductBatchFragment;
}

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
}

const Form: FC<Props & FormikProps<FormValues>> = ({
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

  const [product, setProduct] = useState<ProductFragment | null>(null);

  useEffect(() => {
    if (productList.length && values.product) {
      const product = productList.find(item => item.id === values.product.id);
      if (product) setProduct(product);
    }
  }, [productList, values]);

  useEffect(() => {
    if (product) {
      setFieldValue('product', product);
    }
  }, [product]);

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep == 1) {
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

  return (
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Добавить существующую партию
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
            <StepLabel>Новая парти</StepLabel>
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
                          valueId={values.productBatch?.id}
                          productId={values.product.id}
                          onChange={batch => {
                            setFieldValue('productBatch', batch);
                            handleChange('productBatch');
                          }}
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
            {activeStep === 1 ? 'Добавить партию' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const selectProductBatchValidationSchema =
  (): ObjectSchema<FormValues> => {
    // @ts-expect-error здесь не нужна особая проверка. главное не null
    return object().shape({
      product: object().nonNullable(),
      productBatch: object().nonNullable(),
    });
  };

const SelectExistsProductBatchForm = withFormik<Props, FormValues>({
  validationSchema: selectProductBatchValidationSchema(),
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

  handleSubmit: (values, { props }) => {
    props.onSubmit(values);
    props.closeModal();
    // do submitting things
  },
})(Form);

export default NiceModal.create(withModal(SelectExistsProductBatchForm));
