import { ValidationError } from 'yup';

interface Error {
  [key: string]: string;
}

export default function gatValidationErros(err: ValidationError): Error {
  const validationsErrors: Error = {};

  err.inner.forEach(error => {
    validationsErrors[error.path] = error.message;
  });

  return validationsErrors;
}
