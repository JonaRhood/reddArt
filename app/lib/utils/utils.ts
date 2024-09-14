export function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast(item => num >= item.value);
  return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}

/*
 * Tests
 */
const tests = [
  { num: 0, digits: 1 },
  { num: 12, digits: 1 },
  { num: 1234, digits: 1 },
  { num: 100000000, digits: 1 },
  { num: 299792458, digits: 1 },
  { num: 759878, digits: 1 },
  { num: 759878, digits: 0 },
  { num: 123, digits: 1 },
  { num: 123.456, digits: 1 },
  { num: 123.456, digits: 2 },
  { num: 123.456, digits: 4 }
];
tests.forEach(test => {
  // console.log("nFormatter(%f, %i) = %s", test.num, test.digits, nFormatter(test.num, test.digits));
});

//   const vintageColors = [
//     // Vintage Red
//     '#D8A3A8', // Dusty Rose
//     '#9E6F6F', // Muted Cranberry
//     '#E27D60', // Terra Cotta
//     '#B03A2E', // Old Brick

//     // Vintage Beige
//     '#F5F5DC', // Soft Beige
//     '#FAEBD7', // Antique White
//     '#FFFDD0', // Cream
//     '#F7E7CE', // Champagne

//     // Vintage Green
//     '#9B9A8B', // Muted Sage
//     '#8A9A5B', // Moss Green
//     '#6B8E23', // Olive Drab
//     '#BCCF9F'  // Pale Olive
// ];

// export function getRandomColor() {
//     const randomIndex = Math.floor(Math.random() * vintageColors.length);
//     return vintageColors[randomIndex];
// };

export const shimmer = (w: number, h: number) => {
  // Function to generate a dark vintage color
  const getDarkVintageColor = () => {
    const darkColor = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const r = darkColor(0, 100); // Darker red component
    const g = darkColor(0, 100); // Darker green component
    const b = darkColor(0, 100); // Darker blue component

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Function to lighten a color (preserving its dark vintage tone)
  const lightenColor = (hex: string, percent: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
  };

  const color1 = getDarkVintageColor();
  const color2 = lightenColor(color1, 0.1); // Lighten color1 by 30% for color2

  return `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="${color1}" offset="0%" />
          <stop stop-color="${color2}" offset="50%" />
          <stop stop-color="${color1}" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="${color1}" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate
        xlink:href="#r"
        attributeName="x"
        from="-${w}"
        to="${w}"
        dur="2s"
        repeatCount="indefinite"
        keyTimes="0;0.5;1"
        values="-${w};${w};-${w}"
        calcMode="linear"
      />
    </svg>`;
};

export const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
