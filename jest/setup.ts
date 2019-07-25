import P from 'promise/setimmediate';

global.Promise = P;

jest.useFakeTimers();

// remove all scheduled timers so they are not fired outside of tests
// where they were scheduled
afterEach(() => jest.clearAllTimers());
