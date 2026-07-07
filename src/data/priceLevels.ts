export type PriceLevel = 'mrp' | 'price15' | 'price25' | 'price35' | 'price42' | 'price50';

export const PRICE_LEVELS: { value: PriceLevel; label: string }[] = [
	{ value: 'mrp', label: 'MRP' },
	{ value: 'price15', label: 'Price 15' },
	{ value: 'price25', label: 'Price 25' },
	{ value: 'price35', label: 'Price 35' },
	{ value: 'price42', label: 'Price 42' },
	{ value: 'price50', label: 'Price 50' },
];
