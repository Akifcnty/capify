import React from 'react';
import { TextField } from '@mui/material';

const AuthTextField = ({ label, type = 'text', value, onChange, error, ...props }) => (
  <TextField
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
    fullWidth
    margin="normal"
    {...props}
  />
);

export default AuthTextField; 