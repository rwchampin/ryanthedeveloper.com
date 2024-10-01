/**
 * @file use-logger-store.ts
 * @description This file defines a custom logger store using Zustand for state management.
 * It provides functionality for adding styled logs, clearing logs, and subscribing to log changes.
 */

import { create } from 'zustand';

/**
 * @typedef {Object} LoggerStore
 * @property {string[]} logs - Array to store log messages
 * @property {function} addLog - Function to add a new log
 * @property {function} clearLogs - Function to clear all logs
 * @property {function} subscribe - Function to subscribe to store changes
 */
type LoggerStore = {
	logs: string[];
	addLog: (log: string) => void;
	clearLogs: () => void;
	subscribe: (listener: () => void) => () => void;
};

/**
 * @constant
 * @type {Object.<string, {color: string, background: string}>}
 * @description Map of log types to their corresponding styles
 */
const colorMap = {
	'error': {
		color: '#FFF',

		background: '#8B0000',
	},
	'warn': {
		color: '#000',
// a better muted yellow
		background: '#FFD700',
	},
	'info': {
		color: '#FFF',

		background: '#4682B4',
	},
	'debug': {


		color: '#000',
		background: '#00CED1',
	},
	'log': {


		color: '#2F4F4F',
		background: '#F0F8FF',	}
};

/**
 * @function
 * @name useLoggerStore
 * @description Creates and returns a Zustand store for managing logs
 * @returns {LoggerStore} The logger store
 */
const useLoggerStore = create<LoggerStore>((set, get) => ({
	logs: [],
	addLog: (log: string) => set((state) => {
		const styledLog = `%c${log}`;
		const logType = log.split(':')[0].toLowerCase();
		const { color = 'black', background = '#FFF' } = colorMap[logType] || {};
		const logStyle = `color: ${color}; background: ${background}; padding: 2px 6px; border-radius: 16px; font-weight: bold; font-family: monospace;`;
		console.log(styledLog, logStyle); // Log to console for immediate feedback
		return { logs: [...state.logs, styledLog, logStyle] };
	}),
	clearLogs: () => set({ logs: [] }),
	subscribe: (listener) => {
		const unsubscribe = get().subscribe(listener);
		return unsubscribe;
	},
}));

/**
 * @function
 * @name getFormattedTimestamp
 * @description Returns a formatted timestamp string
 * @returns {string} Formatted timestamp
 */
const getFormattedTimestamp = (): string => {
	const now = new Date();
	return now.toISOString();
};

/**
 * @function
 * @name createLogger
 * @description Creates a logger object with methods for different log levels
 * @param {LoggerStore} store - The logger store
 * @returns {Object} Logger object with methods for different log levels
 */
const createLogger = (store: LoggerStore) => ({
	error: (message: string) => store.addLog(`ERROR: [${getFormattedTimestamp()}] ${message}`),
	warn: (message: string) => store.addLog(`WARN: [${getFormattedTimestamp()}] ${message}`),
	info: (message: string) => store.addLog(`INFO: [${getFormattedTimestamp()}] ${message}`),
	debug: (message: string) => store.addLog(`DEBUG: [${getFormattedTimestamp()}] ${message}`),
	log: (message: string) => store.addLog(`LOG: [${getFormattedTimestamp()}] ${message}`),
});

export const logger = createLogger(useLoggerStore);
export default useLoggerStore;
