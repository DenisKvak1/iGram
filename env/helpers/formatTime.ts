export function formatDateString(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffMilliseconds = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
    if (diffMinutes === 0) {
        return "В сети";
    } else if (diffDays === 0 && diffHours < 1 && diffMinutes > 0) {
        return `${diffMinutes} минут назад`;
    } else if (diffHours < 12 && diffDays === 0 && diffHours <= 1) {
        return `${diffHours} часов назад`;
    } else if (diffDays === 0 && diffHours >= 12) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    } else if (diffDays === 1) {
        return "вчера";
    } else {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString().slice(-2);
        return `${day}.${month}.${year}`;
    }
}

export function formatDateStringToMessage(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffMilliseconds = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
    const diffYears = now.getFullYear() - date.getFullYear()

    if (diffDays===0) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    } else if (diffYears===0) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${day} ${getMonthName(date.getMonth())} ${hours}:${minutes}`;
    } else {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString().slice(-2);
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
}

function getMonthName(month:number) {
    switch (month) {
        case 0:
            return "января";
        case 1:
            return "февраля";
        case 2:
            return "марта";
        case 3:
            return "апреля";
        case 4:
            return "мая";
        case 5:
            return "июня";
        case 6:
            return "июля";
        case 7:
            return "августа";
        case 8:
            return "сентября";
        case 9:
            return "октября";
        case 10:
            return "ноября";
        case 11:
            return "декабря";
        default:
            return "";
    }
}