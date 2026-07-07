import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import type { IProduct } from '../data/products.type';
import { PRICE_LEVELS, type PriceLevel } from '../data/priceLevels';
import { Button } from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

interface PrintOptionsModalProps {
	open: boolean;
	products: (IProduct & { quantity: number })[];
	onOpenChange: (open: boolean) => void;
	onConfirm: (title: string, priceLevel: PriceLevel) => void;
}

function PrintOptionsModal({
	open,
	products,
	onOpenChange,
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Printer className="h-4.5 w-4.5" />
						</span>
						Print Options
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="print-title">PDF Title</Label>
						<Input
							id="print-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter title"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="print-price-level">Price Level</Label>
						<Select
							value={priceLevel}
							onValueChange={(value) => setPriceLevel(value as PriceLevel)}
						>
							<SelectTrigger id="print-price-level" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PRICE_LEVELS.map((level) => (
									<SelectItem key={level.value} value={level.value}>
										{level.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<dl className="space-y-1 rounded-lg bg-muted px-3 py-2 text-sm">
						<div className="flex justify-between">
							<dt className="text-muted-foreground">Total MRP</dt>
							<dd>{totals.totalMrp.toFixed(2)}</dd>
						</div>
						{priceLevel !== 'mrp' && (
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Total {priceLevelLabel}</dt>
								<dd>{totals.totalSelected.toFixed(2)}</dd>
							</div>
						)}
						<div className="flex justify-between">
							<dt className="text-muted-foreground">Total VP</dt>
							<dd>{totals.totalVp.toFixed(2)}</dd>
						</div>
						<div className="flex justify-between font-semibold">
							<dt>Profit</dt>
							<dd>{totals.profit.toFixed(2)}</dd>
						</div>
					</dl>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={() => onConfirm(title.trim() || 'Order Summary', priceLevel)}
					>
						<Printer className="h-4 w-4" />
						Print
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default PrintOptionsModal;
