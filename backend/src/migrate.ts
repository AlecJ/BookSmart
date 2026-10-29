import { migrate, pool } from "./db.js";

try {
	await migrate();
	console.info("Database schema is ready.");
} catch (error) {
	console.error("Database schema setup failed:", error);
	process.exitCode = 1;
} finally {
	await pool.end();
}
