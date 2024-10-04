import { ClassConstructor, plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

const validationError = async (input: any): Promise<ValidationError[] | false> => {
  const errors = await validate(input, {validationError: {target: true}})
  if(errors.length) return errors

  return false
}

export const ValidatorRequest = async <T>(type: ClassConstructor<T>, body: any): Promise<{errors: boolean|string, input: T}> => {
  const input = plainToClass(type, body)
  const errors = await validationError(input)

  if(errors) {
    const errorsMessage = errors.map((error: ValidationError) => (Object as any).values(error.constraints)).join(', ')
    return {errors: errorsMessage, input}
  }

  return {errors: false, input}
}