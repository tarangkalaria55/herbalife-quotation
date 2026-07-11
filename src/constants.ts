import type { PriceLevel } from './data/priceLevels';

export const PROFIT_THRESHOLD = 0.005;

export const SHOW_CATEGORY = false;

export const PRICE_LEVELS: { value: PriceLevel; label: string }[] = [
	{ value: 'mrp', label: 'MRP' },
	{ value: 'bronze', label: 'Bronze' },
	{ value: 'silver', label: 'Silver' },
	{ value: 'gold', label: 'Gold' },
	{ value: 'price25', label: 'Price 25' },
	{ value: 'price35', label: 'Price 35' },
	{ value: 'price42', label: 'Price 42' },
	{ value: 'price50', label: 'Price 50' },
];
