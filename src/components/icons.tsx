interface IconProps {
	className?: string;
}

export function SearchIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	);
}

export function TagIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2L4 3a1 1 0 0 0-1 1l.2 5.59a2 2 0 0 0 .63 1.41l9.58 9.59a2 2 0 0 0 2.82 0l4.36-4.36a2 2 0 0 0 0-2.82Z" />
			<circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function PrinterIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M6 9V3h12v6" />
			<rect x="4" y="9" width="16" height="8" rx="1.5" />
			<path d="M6 14h12v7H6z" />
		</svg>
	);
}

export function MinusIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M5 12h14" />
		</svg>
	);
}

export function PlusIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
	);
}

export function XIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M6 6l12 12M18 6 6 18" />
		</svg>
	);
}

export function InboxIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M4 12h4l2 3h4l2-3h4" />
			<path d="M5.5 6h13l2 6.5V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-5.5Z" />
		</svg>
	);
}

