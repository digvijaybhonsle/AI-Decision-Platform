import api from "../utils/api";

let isWakingUp = false;

export const checkMLHealth = async () => {
  try {
    const res = await api.get("/health"); // or /ml/health
    return res.status === 200;
  } catch {
    return false;
  }
};

export const callMLWithRetry = async (fn, setGlobalState) => {
  try {
    return await fn();
  } catch (err) {
    const status = err.response?.status;

    if (status === 502 || status === 503) {
      isWakingUp = true;

      // 🔥 trigger global UI
      setGlobalState?.(true);

      // ⏳ wait for ML to wake
      await new Promise((res) => setTimeout(res, 8000));

      try {
        const retry = await fn();
        isWakingUp = false;
        setGlobalState?.(false);
        return retry;
      } catch (retryErr) {
        isWakingUp = false;
        setGlobalState?.(false);
        throw retryErr;
      }
    }

    throw err;
  }
};