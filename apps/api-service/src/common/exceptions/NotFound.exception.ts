import { HttpException, HttpStatus } from '@nestjs/common';

import { type Exception } from '../models';

const toTitleCase = (value: string): string => {
  return value.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

export default class NotFoundException extends HttpException {
  constructor(props: Exception) {
    const { collection, id, message } = props;

    let errorMessage = '';

    errorMessage += `Data ${id ? `${id} ` : ''}`;

    if (collection)
      errorMessage += collection
        ? `in ${toTitleCase(collection)} collection `
        : '';

    errorMessage += 'not found.';

    if (message) errorMessage = message;

    super(errorMessage, HttpStatus.NOT_FOUND);
  }
}
