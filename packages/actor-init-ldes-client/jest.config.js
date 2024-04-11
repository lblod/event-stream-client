module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {"^.+\\.[t|j]sx?$": "ts-jest"},
    testMatch: ["**/test/**/*-test.ts"],
    maxWorkers: 1,
    testTimeout: 10000,
};