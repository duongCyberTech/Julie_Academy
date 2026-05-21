import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

class IsIsoDateTimeValidator {
  validate(value: any): boolean {
    if (!value) return false;

    if (typeof value === 'string') {
      return ISO_DATETIME_REGEX.test(value) && !isNaN(Date.parse(value));
    }

    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    return false;
  }
}

export function IsIsoDateTime(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsIsoDateTimeValidator,
    });
  };
}

export function TransformToIsoDateTime() {
  return Transform(({ value }) => {
    if (!value) return value;

    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return value;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return value;
  });
}
