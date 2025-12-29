<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		Package,
		Tag,
		DollarSign,
		AlertCircle,
		ArrowLeft,
		Save,
		Box,
		Hash,
		FileText,
		Link,
		ChevronDown
	} from '@lucide/svelte';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let categories = $derived(data.categories);
	// Optional: Client-side slug generation logic could be added here
	// let name = $state('');
	// $effect(() => { /* generate slug from name */ });
</script>

<div class="page-wrapper">
	<header class="page-header">
		<h1>发布新商品</h1>
		<p>填写以下信息以将新商品添加到您的店铺</p>
	</header>
	{#if form?.error}
		<div class="error-banner">
			<AlertCircle size={18} class="icon-shrink" />
			<span>{form.error}</span>
		</div>
	{/if}
	<form method="POST" use:enhance class="main-form">
		<section class="form-card">
			<h2 class="section-title">
				<Package size={16} />
				基本信息
			</h2>
			<div class="field-group">
				<label for="name">
					商品名称 <span class="required">*</span>
				</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					placeholder="例如：iPhone 15 Pro"
					class="input-control"
				/>
			</div>
			<div class="field-group">
				<label for="slug">
					URL 标识 <span class="required">*</span>
				</label>
				<div class="composite-field">
					<span class="input-prefix">
						<Link size={14} class="prefix-icon" />
						<span class="prefix-text">myshop.com/products/</span>
					</span>
					<input
						type="text"
						id="slug"
						name="slug"
						required
						placeholder="iphone-15-pro"
						pattern="[a-z0-9-]+"
						title="仅允许小写字母、数字和连字符"
					/>
				</div>
			</div>
			<div class="field-group">
				<label for="shortDescription">简短描述</label>
				<input
					type="text"
					id="shortDescription"
					name="shortDescription"
					maxlength="500"
					placeholder="一句话概括商品卖点"
					class="input-control"
				/>
			</div>
			<div class="field-group">
				<label for="description">详细描述</label>
				<textarea
					id="description"
					name="description"
					rows="6"
					placeholder="输入商品的详细介绍..."
					class="textarea-control"
				></textarea>
			</div>
		</section>
		<section class="form-card">
			<h2 class="section-title">
				<DollarSign size={16} />
				定价与库存
			</h2>
			<div class="grid-row">
				<div class="field-group">
					<label for="price">
						销售价格 <span class="required">*</span>
					</label>
					<div class="composite-field group">
						<span class="input-prefix symbol">¥</span>
						<input
							type="number"
							id="price"
							name="price"
							step="0.01"
							min="0"
							required
							placeholder="0.00"
						/>
					</div>
				</div>
				<div class="field-group">
					<label for="compareAtPrice">划线价 (原价)</label>
					<div class="composite-field group">
						<span class="input-prefix symbol">¥</span>
						<input
							type="number"
							id="compareAtPrice"
							name="compareAtPrice"
							step="0.01"
							min="0"
							placeholder="0.00"
						/>
					</div>
				</div>
			</div>
			<div class="grid-row">
				<div class="field-group">
					<label for="stock">
						库存数量 <span class="required">*</span>
					</label>
					<div class="composite-field group">
						<span class="input-prefix icon-only"><Box size={14} /></span>
						<input type="number" id="stock" name="stock" min="0" required placeholder="0" />
					</div>
				</div>
				<div class="field-group">
					<label for="sku">SKU 编码</label>
					<div class="composite-field group">
						<span class="input-prefix icon-only"><Hash size={14} /></span>
						<input type="text" id="sku" name="sku" placeholder="例如：APL-I15P-BLK" />
					</div>
				</div>
			</div>
		</section>
		<section class="form-card">
			<h2 class="section-title">
				<Tag size={16} />
				分类
			</h2>
			<div class="field-group">
				<label for="categoryId">选择所属分类</label>
				<div class="select-wrapper">
					<select id="categoryId" name="categoryId">
						<option value="">未分类</option>
						{#each categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
					<ChevronDown size={14} class="select-arrow" />
				</div>
			</div>
		</section>
		<footer class="action-bar">
			<button type="button" class="btn-secondary" onclick={() => history.back()}>
				<ArrowLeft size={16} class="btn-icon" />
				取消
			</button>
			<button type="submit" class="btn-primary">
				<Save size={16} class="btn-icon" />
				确认发布商品
			</button>
		</footer>
	</form>
</div>
<!-- <script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		Package,
		Tag,
		DollarSign,
		AlertCircle,
		ArrowLeft,
		Save,
		Box,
		Hash,
		Link,
		ChevronDown
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let categories = $derived(data.categories);
</script>

<div class="page-container">
	<div class="ambient-glow"></div>

	<div class="content-wrapper">
		<header class="page-header">
			<div class="header-content">
				<h1>发布新商品</h1>
				<p>填写以下详细信息以将新库存添加到您的数字展厅。</p>
			</div>
		</header>

		{#if form?.error}
			<div class="alert-banner">
				<AlertCircle size={18} class="text-red-400" />
				<span class="alert-text">{form.error}</span>
			</div>
		{/if}

		<form method="POST" use:enhance class="main-form">
			<section class="card">
				<header class="card-header">
					<div class="card-icon">
						<Package size={20} />
					</div>
					<h2>基本信息</h2>
				</header>

				<div class="form-grid">
					<div class="field-wrapper">
						<label for="name">商品名称 <span class="required-mark">*</span></label>
						<input
							type="text"
							id="name"
							name="name"
							required
							placeholder="例如：iPhone 15 Pro Max Titanium"
							class="input-base"
						/>
					</div>

					<div class="field-wrapper">
						<label for="slug">URL 标识 (Slug) <span class="required-mark">*</span></label>
						<div class="input-group group">
							<div class="addon-prefix text-sm">
								<Link size={14} class="mr-2 opacity-50" />
								myshop.com/products/
							</div>
							<input
								type="text"
								id="slug"
								name="slug"
								required
								placeholder="iphone-15-pro-max"
								class="input-merged"
							/>
						</div>
					</div>

					<div class="field-wrapper">
						<label for="shortDescription">简短描述</label>
						<input
							type="text"
							id="shortDescription"
							name="shortDescription"
							maxlength="500"
							placeholder="一句话概括核心卖点，用于列表页展示"
							class="input-base"
						/>
					</div>

					<div class="field-wrapper">
						<label for="description">详细描述</label>
						<textarea
							id="description"
							name="description"
							rows="6"
							placeholder="请详细描述商品的规格、功能和包含的内容..."
							class="textarea-base"
						></textarea>
					</div>
				</div>
			</section>

			<section class="card">
				<header class="card-header">
					<div class="card-icon">
						<DollarSign size={20} />
					</div>
					<h2>定价与库存策略</h2>
				</header>

				<div class="form-grid-cols">
					<div class="field-wrapper">
						<label for="price">销售价格 <span class="required-mark">*</span></label>
						<div class="input-group group">
							<span class="addon-prefix font-mono">¥</span>
							<input
								type="number"
								id="price"
								name="price"
								step="0.01"
								required
								placeholder="0.00"
								class="input-merged font-mono"
							/>
						</div>
					</div>

					<div class="field-wrapper">
						<label for="compareAtPrice">划线价 (原价)</label>
						<div class="input-group group">
							<span class="addon-prefix font-mono">¥</span>
							<input
								type="number"
								id="compareAtPrice"
								name="compareAtPrice"
								step="0.01"
								placeholder="0.00"
								class="input-merged font-mono"
							/>
						</div>
					</div>

					<div class="field-wrapper">
						<label for="stock">库存数量 <span class="required-mark">*</span></label>
						<div class="input-group group">
							<div class="addon-prefix icon-only">
								<Box size={16} />
							</div>
							<input
								type="number"
								id="stock"
								name="stock"
								required
								placeholder="100"
								class="input-merged font-mono"
							/>
						</div>
					</div>

					<div class="field-wrapper">
						<label for="sku">SKU 编码</label>
						<div class="input-group group">
							<div class="addon-prefix icon-only">
								<Hash size={16} />
							</div>
							<input
								type="text"
								id="sku"
								name="sku"
								placeholder="APL-15PM-TI-256"
								class="input-merged font-mono tracking-wider"
							/>
						</div>
					</div>
				</div>
			</section>

			<section class="card">
				<header class="card-header">
					<div class="card-icon">
						<Tag size={20} />
					</div>
					<h2>商品归类</h2>
				</header>

				<div class="field-wrapper">
					<label for="categoryId">选择所属品类</label>
					<div class="select-container group">
						<select id="categoryId" name="categoryId" class="select-base">
							<option value="">未分类</option>
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
						<div class="select-chevron">
							<ChevronDown size={16} />
						</div>
					</div>
				</div>
			</section>

			<footer class="action-bar">
				<button type="button" class="btn-ghost" onclick={() => history.back()}>
					<ArrowLeft size={18} />
					<span>取消返回</span>
				</button>
				<button type="submit" class="btn-primary">
					<Save size={18} />
					<span>确认发布商品</span>
				</button>
			</footer>
		</form>
	</div>
</div>

<style>
	/* Tailwind CSS 4 + Svelte 5 Native Styling 
       Theme: Dark Premium (Zinc & Indigo)
    */
	@reference '../../../layout.css';
	/* --- Page Layout & Background --- */
	.page-container {
		@apply relative min-h-screen w-full bg-zinc-950 text-zinc-200 selection:bg-indigo-500/30 selection:text-white;
	}

	/* Ambient glow effect positioned absolutely */
	.ambient-glow {
		@apply pointer-events-none absolute top-0 left-1/2 h-[500px] w-full -translate-x-1/2 opacity-20 blur-[100px];
		background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(0, 0, 0, 0) 70%);
	}

	.content-wrapper {
		@apply relative mx-auto max-w-4xl px-6 py-12;
	}

	/* --- Header --- */
	.page-header {
		@apply mb-10 flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-8 sm:flex-row sm:items-center;
	}

	.header-content h1 {
		@apply text-3xl font-bold tracking-tight text-white;
	}

	.header-content p {
		@apply mt-2 text-sm text-zinc-400;
	}

	/* --- Alerts --- */
	.alert-banner {
		@apply mb-8 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-sm;
	}

	/* --- Form Layout --- */
	.main-form {
		@apply flex flex-col gap-6;
	}

	/* --- Card Component --- */
	.card {
		@apply overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 p-1 shadow-2xl backdrop-blur-md;
	}

	.card-header {
		@apply mb-6 flex items-center gap-3 border-b border-white/5 px-5 py-4;
	}

	.card-icon {
		@apply flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-indigo-400 shadow-inner;
	}

	.card h2 {
		@apply text-sm font-semibold tracking-wide text-zinc-100 uppercase;
	}

	.form-grid {
		@apply flex flex-col gap-5 px-6 pb-6;
	}

	.form-grid-cols {
		@apply grid grid-cols-1 gap-5 px-6 pb-6 sm:grid-cols-2;
	}

	/* --- Form Fields --- */
	.field-wrapper {
		@apply flex flex-col gap-2;
	}

	label {
		@apply text-xs font-medium tracking-wide text-zinc-400 uppercase;
	}

	.required-mark {
		@apply text-indigo-400;
	}

	/* Standard Input & Textarea */
	.input-base,
	.textarea-base {
		@apply w-full rounded-lg border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 shadow-sm transition-all duration-200 ease-out;
	}

	.input-base:focus,
	.textarea-base:focus {
		@apply border-indigo-500/50 bg-zinc-900 ring-2 ring-indigo-500/20 outline-hidden;
	}

	.textarea-base {
		@apply resize-y leading-relaxed;
	}

	/* Composite/Grouped Inputs */
	/* Note: "group" class is in HTML as requested for specificity */
	.input-group {
		@apply flex w-full items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950/50 shadow-sm transition-all duration-200;
	}

	.input-group:focus-within {
		@apply border-indigo-500/50 bg-zinc-900 ring-2 ring-indigo-500/20;
	}

	.addon-prefix {
		@apply flex h-full items-center border-r border-white/5 bg-white/5 px-3 text-zinc-500 select-none;
	}

	.addon-prefix.icon-only {
		@apply px-3;
	}

	/* Input inside a group */
	.input-merged {
		@apply w-full border-none bg-transparent px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-hidden focus:ring-0;
	}

	/* Custom Select */
	.select-container {
		@apply relative w-full;
	}

	.select-base {
		@apply w-full appearance-none rounded-lg border border-white/10 bg-zinc-950/50 px-4 py-2.5 pr-10 text-sm text-white shadow-sm transition-all duration-200 focus:border-indigo-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden;
	}

	.select-chevron {
		@apply pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition-colors;
	}

	/* Using nested style for group-hover on select since group is on container */
	.select-container:hover .select-chevron {
		@apply text-zinc-300;
	}

	/* --- Action Bar --- */
	.action-bar {
		@apply mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6;
	}

	.btn-primary {
		@apply inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-900/40 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 active:scale-95;
	}

	.btn-ghost {
		@apply inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-white/5 hover:bg-white/5 hover:text-white focus:bg-white/5 active:scale-95;
	}
</style> -->

<style>
	@reference '../../../layout.css';
	/* 
		 * Design System: "Dark Zinc Glass"
		 * Tech Stack: Svelte 5 Runes, Tailwind CSS 4 (Utility Classes)
		 * Goal: High contrast, low cognitive load, premium feel.
		 */
	/* === Canvas === */
	.page-wrapper {
		@apply min-h-screen bg-zinc-950 px-4 py-12 text-zinc-50 selection:bg-indigo-500/30 sm:px-6;
		/* Subtle ambient light effect */
		background-image: radial-gradient(
			circle at 50% 0%,
			rgba(99, 102, 241, 0.08) 0%,
			transparent 50%
		);
	}
	/* === Header === */
	.page-header {
		@apply mx-auto mb-10 max-w-3xl space-y-2 text-center sm:text-left;
	}
	.page-header h1 {
		@apply text-3xl font-bold tracking-tight text-white;
	}
	.page-header p {
		@apply text-sm text-zinc-400;
	}
	/* === Error Handling === */
	.error-banner {
		@apply mx-auto mb-8 flex max-w-3xl items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-md;
		animation: fadeIn 0.3s ease-out;
	}
	.icon-shrink {
		@apply shrink-0;
	}
	/* === Form Structure === */
	.main-form {
		@apply mx-auto flex max-w-3xl flex-col gap-6;
	}
	.form-card {
		@apply rounded-2xl border border-white/5 bg-zinc-900/40 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm sm:p-8;
		/* Hover effect for card depth perception */
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}
	.form-card:hover {
		@apply border-white/10;
	}
	/* === Typography === */
	.section-title {
		@apply mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4 text-sm font-semibold tracking-wide text-zinc-200 uppercase;
	}
	.section-title > :global(svg) {
		@apply text-indigo-400;
	}
	/* === Inputs & Fields === */
	.field-group {
		@apply mb-5 flex flex-col gap-2.5 last:mb-0;
	}
	label {
		@apply flex items-center gap-1.5 text-xs font-medium tracking-wider text-zinc-400 uppercase;
	}
	.required {
		@apply text-indigo-400;
	}
	/* Standard Inputs */
	.input-control {
		@apply w-full rounded-lg border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white transition-all duration-200 placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none;
	}
	.textarea-control {
		@apply min-h-[140px] w-full resize-y rounded-lg border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm leading-relaxed text-white transition-all duration-200 placeholder:text-zinc-600 focus:border-indigo-500/50 focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none;
	}
	/* Composite Inputs (Prefix/Icon) */
	.composite-field {
		@apply flex items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950/50 transition-all duration-200 focus-within:border-indigo-500/50 focus-within:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/10;
	}
	.composite-field input {
		@apply w-full border-none bg-transparent px-4 py-3 text-sm text-white outline-none focus:shadow-none focus:ring-0;
	}
	.input-prefix {
		@apply flex h-full items-center gap-2 border-r border-white/5 bg-white/5 px-3 py-3 text-zinc-500 select-none;
	}
	.input-prefix.prefix-icon {
		@apply px-3;
	}
	.input-prefix.icon-only {
		@apply px-3.5;
	}
	.input-prefix.symbol {
		@apply px-3 font-normal text-zinc-400;
	}
	.prefix-icon {
		@apply shrink-0;
	}
	/* === Select === */
	.select-wrapper {
		@apply relative w-full;
		/* Dark mode enforcement for native dropdown */
		color-scheme: dark;
	}
	.select-wrapper select {
		@apply w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-zinc-950/50 px-4 py-3 pr-10 text-sm text-white transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none;
	}
	.select-arrow {
		@apply pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-500 transition-transform duration-200;
	}
	.select-wrapper:hover .select-arrow {
		@apply text-zinc-300;
	}
	/* === Grid System === */
	.grid-row {
		@apply grid grid-cols-1 gap-5 sm:grid-cols-2;
	}
	/* === Footer Actions === */
	.action-bar {
		@apply mx-auto mt-8 flex max-w-3xl justify-end gap-4 border-t border-white/5 pt-8;
	}
	/* === Buttons === */
	.btn-primary,
	.btn-secondary {
		@apply inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50;
	}
	.btn-primary {
		@apply bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 hover:shadow-indigo-900/30 focus:ring-indigo-600 active:scale-[0.98] active:transform;
	}
	.btn-secondary {
		@apply border border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white focus:ring-zinc-700;
	}
	.btn-icon {
		@apply mr-2;
	}
	/* === Animations === */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
