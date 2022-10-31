import _ from 'lodash';
import { ValidationError } from 'yup';
import type { Result } from '../app';
import type { BaseSchema } from 'yup';

export type FormErrors = { errors?: { [k: string]: ValidationError } };

export function castFormData<U>(data: FormData): U {
	const castedEntries = [...data].map(([key, value]) => {
		switch (value) {
			// casting checkboxes
			case 'on':
				return [key, true];
			case 'off':
				return [key, false];

			default:
				return [
					key,
					// casting any string that contains a number to number
					isNaN(Number(value)) || (_.isEmpty(value) && _.isNumber(Number(value)))
						? value
						: Number(value)
				];
		}
	});

	return Object.fromEntries(castedEntries);
}

export const validateForm = async <T>(
	data: T,
	validator: BaseSchema
): Promise<Result<T, FormErrors>> => {
	try {
		return ['ok', await validator.validate(data, { abortEarly: false })];
	} catch (error) {
		if (!(error instanceof ValidationError)) {
			throw error;
		}
		return [
			'error',
			{
				errors: Object.fromEntries(
					error.inner.map(({ path, type, errors }) => [path, { path, type, errors }])
				)
			}
		];
	}
};
