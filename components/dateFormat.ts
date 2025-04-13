// interface DateFormatOptions {
// 	locale?: string;
// 	timeZone?: string;
// }

type FormatToken =
	| "YYYY"
	| "YY"
	| "M"
	| "MM"
	| "MMM"
	| "MMMM"
	| "D"
	| "DD"
	| "Do"
	| "d"
	| "dd"
	| "ddd"
	| "dddd"
	| "H"
	| "HH"
	| "h"
	| "hh"
	| "a"
	| "A"
	| "m"
	| "mm"
	| "s"
	| "ss"
	| "S"
	| "SS"
	| "SSS"
	| "Z"
	| "ZZ"
	| "w"
	| "ww"
	| "X"
	| "x";

function formatDate(
	dateString: string,
	format: string,
	// options?: DateFormatOptions = {}
): string {
	const date = new Date(dateString);

	const monthNames: string[] = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const shortMonthNames: string[] = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const dayNames: string[] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const shortDayNames: string[] = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
	];

	function getOrdinalSuffix(n: number): string {
		if (n >= 11 && n <= 13) return n + "th";
		switch (n % 10) {
			case 1:
				return n + "st";
			case 2:
				return n + "nd";
			case 3:
				return n + "rd";
			default:
				return n + "th";
		}
	}

	function padZero(num: number, length: number = 2): string {
		return String(num).padStart(length, "0");
	}

	function getWeekOfYear(date: Date): number {
		const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
		const pastDaysOfYear =
			(date.getTime() - firstDayOfYear.getTime()) / 86400000;
		return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
	}

	const formatMap: Record<FormatToken, string | number> = {
		// Year
		YYYY: date.getFullYear(),
		YY: String(date.getFullYear()).slice(-2),

		// Month
		M: date.getMonth() + 1,
		MM: padZero(date.getMonth() + 1),
		MMM: shortMonthNames[date.getMonth()],
		MMMM: monthNames[date.getMonth()],

		// Day of Month
		D: date.getDate(),
		DD: padZero(date.getDate()),
		Do: getOrdinalSuffix(date.getDate()),

		// Day of Week
		d: date.getDay(),
		dd: shortDayNames[date.getDay()].slice(0, 2),
		ddd: shortDayNames[date.getDay()],
		dddd: dayNames[date.getDay()],

		// Hour
		H: date.getHours(),
		HH: padZero(date.getHours()),
		h: date.getHours() % 12 || 12,
		hh: padZero(date.getHours() % 12 || 12),

		// AM/PM
		A: date.getHours() >= 12 ? "PM" : "AM",
		a: date.getHours() >= 12 ? "pm" : "am",

		// Minute
		m: date.getMinutes(),
		mm: padZero(date.getMinutes()),

		// Second
		s: date.getSeconds(),
		ss: padZero(date.getSeconds()),

		// Fractional Seconds
		S: Math.floor(date.getMilliseconds() / 100),
		SS: padZero(Math.floor(date.getMilliseconds() / 10)),
		SSS: padZero(date.getMilliseconds(), 3),

		// Time Zone
		Z: date.toTimeString().split("GMT")[1].split(" ")[0],
		ZZ: date.toTimeString().split("GMT")[1].split(" ")[0].replace(":", ""),

		// Week of Year
		w: getWeekOfYear(date),
		ww: padZero(getWeekOfYear(date)),

		// Timestamps
		X: Math.floor(date.getTime() / 1000),
		x: date.getTime(),
	};

	return format.replace(
		/YYYY|YY|M{1,4}|Do|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|S{1,3}|Z{1,2}|w{1,2}|X|x/g,
		(match) => String(formatMap[match as FormatToken])
	);
}

export default formatDate;