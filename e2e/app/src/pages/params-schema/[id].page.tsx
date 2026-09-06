import { definePage, type StandardSchemaV1 } from "@pajecawav/yamf";

const paramsSchema: StandardSchemaV1<unknown, { id: number }> = {
	"~standard": {
		version: 1 as const,
		vendor: "test",
		validate: async value => {
			const raw = value as Record<string, string | undefined> | undefined;

			if (!raw?.id || !/^\d+$/.test(raw.id)) {
				return { issues: [{ message: "id must be numeric" }] };
			}

			return { value: { id: Number(raw.id) } };
		},
	},
};

const querySchema: StandardSchemaV1<unknown, { page: number }> = {
	"~standard": {
		version: 1 as const,
		vendor: "test",
		validate: async value => {
			const raw = value as Record<string, string | undefined> | undefined;
			const page = raw?.page;

			if (page !== undefined && !/^\d+$/.test(page)) {
				return { issues: [{ message: "page must be numeric" }] };
			}

			return { value: { page: page === undefined ? 1 : Number(page) } };
		},
	},
};

export default definePage({
	params: paramsSchema,
	query: querySchema,
	render: (_event, { params, query }) => {
		return (
			<p data-testid="schema-values">
				{params.id}:{query.page}
			</p>
		);
	},
});
