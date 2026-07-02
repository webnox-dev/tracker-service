import { registerDecorator } from 'class-validator';
import type { ValidationArguments, ValidationOptions } from 'class-validator';

function isJsonPrimitive(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isJsonValue(value: unknown): boolean {
  if (isJsonPrimitive(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every((entry) => isJsonValue(entry));
  }

  return false;
}

export function IsJsonObject(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isJsonObject',
      target: target.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            isJsonValue(value)
          );
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid JSON object`;
        },
      },
    });
  };
}
