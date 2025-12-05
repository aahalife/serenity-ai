export const getZodiacSign = (dateString: string): { name: string; symbol: string; dateRange: string } => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // 1-12

    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return { name: "Aries", symbol: "♈️", dateRange: "Mar 21-Apr 19" };
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return { name: "Taurus", symbol: "♉️", dateRange: "Apr 20-May 20" };
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return { name: "Gemini", symbol: "♊️", dateRange: "May 21-Jun 20" };
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return { name: "Cancer", symbol: "♋️", dateRange: "Jun 21-Jul 22" };
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return { name: "Leo", symbol: "♌️", dateRange: "Jul 23-Aug 22" };
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return { name: "Virgo", symbol: "♍️", dateRange: "Aug 23-Sep 22" };
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return { name: "Libra", symbol: "♎️", dateRange: "Sep 23-Oct 22" };
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return { name: "Scorpio", symbol: "♏️", dateRange: "Oct 23-Nov 21" };
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return { name: "Sagittarius", symbol: "♐️", dateRange: "Nov 22-Dec 21" };
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return { name: "Capricorn", symbol: "♑️", dateRange: "Dec 22-Jan 19" };
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return { name: "Aquarius", symbol: "♒️", dateRange: "Jan 20-Feb 18" };
    return { name: "Pisces", symbol: "♓️", dateRange: "Feb 19-Mar 20" };
};
