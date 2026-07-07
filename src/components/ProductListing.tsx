import { useCallback, useEffect, useMemo, useState } from 'react';
import { products } from '../data/products';
import PrintOptionsModal from './PrintOptionsModal';
import PrintPreview from './PrintPreview';
import type { PriceLevel } from '../data/priceLevels';
import {
	InboxIcon,
	MinusIcon,
	PlusIcon,
	PrinterIcon,
	SearchIcon,
	TagIcon,
	XIcon,
} from './icons';

function ProductListing() {
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('All');
	const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
	const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
	const [printData, setPrintData] = useState<{
		title: string;
		priceLevel: PriceLevel;
	} | null>(null);

	const categories = useMemo(() => {
		const unique = new Set(products.map((product) => product.category));
		return ['All', ...unique];
	}, []);

	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesCategory =
				category === 'All' || product.category === category;
			const matchesSearch = product.productName
				.toLowerCase()
				.includes(search.trim().toLowerCase());
			return matchesCategory && matchesSearch;
		});
	}, [search, category]);

	const selectedProducts = useMemo(() => {
		return products
			.filter((product) => quantities.has(product.productName))
			.map((product) => ({
				...product,
				quantity: quantities.get(product.productName) ?? 1,
			}));
	}, [quantities]);

	const totals = useMemo(() => {
		return selectedProducts.reduce(
			(acc, product) => ({
				vp: acc.vp + product.vp * product.quantity,
				mrp: acc.mrp + product.mrp * product.quantity,
				price15: acc.price15 + product.price15 * product.quantity,
				price25: acc.price25 + product.price25 * product.quantity,
				price35: acc.price35 + product.price35 * product.quantity,
				price42: acc.price42 + product.price42 * product.quantity,
				price50: acc.price50 + product.price50 * product.quantity,
			}),
			{
				vp: 0,
				mrp: 0,
				price15: 0,
				price25: 0,
				price35: 0,
				price42: 0,
				price50: 0,
			},
		);
	}, [selectedProducts]);

	const toggleSelected = useCallback((productName: string) => {
		setQuantities((prev) => {
			const next = new Map(prev);
			if (next.has(productName)) {
				next.delete(productName);
			} else {
				next.set(productName, 1);
			}
			return next;
		});
	}, []);

	const toggleSelectAll = useCallback(() => {
		setQuantities((prev) => {
			const allSelected = filteredProducts.every((product) =>
				prev.has(product.productName),
			);
			if (allSelected) {
				const next = new Map(prev);
				filteredProducts.forEach((product) => next.delete(product.productName));
				return next;
			}
			const next = new Map(prev);
			filteredProducts.forEach((product) => {
				if (!next.has(product.productName)) {
					next.set(product.productName, 1);
				}
			});
			return next;
		});
	}, [filteredProducts]);

	const updateQuantity = useCallback(
		(productName: string, quantity: number) => {
			setQuantities((prev) => {
				const next = new Map(prev);
				next.set(productName, Math.max(1, Math.floor(quantity) || 1));
				return next;
			});
		},
		[],
	);

	const removeSelected = useCallback((productName: string) => {
		setQuantities((prev) => {
			const next = new Map(prev);
			next.delete(productName);
			return next;
		});
	}, []);

	const clearFilters = useCallback(() => {
		setSearch('');
		setCategory('All');
	}, []);

	useEffect(() => {
		if (!printData) return;
		const handleAfterPrint = () => setPrintData(null);
		window.addEventListener('afterprint', handleAfterPrint);
		window.print();
		return () => window.removeEventListener('afterprint', handleAfterPrint);
	}, [printData]);

	const hasActiveFilters = search.trim() !== '' || category !== 'All';

	return (
		<>
			<div className="min-h-screen bg-gray-50 print:hidden">
				<header className="border-b border-gray-200 bg-white">
					<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
						<div>
							<h1 className="text-xl font-bold text-gray-900">
								UV Wellness Center
							</h1>
							<p className="text-sm text-gray-500">Product Catalog</p>
						</div>
						{quantities.size > 0 && (
							<span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
								{quantities.size} selected
							</span>
						)}
					</div>
				</header>

				<div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:flex-row">
					<div className="min-w-0 flex-1">
						<div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="relative w-full sm:max-w-xs">
									<SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search by product name..."
										className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
									/>
								</div>
								<div className="relative w-full sm:max-w-xs">
									<TagIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
									<select
										value={category}
										onChange={(e) => setCategory(e.target.value)}
										className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
									>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
								</div>
								{hasActiveFilters && (
									<button
										type="button"
										onClick={clearFilters}
										className="text-sm font-medium text-green-700 hover:text-green-800 sm:ml-auto"
									>
										Clear filters
									</button>
								)}
							</div>
						</div>

						<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200 text-sm">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-3">
												<input
													type="checkbox"
													checked={
														filteredProducts.length > 0 &&
														filteredProducts.every((product) =>
															quantities.has(product.productName),
														)
													}
													onChange={toggleSelectAll}
													aria-label="Select all products"
													className="h-4 w-4 cursor-pointer accent-green-600"
												/>
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Product Name
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Category
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												VP
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												MRP
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Price 15
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Price 25
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Price 35
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Price 42
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
												Price 50
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 bg-white">
										{filteredProducts.map((product, index) => {
											const isSelected = quantities.has(product.productName);
											const rowClassName = isSelected
												? 'bg-green-50 hover:bg-green-100'
												: index % 2 === 1
													? 'bg-gray-50/60 hover:bg-gray-100'
													: 'bg-white hover:bg-gray-100';
											return (
												<tr key={product.productName} className={rowClassName}>
													<td className="px-4 py-3">
														<input
															type="checkbox"
															checked={isSelected}
															onChange={() =>
																toggleSelected(product.productName)
															}
															aria-label={`Select ${product.productName}`}
															className="h-4 w-4 cursor-pointer accent-green-600"
														/>
													</td>
													<td className="px-4 py-3 font-medium text-gray-800">
														{product.productName}
													</td>
													<td className="px-4 py-3 text-gray-600">
														{product.category}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.vp.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.mrp.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.price15.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.price25.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.price35.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.price42.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right text-gray-800">
														{product.price50.toFixed(2)}
													</td>
												</tr>
											);
										})}
										{filteredProducts.length === 0 && (
											<tr>
												<td colSpan={9} className="px-4 py-12 text-center">
													<InboxIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
													<p className="text-sm font-medium text-gray-500">
														No products found
													</p>
													<p className="text-xs text-gray-400">
														Try adjusting your search or category filter
													</p>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<aside className="w-full shrink-0 self-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:sticky lg:top-6 lg:w-80">
						<div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
							<h2 className="font-semibold text-gray-800">
								Selected Products ({selectedProducts.length})
							</h2>
						</div>

						{selectedProducts.length === 0 ? (
							<div className="px-4 py-10 text-center">
								<InboxIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
								<p className="text-sm text-gray-500">
									No products selected yet.
								</p>
							</div>
						) : (
							<ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
								{selectedProducts.map((product) => (
									<li
										key={product.productName}
										className="flex items-start justify-between gap-2 px-4 py-3"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-gray-800">
												{product.productName}
											</p>
											<p className="text-xs text-gray-500">
												{product.category}
											</p>
											<div className="mt-2 inline-flex items-center rounded-md border border-gray-300">
												<button
													type="button"
													onClick={() =>
														updateQuantity(
															product.productName,
															product.quantity - 1,
														)
													}
													aria-label={`Decrease quantity for ${product.productName}`}
													className="flex h-8 w-8 items-center justify-center rounded-l-md text-gray-500 hover:bg-gray-100"
												>
													<MinusIcon className="h-3.5 w-3.5" />
												</button>
												<input
													type="number"
													min={1}
													value={product.quantity}
													onChange={(e) =>
														updateQuantity(
															product.productName,
															Number(e.target.value),
														)
													}
													aria-label={`Quantity for ${product.productName}`}
													className="h-8 w-12 border-x border-gray-300 text-center text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												/>
												<button
													type="button"
													onClick={() =>
														updateQuantity(
															product.productName,
															product.quantity + 1,
														)
													}
													aria-label={`Increase quantity for ${product.productName}`}
													className="flex h-8 w-8 items-center justify-center rounded-r-md text-gray-500 hover:bg-gray-100"
												>
													<PlusIcon className="h-3.5 w-3.5" />
												</button>
											</div>
										</div>
										<button
											type="button"
											onClick={() => removeSelected(product.productName)}
											aria-label={`Remove ${product.productName}`}
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
										>
											<XIcon className="h-4 w-4" />
										</button>
									</li>
								))}
							</ul>
						)}

						{selectedProducts.length > 0 && (
							<div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
								<h3 className="mb-2 text-sm font-semibold text-gray-800">
									Totals
								</h3>
								<dl className="space-y-1 text-sm">
									<div className="flex justify-between">
										<dt className="text-gray-600">VP</dt>
										<dd className="text-gray-800">{totals.vp.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">MRP</dt>
										<dd className="text-gray-800">{totals.mrp.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Price 15</dt>
										<dd className="text-gray-800">
											{totals.price15.toFixed(2)}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Price 25</dt>
										<dd className="text-gray-800">
											{totals.price25.toFixed(2)}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Price 35</dt>
										<dd className="text-gray-800">
											{totals.price35.toFixed(2)}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Price 42</dt>
										<dd className="text-gray-800">
											{totals.price42.toFixed(2)}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Price 50</dt>
										<dd className="text-gray-800">
											{totals.price50.toFixed(2)}
										</dd>
									</div>
								</dl>
							</div>
						)}

						<div className="border-t border-gray-200 px-4 py-3">
							<button
								type="button"
								disabled={selectedProducts.length === 0}
								onClick={() => setIsPrintModalOpen(true)}
								className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
							>
								<PrinterIcon className="h-4 w-4" />
								Print
							</button>
						</div>
					</aside>
				</div>
			</div>

			{isPrintModalOpen && (
				<PrintOptionsModal
					products={selectedProducts}
					onCancel={() => setIsPrintModalOpen(false)}
					onConfirm={(title, priceLevel) => {
						setIsPrintModalOpen(false);
						setPrintData({ title, priceLevel });
					}}
				/>
			)}

			{printData && (
				<PrintPreview
					title={printData.title}
					priceLevel={printData.priceLevel}
					products={selectedProducts}
				/>
			)}
		</>
	);
}

export default ProductListing;

