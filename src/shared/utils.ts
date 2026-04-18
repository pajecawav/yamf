export const js = (str: TemplateStringsArray, ...args: unknown[]): string => {
	return str.reduce((acc, cur, i) => {
		return acc + cur + String(args[i]);
	}, "");
};
