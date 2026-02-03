export const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;

    if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (typeof detail === 'string') {
            return detail;
        }

        if (Array.isArray(detail)) {
            // Standard FastAPI/Pydantic validation error format
            return detail.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ');
        }

        if (typeof detail === 'object') {
            return JSON.stringify(detail);
        }
    }

    return err.message || "Something went wrong";
};
