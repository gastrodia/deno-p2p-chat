const promiseToResult = <T, E>(promise: Promise<T>) => {
  return promise.then((v) => [null, v] as const).catch((e: E) =>
    [e, null] as const
  );
};

export default promiseToResult;
