
// color strings
const colors = {
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	underline: '\x1b[4m',
	blink: '\x1b[5m',
	reverse: '\x1b[7m',
	hidden: '\x1b[8m',
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m'
};

const reset = '\x1b[0m';

Object.keys(colors).forEach(name => {
	const color = colors[name];

	colors[name] = string => color + string.replace(reset, reset + color) + reset;
});

export default colors;

export const bold = colors.bold;
export const dim = colors.dim;
export const underline = colors.underline;
export const blink = colors.blink;
export const reverse = colors.reverse;
export const hidden = colors.hidden;
export const black = colors.black;
export const red = colors.red;
export const green = colors.green;
export const yellow = colors.yellow;
export const blue = colors.blue;
export const magenta = colors.magenta;
export const cyan = colors.cyan;
export const white = colors.white;
export const bgBlack = colors.bgBlack;
export const bgRed = colors.bgRed;
export const bgGreen = colors.bgGreen;
export const bgYellow = colors.bgYellow;
export const bgBlue = colors.bgBlue;
export const bgMagenta = colors.bgMagenta;
export const bgCyan = colors.bgCyan;
export const bgWhite = colors.bgWhite;
