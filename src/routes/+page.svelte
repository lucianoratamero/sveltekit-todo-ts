<script lang="ts">
	import { flip } from 'svelte/animate';
	import { crossfade } from 'svelte/transition';
	const [send, receive] = crossfade({});

	import CreateUpdateTodoForm from './CreateUpdateTodoForm.svelte';
	import type { Todo } from '@prisma/client';
	import type { PageData } from './$types';
	import type { ValidationError } from 'yup';

	export let data: PageData;
	export let form: FormData & Todo & { errors?: { [k: string]: ValidationError } };
</script>

<h1 class="title">SvelteKit Todo App</h1>

<CreateUpdateTodoForm bind:form />

<div class="grid">
	{#each data.todos as todo (todo.id)}
		<div animate:flip={{ duration: 250 }} in:receive={{ key: todo.id }} out:send={{ key: todo.id }}>
			<CreateUpdateTodoForm bind:todo bind:form />
		</div>
	{/each}
</div>
