module.exports = {
	testPathIgnorePatterns: ['/node_modules/', '/.next/'],
	setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
	},
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'\\.(scss|css|sass)$': 'identity-obj-proxy',
	},
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.tsx',
		'!src/**/*.test.tsx',
		'!src/**/_app.tsx',
		'!src/**/_document.tsx',
	],
	collectReporters: ['lcov', 'json'],
};
