import dotenv from "dotenv";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || "../.env" });

const parseOrigins = (value: string | undefined): string[] =>
	(value || "")
		.split(",")
		.map((origin) => origin.trim().replace(/\/+$/, ""))
		.filter(Boolean);

const environment = process.env.ENVIRONMENT || "development";

function secretKey(): string {
	if (process.env.SECRET_KEY) return process.env.SECRET_KEY;
	if (environment !== "development") {
		throw new Error("SECRET_KEY must be set outside development.");
	}
	return "development-only-change-me";
}

export const config = {
	port: Number(process.env.PORT || 8000),
	apiPrefix: process.env.API_V1_STR || "/api/v1",
	secretKey: secretKey(),
	tokenExpiryMinutes: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 60 * 24 * 7),
	projectName: process.env.PROJECT_NAME || "BookSmart",
	environment,
	frontendHost: process.env.FRONTEND_HOST || "http://localhost:5173",
	corsOrigins: [
		process.env.FRONTEND_HOST || "http://localhost:5173",
		...parseOrigins(process.env.BACKEND_CORS_ORIGINS),
	].map((origin) => origin.replace(/\/+$/, "")),
	googleApiKey: process.env.GOOGLE_API_KEY || "",
	openAiApiKey: process.env.OPENAI_API_KEY || "",
	openAiModel: process.env.OPENAI_MODEL || "gpt-5-nano",
	// Chapter lists need real knowledge of the book: in testing, nano models
	// confidently gave wrong chapter counts where gpt-5.4-mini was exact.
	openAiChapterModel: process.env.OPENAI_CHAPTER_MODEL || "gpt-5.4-mini",
	databaseUrl: process.env.DATABASE_URL || "",
	postgres: {
		host: process.env.POSTGRES_SERVER || "localhost",
		port: Number(process.env.POSTGRES_PORT || 5432),
		database: process.env.POSTGRES_DB || "app",
		user: process.env.POSTGRES_USER || "postgres",
		password: process.env.POSTGRES_PASSWORD || "",
		ssl: useSsl(process.env.PGSSLMODE, process.env.POSTGRES_SERVER || "localhost"),
	},
};

// libpq (used by the former Python backend) defaults to sslmode=prefer, trying
// SSL before plain connections; node-postgres has no such fallback. Without an
// explicit PGSSLMODE, use SSL for any host except local ones and single-label
// Docker service names such as "db", which typically don't support it.
function useSsl(mode: string | undefined, host: string): boolean {
	if (mode) return !["disable", "allow"].includes(mode);
	const isLocal =
		["localhost", "127.0.0.1", "::1"].includes(host) || !host.includes(".");
	return !isLocal;
}

export function getDatabaseConfig() {
	if (config.databaseUrl) {
		return {
			connectionString: config.databaseUrl,
			ssl: config.postgres.ssl ? { rejectUnauthorized: false } : undefined,
		};
	}
	return {
		...config.postgres,
		ssl: config.postgres.ssl ? { rejectUnauthorized: false } : undefined,
	};
}
