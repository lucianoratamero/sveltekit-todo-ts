import type { Todo } from '@prisma/client';
import { fail, type Action } from '@sveltejs/kit';
import type { FormErrors } from '$lib/formUtils';
import { castFormData, validateForm } from '$lib/formUtils';
import * as yup from 'yup';
import Filter from 'bad-words';
import db from '../../prisma/db';
import type { Actions } from './$types';
import type { Result } from 'src/app';

const filter = new Filter();

const cleanData = (validatedData: Omit<Todo, 'id'> & { id?: number }) => {
	validatedData.title = filter.clean(validatedData.title);
	if (validatedData.description) {
		validatedData.description = filter.clean(validatedData.description || '');
	}
	return validatedData;
};

export async function load() {
	return { todos: await db.todo.findMany({ orderBy: [{ id: 'asc' }] }) };
}

const createTodo: Action = async ({ request }) => {
	const data = castFormData<Omit<Todo, 'id'>>(await request.formData(), {
		title: 'string',
		description: 'string'
	});

	const [result, validatedData]: Result<Omit<Todo, 'id'>, FormErrors> = await validateForm(
		data,
		createUpdateTodoValidator
	);
	if (result === 'error') {
		return fail(400, validatedData);
	}

	return await db.todo.create({ data: cleanData(validatedData) });
};

const updateTodo: Action = async ({ request }) => {
	const data = castFormData<Todo>(await request.formData(),{
		title: 'string',
		description: 'string'
	});
	const { id } = data;

	const cleanedData: Omit<Todo, 'id'> & { id?: number } = { ...data };
	delete cleanedData.id;

	const [result, validatedData] = await validateForm(data, createUpdateTodoValidator);
	if (result === 'error') {
		return fail(400, { id, ...validatedData });
	}

	if (!validatedData.done) {
		validatedData.done = false;
	}

	return await db.todo.update({
		where: { id },
		data: cleanData(validatedData)
	});
};

const deleteTodo: Action = async ({ request }) => {
	const data = castFormData<{ id: number }>(await request.formData());
	try {
		await db.todo.delete({ where: { id: data.id } });
		return { success: true };
	} catch (error) {
		return fail(404);
	}
};

export const actions: Actions = {
	create: createTodo,
	update: updateTodo,
	delete: deleteTodo
};

const createUpdateTodoValidator = yup.object().shape({
	title: yup.string().required()
});
