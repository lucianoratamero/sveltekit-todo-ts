import _ from 'lodash';
import { ValidationError } from 'yup';
import type { Result } from '../app';
import type { BaseSchema } from 'yup';

export type FormErrors = { errors?: { [k: string]: ValidationError } };
const CAST_OPTION_VALUES = ['string', 'number', 'boolean'] as const;
type CastOptionValue = typeof CAST_OPTION_VALUES[number];

export function castFormData<T>(
	data: FormData,
	castOptions?: Record<keyof T, CastOptionValue>
): T {
	const castedEntries = [...data].map(([key, value]) => {
		switch (value) {
			// casting checkboxes
			case 'on':
				return [key, true];
			case 'off':
				return [key, false];

			default:
				if (castOptions && Object.keys(castOptions).includes(key)) {
					return [key, castToType(value, castOptions[key as keyof T])];
				}
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

const castToType = (data: any, type: CastOptionValue) => {
	if (type === 'string') return String(data);
	if (type === 'number') return Number(data);
	if (type === 'boolean') return Boolean(data);
	return data;
};

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
