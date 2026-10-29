import { app } from "./app.js";
import { config } from "./config.js";
import { migrate, pool } from "./db.js";

try {
	await migrate();
	const server = app.listen(config.port, () => {
		console.info(`${config.projectName} API listening on port ${config.port}`);
	});

	const shutdown = async () => {
		server.close(async (error) => {
			if (error) {
				console.error("HTTP server shutdown failed:", error);
				process.exitCode = 1;
			}
			await pool.end();
		});
	};

	process.once("SIGINT", shutdown);
	process.once("SIGTERM", shutdown);
} catch (error) {
	console.error("API startup failed:", error);
	await pool.end();
	process.exitCode = 1;
}
