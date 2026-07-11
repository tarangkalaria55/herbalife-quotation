import { useCallback, useMemo, useState } from 'react';
import { Download, Inbox, Minus, Plus, Search, Tag, X } from 'lucide-react';
import { products } from '../data/products';
import PrintOptionsModal from './PrintOptionsModal';
import { downloadPdf, printPdf } from '../lib/generatePdf';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';
import { SHOW_CATEGORY } from '@/constants';

function ProductListing() {
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('All');
	const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
	const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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
				bronze: acc.bronze + product.bronze * product.quantity,
				silver: acc.silver + product.silver * product.quantity,
				gold: acc.gold + product.gold * product.quantity,
				price25: acc.price25 + product.price25 * product.quantity,
				price35: acc.price35 + product.price35 * product.quantity,
				price42: acc.price42 + product.price42 * product.quantity,
				price50: acc.price50 + product.price50 * product.quantity,
			}),
			{
				vp: 0,
				mrp: 0,
				bronze: 0,
				silver: 0,
				gold: 0,
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

	const hasActiveFilters = search.trim() !== '' || category !== 'All';
	const allFilteredSelected =
		filteredProducts.length > 0 &&
		filteredProducts.every((product) => quantities.has(product.productName));

	return (
		<>
			<div className="min-h-screen bg-muted/30">
				<header className="border-b bg-background">
					<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
						<div>
							<h1 className="text-xl font-bold text-foreground">
								UV Wellness Center
							</h1>
							<p className="text-sm text-muted-foreground">Product Catalog</p>
						</div>
						{quantities.size > 0 && (
							<Badge className="px-3 py-1 text-sm">
								{quantities.size} selected
							</Badge>
						)}
					</div>
				</header>

				<div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:flex-row">
					<div className="min-w-0 flex-1 space-y-4">
						<Card>
							<CardContent>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									<div className="relative w-full sm:max-w-xs">
										<Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											type="text"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											placeholder="Search by product name..."
											className="pl-8"
										/>
									</div>
									{SHOW_CATEGORY && (
										<Select
											value={category}
											onValueChange={(value) => setCategory(value ?? 'All')}
										>
											<SelectTrigger className="w-full sm:max-w-xs">
												<Tag className="h-4 w-4 text-muted-foreground" />
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
									{hasActiveFilters && (
										<Button
											type="button"
											variant="link"
											onClick={clearFilters}
											className="sm:ml-auto"
										>
											Clear filters
										</Button>
									)}
								</div>
							</CardContent>
						</Card>

						<Card className="overflow-hidden py-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-10">
											<Checkbox
												checked={allFilteredSelected}
												onCheckedChange={toggleSelectAll}
												aria-label="Select all products"
											/>
										</TableHead>
										<TableHead>Product Name</TableHead>
										{SHOW_CATEGORY && <TableHead>Category</TableHead>}

										<TableHead className="text-right">VP</TableHead>
										<TableHead className="text-right">MRP</TableHead>
										<TableHead className="text-right">Bronze</TableHead>
										<TableHead className="text-right">Silver</TableHead>
										<TableHead className="text-right">Gold</TableHead>
										<TableHead className="text-right">Price 25</TableHead>
										<TableHead className="text-right">Price 35</TableHead>
										<TableHead className="text-right">Price 42</TableHead>
										<TableHead className="text-right">Price 50</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredProducts.map((product, index) => {
										const isSelected = quantities.has(product.productName);
										return (
											<TableRow
												key={product.productName}
												className={
													isSelected
														? 'bg-primary/10 hover:bg-primary/15'
														: index % 2 === 1
															? 'bg-muted/40'
															: ''
												}
											>
												<TableCell>
													<Checkbox
														checked={isSelected}
														onCheckedChange={() =>
															toggleSelected(product.productName)
														}
														aria-label={`Select ${product.productName}`}
													/>
												</TableCell>
												<TableCell className="font-medium">
													{product.productName}
												</TableCell>
												{SHOW_CATEGORY && (
													<TableCell className="text-muted-foreground">
														{product.category}
													</TableCell>
												)}
												<TableCell className="text-right">
													{product.vp.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.mrp.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.bronze.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.silver.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.gold.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.price25.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.price35.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.price42.toFixed(2)}
												</TableCell>
												<TableCell className="text-right">
													{product.price50.toFixed(2)}
												</TableCell>
											</TableRow>
										);
									})}
									{filteredProducts.length === 0 && (
										<TableRow>
											<TableCell colSpan={9} className="py-12 text-center">
												<Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
												<p className="text-sm font-medium text-muted-foreground">
													No products found
												</p>
												<p className="text-xs text-muted-foreground/70">
													Try adjusting your search or category filter
												</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</Card>
					</div>

					<Card className="w-full shrink-0 self-start py-0 lg:sticky lg:top-6 lg:w-80">
						<CardHeader className="border-b py-3">
							<CardTitle>
								Selected Products ({selectedProducts.length})
							</CardTitle>
						</CardHeader>

						{selectedProducts.length === 0 ? (
							<CardContent className="py-10 text-center">
								<Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
								<p className="text-sm text-muted-foreground">
									No products selected yet.
								</p>
							</CardContent>
						) : (
							<ul className="max-h-[70vh] divide-y overflow-y-auto">
								{selectedProducts.map((product) => (
									<li
										key={product.productName}
										className="flex items-start justify-between gap-2 px-4 py-3"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{product.productName}
											</p>
											<p className="text-xs text-muted-foreground">
												{product.category}
											</p>
											<div className="mt-2 inline-flex items-center rounded-lg border border-input">
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													onClick={() =>
														updateQuantity(
															product.productName,
															product.quantity - 1,
														)
													}
													aria-label={`Decrease quantity for ${product.productName}`}
													className="rounded-r-none"
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												<Input
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
													className="h-8 w-12 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													onClick={() =>
														updateQuantity(
															product.productName,
															product.quantity + 1,
														)
													}
													aria-label={`Increase quantity for ${product.productName}`}
													className="rounded-l-none"
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() => removeSelected(product.productName)}
											aria-label={`Remove ${product.productName}`}
											className="text-muted-foreground hover:text-destructive"
										>
											<X className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
						)}

						{selectedProducts.length > 0 && (
							<div className="border-t bg-muted/50 px-4 py-3">
								<h3 className="mb-2 text-sm font-semibold">Totals</h3>
								<dl className="space-y-1 text-sm">
									<div className="flex justify-between">
										<dt className="text-muted-foreground">VP</dt>
										<dd>{totals.vp.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">MRP</dt>
										<dd>{totals.mrp.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Bronze</dt>
										<dd>{totals.bronze.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Silver</dt>
										<dd>{totals.silver.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Gold</dt>
										<dd>{totals.gold.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Price 25</dt>
										<dd>{totals.price25.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Price 35</dt>
										<dd>{totals.price35.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Price 42</dt>
										<dd>{totals.price42.toFixed(2)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Price 50</dt>
										<dd>{totals.price50.toFixed(2)}</dd>
									</div>
								</dl>
							</div>
						)}

						<CardFooter className="border-t py-3">
							<Button
								type="button"
								disabled={selectedProducts.length === 0}
								onClick={() => setIsPrintModalOpen(true)}
								className="w-full"
							>
								<Download className="h-4 w-4" />
								Download PDF
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>

			<PrintOptionsModal
				open={isPrintModalOpen}
				products={selectedProducts}
				onOpenChange={setIsPrintModalOpen}
				onDownload={(title, priceLevel) => {
					downloadPdf({ title, priceLevel, products: selectedProducts });
					setIsPrintModalOpen(false);
				}}
				onPrint={(title, priceLevel) => {
					printPdf({ title, priceLevel, products: selectedProducts });
					setIsPrintModalOpen(false);
				}}
			/>
		</>
	);
}

export default ProductListing;
