import localFont from 'next/font/local'

export const pretendard = localFont({
	src: "../fonts/PretendardVariable.woff2",
	display: "swap",
	weight: "45 950",
	variable: "--font-pretendard",
});

export const indivisible = localFont({
  src: '../fonts/Indivisible_variable.otf',
  variable: '--font-indivisible',
})

export const mgothic210 = localFont({
  src: [
	{
		path: "../fonts/210MGothic040.otf",
		weight: "400"
	},
	{
		path: "../fonts/210MGothic050.otf",
		weight: "500"
	},
	{
		path: "../fonts/210MGothic060.otf",
		weight: "600"
	},
	{
		path: "../fonts/210MGothic070.otf",
		weight: "700"
	},
	{
		path: "../fonts/210MGothic080.otf",
		weight: "800",
	}
  ],
  variable: '--font-210mgothic',
})