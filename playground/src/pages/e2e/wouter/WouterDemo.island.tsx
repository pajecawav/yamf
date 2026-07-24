import type { Event } from "hono/jsx";
import { useSearchParams } from "wouter";

export const WouterDemo = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const q = searchParams.get("q") ?? "";
	const v = searchParams.get("v") ?? 0;

	const onChange = (e: Event) => {
		const target = e.target as HTMLInputElement;

		setSearchParams(prev => {
			prev.set(target.name, target.value);
			return prev;
		});
	};

	return (
		<div>
			<input name="q" type="text" value={q} onChange={onChange} />
			<input name="v" type="number" value={v} onChange={onChange} />
		</div>
	);
};
