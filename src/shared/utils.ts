export const js = (str: TemplateStringsArray, ...args: unknown[]) => {
	return str.reduce((acc, cur, i) => {
		return acc + cur + String(args[i]);
	}, "");
};
