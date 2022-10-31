<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Todo } from '@prisma/client';
	import type { ValidationError } from 'yup';

	export let todo: Partial<Todo> = {};
	export let form: FormData & Todo & { errors?: { [k: string]: ValidationError } };

	let formElement: HTMLFormElement;
	let isLoading = false;

	const submitForm = () => {
		if (todo.id) formElement.dispatchEvent(new Event('submit', { cancelable: true }));
	};

	$: form, (isLoading = false);
</script>

<section class="card">
	<form
		bind:this={formElement}
		method="post"
		action={todo.id ? '?/update' : '?/create'}
		use:enhance
		on:submit={() => {
			isLoading = true;
			if (!todo.id) {
				todo = {};
			}
		}}
	>
		<label>
			<input type="checkbox" name="done" bind:checked={todo.done} on:change={submitForm} />
			Done
		</label>
		<label>
			Title
			<input
				name="title"
				type="text"
				bind:value={todo.title}
				class:error={form?.id === todo?.id && form?.errors?.title}
				on:blur={submitForm}
			/>
			{#if form?.id === todo?.id && form?.errors?.title}
				<p class="error-message">{form.errors.title.errors[0]}</p>
			{/if}
		</label>
		<label>
			Description
			<input
				class:error={form?.id === todo?.id && form?.errors?.description}
				name={'description'}
				type="text"
				bind:value={todo.description}
				on:blur={submitForm}
			/>
			{#if form?.id === todo?.id && form?.errors?.description}
				<p class="error-message">{form.errors.description.errors[0]}</p>
			{/if}
		</label>

		{#if todo.id}
			<input type="hidden" name="id" bind:value={todo.id} />
		{/if}

		{#if !todo.id}
			<button disabled={isLoading} type="submit">Save</button>
		{/if}

		{#if todo.id && isLoading}
			<div class="loading-overlay" />
		{/if}
	</form>

	{#if todo.id}
		<form method="post" action="?/delete" use:enhance on:submit={() => (isLoading = true)}>
			<input type="hidden" name="id" bind:value={todo.id} />
			<button type="submit" class="error">Delete</button>
		</form>
	{/if}
</section>

<style>
	.error {
		border-color: red;
	}
	.error-message {
		color: red;
	}
	.error-message::first-letter {
		text-transform: capitalize;
	}
</style>
