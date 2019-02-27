import 'react-testing-library/cleanup-after-each';
import P from 'promise/setimmediate';

global.Promise = P;

jest.useFakeTimers();

jest.mock('lodash.debounce', () => (cb, delay) => {
  let tmt;
  const debounce = value => {
    clearTimeout(tmt);
    tmt = setTimeout(cb, delay, value);
  };

  debounce.cancel = () => {
    tmt = clearTimeout(tmt);
  };

  return debounce;
});

// remove all scheduled timers so they are not fired outside of tests
// where they were scheduled
afterEach(() => jest.clearAllTimers());
