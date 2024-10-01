// Number Formatter
////////////////////////////////////////////////////////////////////
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


// Shimmer Loader for the gallery
///////////////////////////////////////////////////////////////////////////////
export const shimmer = (w: number, h: number) => {
  // Function to generate a dark vintage color
  const getDarkVintageColor = () => {
    const pastelColor = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const r = pastelColor(80, 160); // Muted red component
    const g = pastelColor(80, 160); // Muted green component
    const b = pastelColor(80, 160); // Muted blue component

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
  const color2 = lightenColor(color1, 0.08); // Lighten color1 by 30% for color2

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
        calcMode="linear"
      />
      <g transform="translate(${w / 2.3}, ${h / 2.7}) scale(5)">
        <g class="layer">
          <rect fill="none" height="500" width="500" x="0" y="0"/>
          <g id="svg_2">
              <path fill="rgba(255,255,255,0.2)" d="m9.18,2.54c1.1,0.37 -2.12,2.19 -0.11,3.41c1.13,0.69 3.61,-2.42 4.85,-3.12c1.06,-0.59 2.91,-0.71 3.85,1.34c1.19,2.59 0.15,9.34 -4.13,12.05c-4.33,2.72 -9.77,1.34 -11.66,-2.9c-2.19,-4.93 3.4,-12.08 7.2,-10.78zm1.32,7.03c0.8,1.79 5.12,-0.54 4.13,-3.05c-0.64,-1.62 -4.88,1.36 -4.13,3.05z"/>
          </g>
          </g>
        </g>  
    </svg>`;
};


export const grayShimmerIcon = () => {
  const color = '#d3d3d3'; // Color gris claro
  const color2 = '#ebebeb';

  return `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="g">
        <stop stop-color="${color}" offset="0%" />
        <stop stop-color="${color2}" offset="50%" />
        <stop stop-color="${color}" offset="100%" />
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from="-1 0"
          to="1 0"
          dur="1.5s"
          repeatCount="indefinite" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="${color}" rx="50" />
    <circle cx="50" cy="50" r="50" fill="url(#g)" />
  </svg>`;
};

export const grayShimmer = (w: number, h: number) => {
  const color = '#d3d3d3'; // Light gray color
  const color2 = '#ebebeb'

  return `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="g">
        <stop stop-color="${color}" offset="0%" />
        <stop stop-color="${color}" offset="50%" />
        <stop stop-color="${color}" offset="100%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="${color}" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <g transform="translate(${w / 2.3}, ${h / 2.7}) scale(5)">
        <g class="layer">
          <rect fill="none" height="500" width="500" x="0" y="0"/>
          <g id="svg_2">
              <path fill="rgba(255,255,255,0.2)" d="m9.18,2.54c1.1,0.37 -2.12,2.19 -0.11,3.41c1.13,0.69 3.61,-2.42 4.85,-3.12c1.06,-0.59 2.91,-0.71 3.85,1.34c1.19,2.59 0.15,9.34 -4.13,12.05c-4.33,2.72 -9.77,1.34 -11.66,-2.9c-2.19,-4.93 3.4,-12.08 7.2,-10.78zm1.32,7.03c0.8,1.79 5.12,-0.54 4.13,-3.05c-0.64,-1.62 -4.88,1.36 -4.13,3.05z"/>
          </g>
          </g>
        </g>  
  </svg>`;
};

export const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);


export const cleanUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.replace(/&amp;/g, '&');
  } catch (e) {
    console.error('Error decoding URL:', e);
    return url;
  }
};