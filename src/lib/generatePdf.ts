import type { IProduct } from '../data/products.type';
import type { PriceLevel } from '../data/priceLevels';

interface PdfOptions {
	title: string;
	priceLevel: PriceLevel;
	products: (IProduct & { quantity: number })[];
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;

const BRAND_GREEN: [number, number, number] = [22, 163, 74];
const BRAND_GREEN_DARK: [number, number, number] = [21, 128, 61];
const BRAND_GREEN_LIGHT: [number, number, number] = [240, 253, 244];
const TEXT_DARK: [number, number, number] = [31, 41, 55];
const TEXT_MUTED: [number, number, number] = [107, 114, 128];
const BORDER_LIGHT: [number, number, number] = [229, 231, 235];

function pad(value: number) {
	return value.toString().padStart(2, '0');
}

function buildFileBaseName(title: string) {
	const now = new Date();
	const timestamp = [
		now.getFullYear(),
		pad(now.getMonth() + 1),
		pad(now.getDate()),
		pad(now.getHours()),
		pad(now.getMinutes()),
		pad(now.getSeconds()),
	].join('');
	const safeTitle = (title.trim() || 'Order Summary').replace(
		/[\\/:*?"<>|]+/g,
		'-',
	);
	return `${safeTitle}-${timestamp}`;
}

async function buildOrderSummaryPdf({ title, priceLevel, products }: PdfOptions) {
	const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable'),
	]);

	const doc = new jsPDF();
	const fileBaseName = buildFileBaseName(title);
	doc.setProperties({ title: fileBaseName });

	const netTotal = products.reduce(
		(sum, product) => sum + product.mrp * product.quantity,
		0,
	);
	const youPay = products.reduce(
		(sum, product) => sum + product[priceLevel] * product.quantity,
		0,
	);
	const profit = netTotal - youPay;
	const generatedOn = new Date().toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const drawHeader = () => {
		doc.setFillColor(...BRAND_GREEN);
		doc.rect(0, 0, PAGE_WIDTH, 24, 'F');

		doc.setTextColor(255, 255, 255);
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(14);
		doc.text('UV Wellness Center', MARGIN, 15);

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(9);
		doc.text(generatedOn, PAGE_WIDTH - MARGIN, 15, { align: 'right' });
	};

	const drawFooter = (pageNumber: number, pageCount: number) => {
		doc.setDrawColor(...BORDER_LIGHT);
		doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(8);
		doc.setTextColor(...TEXT_MUTED);
		doc.text('UV Wellness Center - Product Catalog', MARGIN, PAGE_HEIGHT - 9);
		doc.text(
			`Page ${pageNumber} of ${pageCount}`,
			PAGE_WIDTH - MARGIN,
			PAGE_HEIGHT - 9,
			{ align: 'right' },
		);
	};

	drawHeader();

	doc.setTextColor(...TEXT_DARK);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(18);
	doc.text(title, MARGIN, 36);

	autoTable(doc, {
		startY: 43,
		margin: { left: MARGIN, right: MARGIN, top: 28, bottom: 20 },
		head: [['Product', 'MRP', 'Qty', 'Total']],
		body: products.map((product) => [
			product.productName,
			product.mrp.toFixed(2),
			String(product.quantity),
			(product.mrp * product.quantity).toFixed(2),
		]),
		theme: 'grid',
		styles: {
			fontSize: 10,
			textColor: TEXT_DARK,
			lineColor: BORDER_LIGHT,
			lineWidth: 0.2,
		},
		headStyles: {
			fillColor: BRAND_GREEN,
			textColor: [255, 255, 255],
			fontStyle: 'bold',
			lineColor: BRAND_GREEN,
		},
		alternateRowStyles: {
			fillColor: BRAND_GREEN_LIGHT,
		},
		columnStyles: {
			1: { halign: 'right' },
			2: { halign: 'right' },
			3: { halign: 'right' },
		},
		didDrawPage: () => {
			if (doc.getCurrentPageInfo().pageNumber > 1) {
				drawHeader();
			}
		},
	});

	const finalY = (doc as unknown as { lastAutoTable: { finalY: number } })
		.lastAutoTable.finalY;

	let y = finalY + 10;
	if (y > PAGE_HEIGHT - 60) {
		doc.addPage();
		drawHeader();
		y = 36;
	}

	const boxWidth = 80;
	const boxX = PAGE_WIDTH - MARGIN - boxWidth;
	const boxHeight = 34;

	doc.setFillColor(...BRAND_GREEN_LIGHT);
	doc.setDrawColor(...BORDER_LIGHT);
	doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, 'FD');

	const rowY = y + 9;
	const lineGap = 9;

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(10);
	doc.setTextColor(...TEXT_MUTED);
	doc.text('Total Price', boxX + 5, rowY);
	doc.text('You Pay', boxX + 5, rowY + lineGap);

	doc.setTextColor(...TEXT_DARK);
	doc.text(netTotal.toFixed(2), boxX + boxWidth - 5, rowY, { align: 'right' });
	doc.text(youPay.toFixed(2), boxX + boxWidth - 5, rowY + lineGap, {
		align: 'right',
	});

	doc.setDrawColor(...BORDER_LIGHT);
	doc.line(
		boxX + 5,
		rowY + lineGap + 4,
		boxX + boxWidth - 5,
		rowY + lineGap + 4,
	);

	doc.setFont('helvetica', 'bold');
	doc.setTextColor(...BRAND_GREEN_DARK);
	doc.text('Profit', boxX + 5, rowY + lineGap * 2 + 2);
	doc.text(profit.toFixed(2), boxX + boxWidth - 5, rowY + lineGap * 2 + 2, {
		align: 'right',
	});

	const pageCount = doc.getNumberOfPages();
	for (let page = 1; page <= pageCount; page += 1) {
		doc.setPage(page);
		drawFooter(page, pageCount);
	}

	return { doc, fileBaseName };
}

export async function downloadPdf(options: PdfOptions) {
	const { doc, fileBaseName } = await buildOrderSummaryPdf(options);
	const filename = `${fileBaseName}.pdf`;
	const blob = doc.output('blob');
	const file = new File([blob], filename, { type: 'application/pdf' });
	const url = URL.createObjectURL(file);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export async function printPdf(options: PdfOptions) {
	const { doc, fileBaseName } = await buildOrderSummaryPdf(options);
	const blob = doc.output('blob');
	const filename = `${fileBaseName}.pdf`;
	const file = new File([blob], filename, { type: 'application/pdf' });
	const url = URL.createObjectURL(file);
	const printWindow = window.open(url, '_blank');

	if (!printWindow) {
		URL.revokeObjectURL(url);
		return;
	}

	printWindow.addEventListener('load', () => {
		printWindow.focus();
		printWindow.print();
	});
}
