import { useEffect, useState } from "react";

function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;
        setIsPending(true);

        fetch(url, { signal: signal })
            .then(res => {
                if (!res.ok) {
                    throw new Error("HTTP error");
                }
                return res.json();
            })
            .then((data: T) => {
                setData(data);
                setIsPending(false);
            })
            .catch(err => {
                if (err.name !== "AbortError") {
                    setError(err);
                    setIsPending(false);
                }
            });

        return () => abortController.abort();
    }, []);

    return { data, setData, isPending, error };
}

export default useFetch;