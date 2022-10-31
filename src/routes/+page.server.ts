import type { Todo } from '@prisma/client';
import { invalid, type Action } from '@sveltejs/kit';
import type { FormErrors } from '$lib/formUtils';
import { castFormData, validateForm } from '$lib/formUtils';
import * as yup from 'yup';
import db from '../../prisma/db';
import type { Actions } from './$types';
import type { Result } from 'src/app';

export async function load() {
	return { todos: await db.todo.findMany({ orderBy: [{ id: 'asc' }] }) };
}

const createTodo: Action = async ({ request }) => {
	const data = castFormData<Omit<Todo, 'id'>>(await request.formData());

	const [result, validatedData]: Result<Omit<Todo, 'id'>, FormErrors> = await validateForm(
		data,
		createUpdateTodoValidator
	);
	if (result === 'error') {
		return invalid(400, validatedData);
	}

	return await db.todo.create({ data: validatedData });
};

const updateTodo: Action = async ({ request }) => {
	const data = castFormData<Todo>(await request.formData());
	const { id } = data;

	const cleanedData: Omit<Todo, 'id'> & { id?: number } = { ...data };
	delete cleanedData.id;

	const [result, validatedData] = await validateForm(data, createUpdateTodoValidator);
	if (result === 'error') {
		return invalid(400, { id, ...validatedData });
	}

	if (!validatedData.done) {
		validatedData.done = false;
	}

	return await db.todo.update({
		where: { id },
		data
	});
};

const deleteTodo: Action = async ({ request }) => {
	const data = castFormData<{ id: number }>(await request.formData());
	try {
		await db.todo.delete({ where: { id: data.id } });
		return { success: true };
	} catch (error) {
		return invalid(404);
	}
}

export const actions: Actions = {
	create: createTodo,
	update: updateTodo,
	delete: deleteTodo,
};

const createUpdateTodoValidator = yup.object().shape({
	title: yup.string().required()
});
