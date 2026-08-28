export function formatPrice(value) {

    return Number(value || 0).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 0
        }
    );

}


export function formatNumber(value) {

    const number = Number(value);

    if (Number.isInteger(number)) {
        return number;
    }

    return number
        .toFixed(1)
        .replace(".0", "");

}


export function escapeHtml(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );

}
