import NiceModal from '@ebay/nice-modal-react';
import { Box, Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import React, { FC } from 'react';
import { array, number, object, ObjectSchema, string } from 'yup';

import {
  CreateProductBatchGroupDto,
  StatusFragment,
} from '../../gql-types/graphql';
import { createProductBatchValidationSchema } from '../AddProductBatch/AddProductBatchForm';
import withModal from '../withModal';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

type Props = {
  groupStatus: StatusFragment;
};

const Form: FC<Props & FormikProps<CreateProductBatchGroupDto>> = props => {
  return (
    <Box
      sx={style}
      component="form"
      onSubmit={props.handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Добавить группу в колонку {props.groupStatus.title}
      </Typography>
      <TextField
        required
        id="outlined-required"
        label="Название"
        name="name"
        value={props.values.name}
        onBlur={props.handleBlur}
        onChange={props.handleChange}
      />
      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Добавить партию
      </Button>
    </Box>
  );
};

const CreateProductBatchGroupForm = withFormik<
  Props,
  CreateProductBatchGroupDto
>({
  validationSchema: props => {
    const schema: ObjectSchema<CreateProductBatchGroupDto> = object({
      name: string().required(),
      statusId: number().required(),
      existProductBatchIds: array(number().required()).required(),
      newProductBatches: array(createProductBatchValidationSchema()).required(),
    });
    return schema;
  },
  // mapPropsToValues: props => {
  //   debugger;
  //   return {
  //     statusId: props.status.id,
  //   };
  // },

  // Add a custom validation function (this can be async too!)
  validate: (values: CreateProductBatchGroupDto) => {
    const errors: FormikErrors<CreateProductBatchGroupDto> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: values => {
    // do submitting things
  },
})(Form);

export default NiceModal.create(withModal(CreateProductBatchGroupForm));
