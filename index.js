const defaultOptions = {
  maxNums: 3,
  delay: 500,
  shouldRetryOnErrorFn: (error) => false,
  shouldRetryOnSuccessFn: (data) => false
};

const delayPromise = (delay) =>
  delay > 0 && new Promise((resolve) => setTimeout(resolve, delay));

/**
 * @param {Promise} fn
 * @param {Object} options
 * @param {Number} [options.maxNums=3]
 * @param {Number} [options.delay=0]
 * @param {Function<boolean>} [options.shouldRetryOnErrorFn = (error) => false]
 * @param {Function<boolean>} [options.shouldRetryOnSuccessFn = (data) => false]
 * @returns {Promise}
 */

const retry = async (fn, options) => {
  const { maxNums, delay, shouldRetryOnErrorFn, shouldRetryOnSuccessFn } = {
    ...defaultOptions,
    ...options
  };

  if (typeof fn !== "function") {
    throw new TypeError("retry: fn require a function");
  }

  if (
    typeof shouldRetryOnErrorFn !== "function" ||
    typeof shouldRetryOnSuccessFn !== "function"
  ) {
    throw new TypeError(
      "retry: shouldRetryOnErrorFn or shouldRetryOnSuccessFn require a function"
    );
  }

  let i = 0;

  for (i; i < maxNums; i++) {
    const last = i === maxNums - 1;

    try {
      const result = fn();
      if (typeof result?.then === "function") {
        const data = await result;

        if (!shouldRetryOnSuccessFn(data, i + 1) || last) {
          return data;
        }
      } else {
        throw new TypeError("retry: fn should return promise");
      }
    } catch (e) {
      if (!shouldRetryOnErrorFn(e, i + 1) || last) {
        throw e;
      }
    }
    await delayPromise(delay);
  }
};

const fn = () => fetch("www.baidu.com");

retry(fn, {
  delay: 1000,
  shouldRetryOnSuccessFn: (data, num) => {
    console.log("retry:", num, data);
    return true;
  }
})
  .then(console.log)
  .catch(console.error);
