export const makeRequest = async <T>(url: string, method: string, data?: any): Promise<T> => {
    try {
        const response = await fetch(url, {
            method: method,
            // Не устанавливаем заголовок для FormData
            headers: data instanceof FormData ? undefined : { "Content-Type": "application/json" },
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Ошибка : ", errorData.error);
            throw new Error(errorData.error || `Ошибка при запросе: ${response.statusText}`);
        }

        return (await response.json()) as T;
    } catch (e) {
        console.error("Ошибка при выполнении запроса:", e);
        throw e; // Прокидываем ошибку дальше
    }
};
