import type { IProduct } from '../data/products.type';
import type { PriceLevel } from '../data/priceLevels';

interface PrintPreviewProps {
	title: string;
	priceLevel: PriceLevel;
	products: (IProduct & { quantity: number })[];
}

function PrintPreview({ title, priceLevel, products }: PrintPreviewProps) {
	const netTotal = products.reduce(
		(sum, product) => sum + product.mrp * product.quantity,
		0,
	);
	const youPay = products.reduce(
		(sum, product) => sum + product[priceLevel] * product.quantity,
		0,
	);
	const profit = netTotal - youPay;

	return (
		<div className="hidden p-8 text-black print:block">
			<h1 className="mb-4 text-2xl font-bold">{title}</h1>

			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-black">
						<th className="py-1 text-left">Product</th>
						<th className="py-1 text-right">MRP</th>
						<th className="py-1 text-right">Qty</th>
						<th className="py-1 text-right">Total</th>
					</tr>
				</thead>
				<tbody>
					{products.map((product) => (
						<tr key={product.productName}>
							<td className="py-1">{product.productName}</td>
							<td className="py-1 text-right">{product.mrp.toFixed(2)}</td>
							<td className="py-1 text-right">{product.quantity}</td>
							<td className="py-1 text-right">
								{(product.mrp * product.quantity).toFixed(2)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="mt-4 border-t border-black pt-2 text-sm">
				<div className="flex justify-between py-1">
					<span>Total Price</span>
					<span>{netTotal.toFixed(2)}</span>
				</div>
				<div className="flex justify-between py-1">
					<span>You Pay</span>
					<span>{youPay.toFixed(2)}</span>
				</div>
				<div className="flex justify-between py-1 font-semibold">
					<span>Profit</span>
					<span>{profit.toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}

export default PrintPreview;

