import mongoose from "mongoose";
import pino from "pino";

const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL =
	process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug");
const MAX_RETRIES = process.env.DB_MAX_RETRIES
	? parseInt(process.env.DB_MAX_RETRIES)
	: 5;
const RETRY_DELAY_MS = process.env.DB_RETRY_DELAY_MS
	? parseInt(process.env.DB_RETRY_DELAY_MS)
	: 5000;
const KEEPALIVE_INITIAL_DELAY_MS = 300000;

const baseTransport =
	NODE_ENV === "production"
		? undefined
		: pino.transport({
				target: "pino-pretty",
				options: {
					translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
					ignore: "pid,hostname",
				},
			});

const logger = pino(
	{
		level: LOG_LEVEL,
		timestamp: pino.stdTimeFunctions.isoTime,
	},
	baseTransport,
);

const childLogger = logger.child({
	service: "prompteria-api",
	environment: NODE_ENV,
});

process.on("uncaughtException", (err: Error) => {
	childLogger.error({ err }, "uncaughtException");
	process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
	childLogger.error({ err }, "unhandledRejection");
	process.exit(1);
});

let isConnected = false;
let connectionAttempts = 0;

export const connectToDb = async () => {
	mongoose.set("strictQuery", true);

	if (isConnected) {
		childLogger.info("=> MongoDB is already connected");
		return;
	}

	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		childLogger.error(
			"ERROR: MONGODB_URI is not defined in the environment variables",
		);
		return;
	}

	try {
		if (connectionAttempts >= MAX_RETRIES) {
			childLogger.error("=> Max connection attempts reached. Giving up.");
			return;
		}

		childLogger.info(
			`=> Attempting to connect to MongoDB (attempt ${
				connectionAttempts + 1
			}/${MAX_RETRIES})...`,
		);
		await mongoose.connect(mongoUri, {
			dbName: "prompteria",
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
			heartbeatFrequencyMS: KEEPALIVE_INITIAL_DELAY_MS,
		});

		isConnected = true;
		connectionAttempts = 0;
		childLogger.info("=> MongoDB connected successfully!");
	} catch (error) {
		connectionAttempts++;
		childLogger.error(
			{ err: error },
			`=> MongoDB connection error (attempt ${connectionAttempts}/${MAX_RETRIES})`,
		);

		const retryDelay = Math.min(
			RETRY_DELAY_MS * Math.pow(2, connectionAttempts),
			30000,
		);
		childLogger.info(`=> Retrying in ${retryDelay / 1000} seconds...`);
		setTimeout(connectToDb, retryDelay);
	}
};
