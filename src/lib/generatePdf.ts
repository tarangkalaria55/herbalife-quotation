import jsPDF from 'jspdf';
import type { IProduct } from '../data/products.type';
import type { PriceLevel } from '../data/priceLevels';

interface GeneratePdfOptions {
	title: string;
	priceLevel: PriceLevel;
	products: (IProduct & { quantity: number })[];
}

const MARGIN = 14;
const LINE_HEIGHT = 7;
const PAGE_WIDTH = 210;

export function generatePdf({ title, priceLevel, products }: GeneratePdfOptions) {
	const doc = new jsPDF();
	let y = 20;

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(18);
	doc.text(title, MARGIN, y);
	y += 10;

	doc.setFont('courier', 'normal');
	doc.setFontSize(11);

	let netTotal = 0;
	let youPay = 0;

	products.forEach((product) => {
		const lineTotal = product.mrp * product.quantity;
		netTotal += lineTotal;
		youPay += product[priceLevel] * product.quantity;

		const line = `${product.productName} - ${product.mrp.toFixed(2)} * ${product.quantity} = ${lineTotal.toFixed(2)}`;
		doc.text(line, MARGIN, y);
		y += LINE_HEIGHT;
	});

	y += 2;
	doc.setLineDashPattern([1, 1], 0);
	doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
	doc.setLineDashPattern([], 0);
	y += LINE_HEIGHT + 2;

	const profit = netTotal - youPay;

	doc.setFont('courier', 'normal');
	doc.text(`Total Price = ${netTotal.toFixed(2)}`, MARGIN, y);
	y += LINE_HEIGHT;
	doc.text(`You Pay = ${youPay.toFixed(2)}`, MARGIN, y);
	y += LINE_HEIGHT;
	doc.setFont('courier', 'bold');
	doc.text(`Profit = ${profit.toFixed(2)}`, MARGIN, y);

	doc.save(`${title.trim() || 'order-summary'}.pdf`);
}
