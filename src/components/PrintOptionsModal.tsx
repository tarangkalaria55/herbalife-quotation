import { useMemo, useState } from 'react';
import type { IProduct } from '../data/products.type';
import { PRICE_LEVELS, type PriceLevel } from '../data/priceLevels';
import { PrinterIcon } from './icons';

interface PrintOptionsModalProps {
	products: (IProduct & { quantity: number })[];
	onCancel: () => void;
	onConfirm: (title: string, priceLevel: PriceLevel) => void;
}

function PrintOptionsModal({
	products,
	onCancel,
	onConfirm,
}: PrintOptionsModalProps) {
	const [title, setTitle] = useState('Order Summary');
	const [priceLevel, setPriceLevel] = useState<PriceLevel>('price15');

	const totals = useMemo(() => {
		const totalMrp = products.reduce(
			(sum, product) => sum + product.mrp * product.quantity,
			0,
		);
		const totalVp = products.reduce(
			(sum, product) => sum + product.vp * product.quantity,
			0,
		);
		const totalSelected = products.reduce(
			(sum, product) => sum + product[priceLevel] * product.quantity,
			0,
		);
		return {
			totalMrp,
			totalVp,
			totalSelected,
			profit: totalMrp - totalSelected,
		};
	}, [products, priceLevel]);

	const priceLevelLabel =
		PRICE_LEVELS.find((level) => level.value === priceLevel)?.label ?? '';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
				<div className="mb-4 flex items-center gap-2">
					<span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
						<PrinterIcon className="h-4.5 w-4.5" />
					</span>
					<h2 className="text-lg font-semibold text-gray-800">Print Options</h2>
				</div>

				<label className="mb-1 block text-sm font-medium text-gray-700">
					PDF Title
				</label>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter title"
					className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
				/>

				<label className="mb-1 block text-sm font-medium text-gray-700">
					Price Level
				</label>
				<select
					value={priceLevel}
					onChange={(e) => setPriceLevel(e.target.value as PriceLevel)}
					className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
				>
					{PRICE_LEVELS.map((level) => (
						<option key={level.value} value={level.value}>
							{level.label}
						</option>
					))}
				</select>

				<dl className="mb-6 space-y-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
					<div className="flex justify-between">
						<dt className="text-gray-600">Total MRP</dt>
						<dd className="text-gray-800">{totals.totalMrp.toFixed(2)}</dd>
					</div>
					{priceLevel !== 'mrp' && (
						<div className="flex justify-between">
							<dt className="text-gray-600">Total {priceLevelLabel}</dt>
							<dd className="text-gray-800">
								{totals.totalSelected.toFixed(2)}
							</dd>
						</div>
					)}
					<div className="flex justify-between">
						<dt className="text-gray-600">Total VP</dt>
						<dd className="text-gray-800">{totals.totalVp.toFixed(2)}</dd>
					</div>
					<div className="flex justify-between font-semibold">
						<dt className="text-gray-800">Profit</dt>
						<dd className="text-gray-800">{totals.profit.toFixed(2)}</dd>
					</div>
				</dl>

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() =>
							onConfirm(title.trim() || 'Order Summary', priceLevel)
						}
						className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
					>
						<PrinterIcon className="h-4 w-4" />
						Print
					</button>
				</div>
			</div>
		</div>
	);
}

export default PrintOptionsModal;

