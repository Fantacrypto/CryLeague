import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "admin2024";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "password";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TOP_CRYPTOS = [
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin" },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum" },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB" },
  { id: "solana",        symbol: "SOL",  name: "Solana" },
  { id: "ripple",        symbol: "XRP",  name: "XRP" },
  { id: "cardano",       symbol: "ADA",  name: "Cardano" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche" },
  { id: "dogecoin",      symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot",      symbol: "DOT",  name: "Polkadot" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink" },
  { id: "matic-network", symbol: "MATIC",name: "Polygon" },
  { id: "shiba-inu",     symbol: "SHIB", name: "Shiba Inu" },
  { id: "tron",          symbol: "TRX",  name: "TRON" },
  { id: "uniswap",       symbol: "UNI",  name: "Uniswap" },
  { id: "litecoin",      symbol: "LTC",  name: "Litecoin" },
];

const fmt = (s) => {
  if (s === null || s === undefined) return "—";
  const n = Number(s);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }) : "—";

async function fetchCryptoPrices(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore CoinGecko");
  return res.json();
}

function calcScore(cryptos, startPrices, endPrices) {
  let total = 0, count = 0;
  for (const c of cryptos) {
    const sp = startPrices?.[c.id]?.usd;
    const ep = endPrices?.[c.id]?.usd;
    if (sp && ep) { total += ((ep - sp) / sp) * 100; count++; }
  }
  return count ? total / count : null;
}

// Logo SVG del brand
const LogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="250 20 1140 240" style={{width:"100%",maxWidth:"600px",height:"auto",display:"block",margin:"0 auto"}}>
    <defs>
      <filter x="0%" y="0%" width="100%" height="100%" id="d44ad22488"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" colorInterpolationFilters="sRGB"/></filter>
      <filter x="0%" y="0%" width="100%" height="100%" id="7aa3a021ed"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.2126 0.7152 0.0722 0 0" colorInterpolationFilters="sRGB"/></filter>
      <clipPath id="0b999db500"><path d="M 1 1 L 241.765625 1 L 241.765625 279.816406 L 1 279.816406 Z M 1 1" clipRule="nonzero"/></clipPath>
      <mask id="793df11155">
        <g filter="url(#d44ad22488)">
          <g filter="url(#7aa3a021ed)" transform="matrix(0.302683, 0, 0, 0.303529, 0.828732, 0.535974)">
            <image x="0" y="0" width="796" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxwAAAOYCAAAAAB6TaoaAAAAAmJLR0QA/4ePzL8AABcOSURBVHic7d3Jdt24skBB2v//z1UDuZHkk9JpCDCbiMmbvHUXQWIzQVl2/Tg43X9v/+fHtVfBqzzAl/33wP+v212Jp/WkR5K4wX0vwEN61ItVfOYB5OXZ3O/kLN7xFFLyWO6yrot3PItkPJBvbQnjDw8kD8/iS3vD+M1DycFzCF0Txm8ezPU8g5uuDeM3D+da7v+/cpTxiwd0Hff+k1Rl/OIhXcN9fy9jGW88pwu46X/kLeONR7WbO/5L9jSO4/C0NnO7j6NIGW88sH3c61JpHMfhmW0z/kZXK+PN+Me2xfC7XDOM4zjGP7kdRt/iwmkcxzH84W0w+P5WT+M4Rj++Dcbe3Q5pHMcx+AmuN/TWtknjOI6xD3G5kfe1VxrHMfQxLjfwrvZL4ziOkU9ytXG3tGkaxzHwWa427IY2TuM4jnGPc7FRd7N7Gscx7IEuNuheTkjjOEY90sXG3MkpaRzHoIe62JD7OCmN4xjzWBcbcRenpXEcQx7sYgPu4cQ0juMY8WzXan8Dx6ZxHAOe7lrdb9/oNo7+z3ep3jdvehrH0f0JL9X51injTednvFTfGyeNv/o+5aW63jZpfNT1OS/V86ZJ4x89H/RaHe+ZNG7q+KjX6nfHpBHq97DX6na/pPGlbo97rV53Sxrf6vXA1+p0r6Rxl06PfK0+d0oad+vz0NfqcK6k8YguT32xHrdJGo/q8dwX63CTpPGMDk9+sfq3SBrPqv/sF6t+g6TxguoPf7Xa90caL6r9+FerfHekcYLKG2C1uvdGGueouwOWq3prpHGeqntguZo3RhqnqrkJ1qt4X6RxuobLYL16d0UaS9TbCOtVuyfSWKXaThing1P7LmZxlA0YnDWZqoYuXPHxqh9Ni9+U4X8Td26Z4gAAAABJRU5ErkJggg==" height="920" preserveAspectRatio="xMidYMid meet"/>
          </g>
        </g>
      </mask>
      <clipPath id="9e30d40635"><rect x="0" width="1385" y="0" height="280"/></clipPath>
    </defs>
    <g transform="matrix(1, 0, 0, 1, 15, 6)">
      <g fill="#ffffff" fillOpacity="1">
        <g transform="translate(265.504528, 147.520755)"><g><path d="M 78.640625 -120.8125 L 78.640625 -96.65625 L 36.3125 -96.65625 L 36.3125 -72.640625 L 75.421875 -72.640625 L 75.421875 -48.46875 L 36.3125 -48.46875 L 36.3125 0 L 8.78125 0 L 8.78125 -120.8125 Z"/></g></g>
        <g transform="translate(344.286071, 147.520755)"><g><path d="M 70.140625 -120.8125 L 118.90625 0 L 89.328125 0 L 80.390625 -24.15625 L 34.40625 -24.15625 L 25.484375 0 L -4.09375 0 L 44.65625 -120.8125 Z M 71.015625 -48.328125 L 57.546875 -83.46875 L 57.25 -83.46875 L 43.78125 -48.328125 Z"/></g></g>
        <g transform="translate(459.969022, 147.520755)"><g><path d="M 36.3125 -74.96875 L 36.3125 0 L 8.78125 0 L 8.78125 -120.8125 L 36.3125 -120.8125 L 84.34375 -45.828125 L 84.640625 -45.828125 L 84.640625 -120.8125 L 112.171875 -120.8125 L 112.171875 0 L 84.640625 0 L 36.609375 -74.96875 Z"/></g></g>
        <g transform="translate(574.773382, 147.520755)"><g><path d="M 1.171875 -96.65625 L 1.171875 -120.8125 L 86.109375 -120.8125 L 86.109375 -96.65625 L 57.40625 -96.65625 L 57.40625 0 L 29.875 0 L 29.875 -96.65625 Z"/></g></g>
        <g transform="translate(655.897885, 147.520755)"><g><path d="M 70.140625 -120.8125 L 118.90625 0 L 89.328125 0 L 80.390625 -24.15625 L 34.40625 -24.15625 L 25.484375 0 L -4.09375 0 L 44.65625 -120.8125 Z M 71.015625 -48.328125 L 57.546875 -83.46875 L 57.25 -83.46875 L 43.78125 -48.328125 Z"/></g></g>
        <g transform="translate(766.894918, 147.520755)"><g><path d="M 73.078125 -24.890625 C 77.273438 -24.890625 81.347656 -25.523438 85.296875 -26.796875 C 89.253906 -28.066406 92.160156 -29.285156 94.015625 -30.453125 L 96.796875 -32.359375 L 108.515625 -8.9375 C 108.117188 -8.644531 107.578125 -8.253906 106.890625 -7.765625 C 106.210938 -7.273438 104.628906 -6.367188 102.140625 -5.046875 C 99.648438 -3.734375 96.988281 -2.585938 94.15625 -1.609375 C 91.320312 -0.628906 87.609375 0.25 83.015625 1.03125 C 78.429688 1.8125 73.703125 2.203125 68.828125 2.203125 C 57.597656 2.203125 46.953125 -0.550781 36.890625 -6.0625 C 26.835938 -11.582031 18.738281 -19.175781 12.59375 -28.84375 C 6.445312 -38.507812 3.375 -48.957031 3.375 -60.1875 C 3.375 -68.675781 5.175781 -76.828125 8.78125 -84.640625 C 12.394531 -92.453125 17.203125 -99.140625 23.203125 -104.703125 C 29.210938 -110.265625 36.21875 -114.703125 44.21875 -118.015625 C 52.226562 -121.335938 60.429688 -123 68.828125 -123 C 76.640625 -123 83.835938 -122.070312 90.421875 -120.21875 C 97.015625 -118.363281 101.675781 -116.507812 104.40625 -114.65625 L 108.515625 -111.875 L 96.796875 -88.453125 C 96.109375 -89.035156 95.082031 -89.738281 93.71875 -90.5625 C 92.351562 -91.394531 89.617188 -92.492188 85.515625 -93.859375 C 81.421875 -95.234375 77.273438 -95.921875 73.078125 -95.921875 C 66.429688 -95.921875 60.472656 -94.84375 55.203125 -92.6875 C 49.929688 -90.539062 45.757812 -87.710938 42.6875 -84.203125 C 39.613281 -80.691406 37.269531 -76.910156 35.65625 -72.859375 C 34.039062 -68.804688 33.234375 -64.679688 33.234375 -60.484375 C 33.234375 -51.304688 36.675781 -43.078125 43.5625 -35.796875 C 50.445312 -28.523438 60.285156 -24.890625 73.078125 -24.890625 Z"/></g></g>
        <g transform="translate(878.038435, 147.520755)"><g><path d="M 8.78125 -120.8125 L 51.984375 -120.8125 C 63.597656 -120.8125 73.066406 -117.710938 80.390625 -111.515625 C 87.710938 -105.316406 91.375 -96.457031 91.375 -84.9375 C 91.375 -76.050781 89.148438 -68.601562 84.703125 -62.59375 C 80.265625 -56.59375 74.238281 -52.375 66.625 -49.9375 L 108.21875 0 L 73.21875 0 L 36.3125 -47.734375 L 36.3125 0 L 8.78125 0 Z M 36.3125 -67.21875 L 39.53125 -67.21875 C 42.070312 -67.21875 44.222656 -67.265625 45.984375 -67.359375 C 47.742188 -67.453125 49.742188 -67.789062 51.984375 -68.375 C 54.234375 -68.96875 56.039062 -69.800781 57.40625 -70.875 C 58.769531 -71.945312 59.9375 -73.507812 60.90625 -75.5625 C 61.882812 -77.613281 62.375 -80.101562 62.375 -83.03125 C 62.375 -85.957031 61.882812 -88.445312 60.90625 -90.5 C 59.9375 -92.550781 58.769531 -94.113281 57.40625 -95.1875 C 56.039062 -96.257812 54.234375 -97.085938 51.984375 -97.671875 C 49.742188 -98.253906 47.742188 -98.59375 45.984375 -98.6875 C 44.222656 -98.789062 42.070312 -98.84375 39.53125 -98.84375 L 36.3125 -98.84375 Z"/></g></g>
        <g transform="translate(970.584764, 147.520755)"><g><path d="M -4.390625 -120.8125 L 28.703125 -120.8125 L 53.890625 -82.15625 L 79.078125 -120.8125 L 112.171875 -120.8125 L 67.65625 -54.1875 L 67.65625 0 L 40.125 0 L 40.125 -54.1875 Z"/></g></g>
        <g transform="translate(1079.23889, 147.520755)"><g><path d="M 8.78125 -120.8125 L 52.859375 -120.8125 C 65.160156 -120.8125 75.117188 -117.640625 82.734375 -111.296875 C 90.347656 -104.953125 94.15625 -95.722656 94.15625 -83.609375 C 94.15625 -71.503906 90.296875 -62.007812 82.578125 -55.125 C 74.867188 -48.25 64.960938 -44.8125 52.859375 -44.8125 L 36.3125 -44.8125 L 36.3125 0 L 8.78125 0 Z M 36.3125 -66.78125 L 44.078125 -66.78125 C 50.222656 -66.78125 55.273438 -68.023438 59.234375 -70.515625 C 63.191406 -73.003906 65.171875 -77.078125 65.171875 -82.734375 C 65.171875 -88.492188 63.191406 -92.617188 59.234375 -95.109375 C 55.273438 -97.597656 50.222656 -98.84375 44.078125 -98.84375 L 36.3125 -98.84375 Z"/></g></g>
        <g transform="translate(1170.613818, 147.520755)"><g><path d="M 1.171875 -96.65625 L 1.171875 -120.8125 L 86.109375 -120.8125 L 86.109375 -96.65625 L 57.40625 -96.65625 L 57.40625 0 L 29.875 0 L 29.875 -96.65625 Z"/></g></g>
        <g transform="translate(1254.081227, 147.520755)"><g><path d="M 3.375 -60.484375 C 3.375 -77.953125 9.328125 -92.738281 21.234375 -104.84375 C 33.140625 -116.945312 47.488281 -123 64.28125 -123 C 81.175781 -123 95.53125 -116.972656 107.34375 -104.921875 C 119.15625 -92.867188 125.0625 -78.054688 125.0625 -60.484375 C 125.0625 -42.804688 119.25 -27.9375 107.625 -15.875 C 96.007812 -3.820312 81.5625 2.203125 64.28125 2.203125 C 46.613281 2.203125 32.046875 -3.773438 20.578125 -15.734375 C 9.109375 -27.703125 3.375 -42.617188 3.375 -60.484375 Z M 33.09375 -60.484375 C 33.09375 -54.128906 34.066406 -48.34375 36.015625 -43.125 C 37.972656 -37.90625 41.390625 -33.488281 46.265625 -29.875 C 51.148438 -26.257812 57.15625 -24.453125 64.28125 -24.453125 C 74.53125 -24.453125 82.265625 -27.96875 87.484375 -35 C 92.710938 -42.03125 95.328125 -50.523438 95.328125 -60.484375 C 95.328125 -70.335938 92.664062 -78.800781 87.34375 -85.875 C 82.03125 -92.957031 74.34375 -96.5 64.28125 -96.5 C 54.320312 -96.5 46.632812 -92.957031 41.21875 -85.875 C 35.800781 -78.800781 33.09375 -70.335938 33.09375 -60.484375 Z"/></g></g>
      </g>
      <g fill="#0AB198" fillOpacity="1">
        <g transform="translate(268.349956, 238.559734)"><g><path d="M 7.15625 0 L 7.15625 -69.46875 L 23.5 -69.46875 L 23.5 -16.34375 L 47.8125 -16.34375 L 47.8125 0 Z"/></g></g>
        <g transform="translate(317.184, 238.559734)"><g><path d="M 7.15625 0 L 7.15625 -69.46875 L 53.9375 -69.46875 L 53.9375 -53.125 L 21.453125 -53.125 L 21.453125 -42.90625 L 47.8125 -42.90625 L 47.8125 -26.5625 L 21.453125 -26.5625 L 21.453125 -16.34375 L 53.9375 -16.34375 L 53.9375 0 Z"/></g></g>
        <g transform="translate(373.169474, 238.559734)"><g><path d="M 6.125 0 L 26.65625 -69.46875 L 51.59375 -69.46875 L 72.125 0 L 54.546875 0 L 51.484375 -10.71875 L 26.765625 -10.71875 L 23.703125 0 Z M 31.359375 -27.078125 L 46.890625 -27.078125 L 39.9375 -51.28125 L 38.3125 -51.28125 Z"/></g></g>
        <g transform="translate(442.231836, 238.559734)"><g><path d="M 34.9375 0 C 28.53125 0 23.113281 -1.476562 18.6875 -4.4375 C 14.257812 -7.40625 10.890625 -11.492188 8.578125 -16.703125 C 6.265625 -21.910156 5.109375 -27.921875 5.109375 -34.734375 C 5.109375 -41.546875 6.300781 -47.554688 8.6875 -52.765625 C 11.070312 -57.972656 14.660156 -62.054688 19.453125 -65.015625 C 24.253906 -67.984375 30.265625 -69.46875 37.484375 -69.46875 C 43.347656 -69.46875 48.523438 -68.445312 53.015625 -66.40625 C 57.515625 -64.363281 61.109375 -61.570312 63.796875 -58.03125 C 66.484375 -54.488281 68 -50.503906 68.34375 -46.078125 L 52 -46.078125 C 51.113281 -48.523438 49.507812 -50.3125 47.1875 -51.4375 C 44.875 -52.5625 41.640625 -53.125 37.484375 -53.125 C 34.148438 -53.125 31.273438 -52.59375 28.859375 -51.53125 C 26.441406 -50.476562 24.601562 -48.625 23.34375 -45.96875 C 22.082031 -43.3125 21.453125 -39.566406 21.453125 -34.734375 C 21.453125 -29.960938 22.113281 -26.234375 23.4375 -23.546875 C 24.769531 -20.859375 26.726562 -18.984375 29.3125 -17.921875 C 31.90625 -16.867188 35.144531 -16.34375 39.03125 -16.34375 C 42.90625 -16.34375 46.320312 -17.039062 49.28125 -18.4375 C 52.25 -19.832031 54.175781 -22.503906 55.0625 -26.453125 L 34.421875 -26.453125 L 34.421875 -38.71875 L 71.40625 -38.71875 L 71.40625 0 L 55.0625 0 L 55.0625 -9.703125 L 53.421875 -9.703125 C 52.816406 -8.410156 51.8125 -7 50.40625 -5.46875 C 49.007812 -3.9375 47.050781 -2.640625 44.53125 -1.578125 C 42.019531 -0.523438 38.820312 0 34.9375 0 Z"/></g></g>
        <g transform="translate(517.730488, 238.559734)"><g><path d="M 37.1875 0 C 31.1875 0 25.835938 -0.953125 21.140625 -2.859375 C 16.441406 -4.765625 12.765625 -7.691406 10.109375 -11.640625 C 7.453125 -15.597656 6.125 -20.570312 6.125 -26.5625 L 6.125 -69.46875 L 22.46875 -69.46875 L 22.46875 -30.640625 C 22.46875 -27.234375 22.859375 -24.472656 23.640625 -22.359375 C 24.429688 -20.253906 25.878906 -18.722656 27.984375 -17.765625 C 30.097656 -16.816406 33.164062 -16.34375 37.1875 -16.34375 C 41.207031 -16.34375 44.269531 -16.816406 46.375 -17.765625 C 48.488281 -18.722656 49.9375 -20.253906 50.71875 -22.359375 C 51.5 -24.472656 51.890625 -27.234375 51.890625 -30.640625 L 51.890625 -69.46875 L 68.234375 -69.46875 L 68.234375 -26.5625 C 68.234375 -20.570312 66.90625 -15.597656 64.25 -11.640625 C 61.59375 -7.691406 57.929688 -4.765625 53.265625 -2.859375 C 48.609375 -0.953125 43.25 0 37.1875 0 Z"/></g></g>
        <g transform="translate(589.040483, 238.559734)"><g><path d="M 7.15625 0 L 7.15625 -69.46875 L 53.9375 -69.46875 L 53.9375 -53.125 L 21.453125 -53.125 L 21.453125 -42.90625 L 47.8125 -42.90625 L 47.8125 -26.5625 L 21.453125 -26.5625 L 21.453125 -16.34375 L 53.9375 -16.34375 L 53.9375 0 Z"/></g></g>
        <g transform="translate(648.090851, 238.559734)"><g><path d="M 6.125 0 L 6.125 -16.34375 L 22.46875 -16.34375 L 22.46875 0 Z"/></g></g>
        <g transform="translate(675.674958, 238.559734)"><g><path d="M 7.15625 0 L 7.15625 -69.46875 L 23.5 -69.46875 L 23.5 0 Z"/></g></g>
        <g transform="translate(702.237421, 238.559734)"><g><path d="M 39.03125 0 C 31.945312 0 25.863281 -1.546875 20.78125 -4.640625 C 15.707031 -7.742188 11.828125 -11.914062 9.140625 -17.15625 C 6.453125 -22.40625 5.109375 -28.265625 5.109375 -34.734375 C 5.109375 -41.203125 6.453125 -47.054688 9.140625 -52.296875 C 11.828125 -57.546875 15.707031 -61.71875 20.78125 -64.8125 C 25.863281 -67.914062 31.945312 -69.46875 39.03125 -69.46875 C 46.101562 -69.46875 52.175781 -67.914062 57.25 -64.8125 C 62.332031 -61.71875 66.21875 -57.546875 68.90625 -52.296875 C 71.59375 -47.054688 72.9375 -41.203125 72.9375 -34.734375 C 72.9375 -28.265625 71.59375 -22.40625 68.90625 -17.15625 C 66.21875 -11.914062 62.332031 -7.742188 57.25 -4.640625 C 52.175781 -1.546875 46.101562 0 39.03125 0 Z M 39.03125 -16.34375 C 42.425781 -16.34375 45.4375 -16.90625 48.0625 -18.03125 C 50.6875 -19.15625 52.765625 -21.0625 54.296875 -23.75 C 55.828125 -26.4375 56.59375 -30.097656 56.59375 -34.734375 C 56.59375 -39.367188 55.828125 -43.03125 54.296875 -45.71875 C 52.765625 -48.40625 50.6875 -50.3125 48.0625 -51.4375 C 45.4375 -52.5625 42.425781 -53.125 39.03125 -53.125 C 35.6875 -53.125 32.6875 -52.5625 30.03125 -51.4375 C 27.375 -50.3125 25.28125 -48.40625 23.75 -45.71875 C 22.21875 -43.03125 21.453125 -39.367188 21.453125 -34.734375 C 21.453125 -30.097656 22.21875 -26.4375 23.75 -23.75 C 25.28125 -21.0625 27.375 -19.15625 30.03125 -18.03125 C 32.6875 -16.90625 35.6875 -16.34375 39.03125 -16.34375 Z"/></g></g>
      </g>
    </g>
  </svg>
);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0B0F10;
  --surface:#12181A;
  --surface2:#12181A;
  --surface3:#033E41;
  --border:#033E41;
  --accent:#2BD9C3;
  --accent2:#0AB198;
  --red:#ff4d6d;
  --text:#FFFFFF;
  --muted:#6aada6;
  --gold:#ffd700;
}
body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;min-height:100vh}
.app{max-width:960px;margin:0 auto;padding:1rem 1rem 4rem}
.header{text-align:center;padding:2rem 0 1.5rem;position:relative}
.header-bg{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:600px;height:320px;background:radial-gradient(ellipse,rgba(43,217,195,0.08) 0%,transparent 65%);pointer-events:none}
.nav{display:flex;gap:0.4rem;justify-content:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.4rem;max-width:460px;margin:0 auto 2rem}
.nav-btn{padding:0.55rem 1rem;border-radius:8px;border:none;background:transparent;color:var(--muted);cursor:pointer;font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:600;transition:all 0.2s;flex:1;text-align:center}
.nav-btn:hover{color:var(--text)}
.nav-btn.active{background:var(--surface3);color:var(--accent);box-shadow:0 0 0 1px rgba(43,217,195,0.3)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.5rem;margin-bottom:1rem}
.card-sm{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem}
.card-title{font-size:0.78rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:2.5px;margin-bottom:1.2rem;font-family:'JetBrains Mono',monospace}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem}
@media(max-width:600px){.form-grid{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:0.4rem}
.field.full{grid-column:1/-1}
label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-family:'JetBrains Mono',monospace}
input{background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:0.65rem 0.9rem;font-family:'Syne',sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.2s;width:100%}
input:focus{border-color:var(--accent)}
input::placeholder{color:var(--muted)}
.crypto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.45rem;margin-top:0.5rem}
.crypto-chip{padding:0.5rem 0.6rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);cursor:pointer;text-align:center;transition:all 0.15s;user-select:none}
.crypto-chip:hover{border-color:var(--accent2)}
.crypto-chip.selected{border-color:var(--accent);background:rgba(43,217,195,0.08);color:var(--accent)}
.crypto-chip.disabled{opacity:0.35;cursor:not-allowed}
.crypto-sym{font-weight:700;font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.crypto-name{color:var(--muted);font-size:0.68rem;margin-top:1px}
.btn{padding:0.65rem 1.4rem;border-radius:8px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;transition:all 0.18s}
.btn-primary{background:var(--accent2);color:#fff}
.btn-primary:hover{background:var(--accent);color:#0B0F10;transform:translateY(-1px)}
.btn-danger{background:var(--red);color:#fff}
.btn-outline{background:transparent;border:1px solid var(--accent);color:var(--accent)}
.btn-outline:hover{background:rgba(43,217,195,0.08)}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted)}
.btn-ghost:hover{border-color:var(--text);color:var(--text)}
.btn-google{background:#fff;color:#222;display:flex;align-items:center;justify-content:center;gap:0.6rem;width:100%;font-size:0.95rem;padding:0.8rem;border-radius:8px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;transition:all 0.18s}
.btn-google:hover{background:#f0faf9}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;filter:none!important}
.btn-sm{padding:0.35rem 0.9rem;font-size:0.78rem;border-radius:6px}
.badge{display:inline-flex;align-items:center;gap:0.4rem;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.72rem;font-family:'JetBrains Mono',monospace;font-weight:600}
.badge-green{background:rgba(43,217,195,0.1);color:var(--accent);border:1px solid rgba(43,217,195,0.3)}
.badge-blue{background:rgba(10,177,152,0.1);color:var(--accent2);border:1px solid rgba(10,177,152,0.3)}
.badge-muted{background:var(--surface2);color:var(--muted);border:1px solid var(--border)}
.pulse{width:5px;height:5px;border-radius:50%;background:currentColor;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
.lb-table{display:flex;flex-direction:column;gap:0.4rem}
.lb-row{display:grid;align-items:center;gap:0.8rem;padding:0.85rem 1rem;border-radius:10px;background:var(--bg);border:1px solid var(--border)}
.lb-row.top1{border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.03)}
.lb-row.top2{border-color:rgba(192,192,192,0.35)}
.lb-row.top3{border-color:rgba(205,127,50,0.35)}
.lb-cols{grid-template-columns:44px 1fr auto}
.lb-rank{font-weight:800;font-family:'JetBrains Mono',monospace;font-size:1.05rem;color:var(--muted);text-align:center}
.r1{color:var(--gold)}.r2{color:#c0c0c0}.r3{color:#cd7f32}
.lb-score{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:0.95rem;text-align:right}
.pos{color:var(--accent)}.neg{color:var(--red)}.neutral{color:var(--muted)}
.team-chips{display:flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.35rem}
.mini-chip{padding:0.12rem 0.45rem;border-radius:4px;background:rgba(43,217,195,0.08);border:1px solid rgba(43,217,195,0.2);font-size:0.65rem;font-family:'JetBrains Mono',monospace;color:var(--accent)}
.calendar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:0.6rem}
.round-card{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;cursor:pointer;transition:all 0.18s}
.round-card:hover{border-color:var(--accent2);transform:translateY(-2px)}
.round-card.active-round{border-color:rgba(43,217,195,0.5);background:rgba(43,217,195,0.04)}
.round-card.completed-round{opacity:0.75}
.round-card.selected-round{border-color:var(--accent2)}
.round-num{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:1.4rem;color:var(--accent);line-height:1}
.round-name{font-weight:700;font-size:0.9rem;margin:0.3rem 0 0.2rem}
.round-dates{font-size:0.72rem;color:var(--muted)}
.tab-bar{display:flex;border-bottom:1px solid var(--border);margin-bottom:1.2rem;overflow-x:auto}
.tab{padding:0.6rem 1.1rem;font-size:0.82rem;font-weight:600;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.18s;font-family:'JetBrains Mono',monospace;white-space:nowrap}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.alert{padding:0.8rem 1rem;border-radius:8px;font-size:0.84rem;margin-bottom:1rem;line-height:1.5}
.alert-success{background:rgba(43,217,195,0.08);border:1px solid rgba(43,217,195,0.3);color:var(--accent)}
.alert-error{background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.3);color:var(--red)}
.alert-info{background:rgba(10,177,152,0.08);border:1px solid rgba(10,177,152,0.3);color:var(--accent2)}
.flex{display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap}
.flex-between{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem}
.mt{margin-top:1rem}
.text-muted{color:var(--muted);font-size:0.82rem}
.loading{text-align:center;padding:3rem;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.8rem;margin-bottom:1.2rem}
.stat-box{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;text-align:center}
.stat-num{font-size:1.8rem;font-weight:800;font-family:'JetBrains Mono',monospace;color:var(--accent)}
.stat-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-top:0.3rem}
.empty{text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem}
.avatar{width:36px;height:36px;border-radius:50%;border:2px solid var(--accent)}
.user-bar{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:0.7rem 1rem;margin-bottom:1rem}
.user-info{display:flex;align-items:center;gap:0.6rem}
.user-name{font-weight:700;font-size:0.9rem}
.user-email{font-size:0.72rem;color:var(--muted)}
.lock-badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.72rem;color:var(--red);font-family:'JetBrains Mono',monospace}
`;

export default function App() {
  const isAdmin = window.location.pathname.includes(ADMIN_SECRET) ||
    new URLSearchParams(window.location.search).get("admin") === ADMIN_SECRET;
  const [page, setPage] = useState(isAdmin ? "admin" : "squadra");
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  if (loadingAuth) return (<><style>{css}</style><div className="app"><div className="loading">Caricamento</div></div></>);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-bg" />
          <LogoSVG />
        </header>

        {user && !isAdmin && (
          <div className="user-bar">
            <div className="user-info">
              {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} className="avatar" alt="avatar" />}
              <div>
                <div className="user-name">{user.user_metadata?.full_name || "Utente"}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => supabase.auth.signOut()}>Esci</button>
          </div>
        )}

        <nav className="nav">
          {!isAdmin && (<>
            <button className={`nav-btn ${page === "squadra" ? "active" : ""}`} onClick={() => setPage("squadra")}>La mia squadra</button>
            <button className={`nav-btn ${page === "leaderboard" ? "active" : ""}`} onClick={() => setPage("leaderboard")}>Classifica</button>
          </>)}
          {isAdmin && <button className={`nav-btn ${page === "admin" ? "active" : ""}`} onClick={() => setPage("admin")}>Admin</button>}
        </nav>

        {page === "squadra" && !isAdmin && (user ? <SquadraPage user={user} /> : <LoginPage onLogin={signInWithGoogle} />)}
        {page === "leaderboard" && <LeaderboardPage />}
        {page === "admin" && isAdmin && <AdminPage adminAuthed={adminAuthed} setAdminAuthed={setAdminAuthed} />}
      </div>
    </>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div className="card" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
      <div style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "0.4rem" }}>Entra in FantaCrypto</div>
      <p className="text-muted" style={{ marginBottom: "1.5rem", lineHeight: 1.6 }}>Accedi con Google per registrare la tua squadra e competere nella classifica.</p>
      <button className="btn-google" onClick={onLogin}>
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.7 39.7 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
        </svg>
        Accedi con Google
      </button>
    </div>
  );
}

function SquadraPage({ user }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [form, setForm] = useState({ nome: "", cognome: "", squadra: "" });
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const [{ data: teamData }, { data: roundData }] = await Promise.all([
      supabase.from("teams").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("rounds").select("*").eq("stato", "active").maybeSingle(),
    ]);
    setTeam(teamData || null);
    setActiveRound(roundData || null);
    if (teamData) {
      setForm({ nome: teamData.nome, cognome: teamData.cognome, squadra: teamData.squadra });
      setSelected(teamData.cryptos || []);
    }
    setLoading(false);
    if (!teamData) setEditing(true);
  }

  function toggleCrypto(c) {
    setSelected(prev => {
      if (prev.find(x => x.id === c.id)) return prev.filter(x => x.id !== c.id);
      if (prev.length >= 5) return prev;
      return [...prev, c];
    });
  }

  async function saveTeam() {
    if (!form.nome || !form.cognome || !form.squadra) return setStatus({ type: "error", msg: "Compila tutti i campi." });
    if (selected.length !== 5) return setStatus({ type: "error", msg: "Seleziona esattamente 5 crypto." });
    setSaving(true);
    const payload = { user_id: user.id, email: user.email, nome: form.nome, cognome: form.cognome, squadra: form.squadra, cryptos: selected };
    const { error } = team
      ? await supabase.from("teams").update(payload).eq("user_id", user.id)
      : await supabase.from("teams").insert([payload]);
    if (error) { setStatus({ type: "error", msg: error.message }); }
    else { setStatus({ type: "success", msg: team ? "✅ Squadra aggiornata!" : "🚀 Squadra registrata!" }); setEditing(false); loadData(); }
    setSaving(false);
  }

  if (loading) return <div className="loading">Caricamento</div>;
  const canEdit = !activeRound;

  return (
    <div>
      {status && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
      {team && !editing && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <div className="card-title" style={{ margin: 0 }}>// La tua squadra</div>
            {canEdit ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Modifica</button> : <span className="lock-badge">🔒 Giornata in corso</span>}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 800, fontSize: "1.3rem" }}>{team.squadra}</div>
            <div className="text-muted">{team.nome} {team.cognome}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem", fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "1px" }}>Le tue 5 crypto</div>
          <div className="team-chips" style={{ gap: "0.4rem" }}>
            {team.cryptos.map(c => (
              <span key={c.id} style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", background: "rgba(43,217,195,0.08)", border: "1px solid rgba(43,217,195,0.25)", fontSize: "0.85rem", fontFamily: "JetBrains Mono", fontWeight: 700, color: "var(--accent)" }}>
                {c.symbol} <span style={{ color: "var(--muted)", fontWeight: 400 }}>{c.name}</span>
              </span>
            ))}
          </div>
          {!canEdit && <div className="alert alert-info mt">⚡ Giornata in corso — puoi modificare solo tra una giornata e l'altra.</div>}
        </div>
      )}
      {editing && (
        <div className="card">
          <div className="card-title">{team ? "// Modifica squadra" : "// Registra la tua squadra"}</div>
          <div className="card-sm" style={{ marginBottom: "1rem" }}>
            <div className="flex">
              {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} className="avatar" alt="avatar" />}
              <div><div style={{ fontWeight: 700 }}>{user.user_metadata?.full_name}</div><div className="text-muted">{user.email}</div></div>
            </div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Nome</label><input placeholder="Mario" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
            <div className="field"><label>Cognome</label><input placeholder="Rossi" value={form.cognome} onChange={e => setForm(p => ({ ...p, cognome: e.target.value }))} /></div>
            <div className="field full"><label>Nome Squadra</label><input placeholder="Moon Hunters" value={form.squadra} onChange={e => setForm(p => ({ ...p, squadra: e.target.value }))} /></div>
            <div className="field full">
              <label>Scegli 5 Crypto ({selected.length}/5)</label>
              <div className="crypto-grid">
                {TOP_CRYPTOS.map(c => {
                  const isSel = !!selected.find(x => x.id === c.id);
                  const isDis = !isSel && selected.length >= 5;
                  return (
                    <div key={c.id} className={`crypto-chip ${isSel ? "selected" : ""} ${isDis ? "disabled" : ""}`} onClick={() => !isDis && toggleCrypto(c)}>
                      <div className="crypto-sym">{c.symbol}</div>
                      <div className="crypto-name">{c.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex mt">
            <button className="btn btn-primary" onClick={saveTeam} disabled={saving}>{saving ? "Salvataggio..." : team ? "Salva modifiche" : "Registra Squadra →"}</button>
            {team && <button className="btn btn-ghost" onClick={() => { setEditing(false); setStatus(null); }}>Annulla</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardPage() {
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scores, setScores] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [tab, setTab] = useState("generale");
  const [selRound, setSelRound] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: t }, { data: r }, { data: s }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("rounds").select("*").order("numero"),
      supabase.from("round_scores").select("*"),
    ]);
    setTeams(t || []); setRounds(r || []); setScores(s || []);
    const active = (r || []).find(x => x.stato === "active");
    if (active && t?.length) {
      try {
        const ids = [...new Set(t.flatMap(team => team.cryptos.map(c => c.id)))];
        const prices = await fetchCryptoPrices(ids);
        setLiveData({ round: active, teams: t.map(team => ({ ...team, live_score: calcScore(team.cryptos, active.start_prices, prices) })).sort((a, b) => (b.live_score ?? -Infinity) - (a.live_score ?? -Infinity)) });
      } catch { setLiveData(null); }
    } else { setLiveData(null); }
    if (!selRound && r?.length) {
      const a = r.find(x => x.stato === "active");
      const l = [...(r || [])].reverse().find(x => x.stato === "completed");
      setSelRound(a || l || r[0]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  if (loading) return <div className="loading">Caricamento classifica</div>;

  const activeRound = rounds.find(r => r.stato === "active");
  const completed = rounds.filter(r => r.stato === "completed");
  const general = teams.map(team => {
    let total = 0, count = 0;
    for (const r of completed) {
      const s = scores.find(x => x.round_id === r.id && x.team_id === team.id);
      if (s?.score != null) { total += Number(s.score); count++; }
    }
    return { ...team, total_score: count ? total : null, rounds_played: count };
  }).sort((a, b) => (b.total_score ?? -Infinity) - (a.total_score ?? -Infinity));

  const rankIcon = i => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
  const scoreClass = s => s == null ? "neutral" : Number(s) >= 0 ? "pos" : "neg";

  function roundRanking(round) {
    if (!round) return [];
    if (liveData?.round?.id === round.id) return liveData.teams;
    return teams.map(team => ({ ...team, score: scores.find(x => x.round_id === round.id && x.team_id === team.id)?.score ?? null })).sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
  }

  return (
    <div>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: "1rem" }}>
          <div className="flex">
            {activeRound ? <span className="badge badge-green"><div className="pulse" />LIVE · {activeRound.nome}</span> : <span className="badge badge-muted">In attesa</span>}
            <span className="text-muted">{completed.length}/{rounds.length} giornate</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>↻</button>
        </div>
        <div className="tab-bar">
          <div className={`tab ${tab === "generale" ? "active" : ""}`} onClick={() => setTab("generale")}>Generale</div>
          <div className={`tab ${tab === "calendario" ? "active" : ""}`} onClick={() => setTab("calendario")}>Calendario</div>
          {selRound && <div className={`tab ${tab === "giornata" ? "active" : ""}`} onClick={() => setTab("giornata")}>{selRound.nome}</div>}
        </div>
        {tab === "generale" && (general.length === 0 ? <div className="empty">Nessuna squadra ancora.</div> :
          <div className="lb-table">{general.map((team, i) => (
            <div key={team.id} className={`lb-row lb-cols ${i===0?"top1":i===1?"top2":i===2?"top3":""}`}>
              <div className={`lb-rank ${i===0?"r1":i===1?"r2":i===2?"r3":""}`}>{rankIcon(i)}</div>
              <div><div style={{fontWeight:700}}>{team.squadra}</div><div className="text-muted">{team.nome} {team.cognome}</div><div className="team-chips">{(team.cryptos||[]).map(c=><span key={c.id} className="mini-chip">{c.symbol}</span>)}</div></div>
              <div><div className={`lb-score ${scoreClass(team.total_score)}`}>{fmt(team.total_score)}</div><div className="text-muted" style={{fontSize:"0.7rem",textAlign:"right"}}>{team.rounds_played} gior.</div></div>
            </div>
          ))}</div>
        )}
        {tab === "calendario" && (rounds.length === 0 ? <div className="empty">Nessun calendario.</div> :
          <div className="calendar-grid">{rounds.map(r => (
            <div key={r.id} className={`round-card ${r.stato==="active"?"active-round":""} ${r.stato==="completed"?"completed-round":""} ${selRound?.id===r.id?"selected-round":""}`} onClick={() => { setSelRound(r); setTab("giornata"); }}>
              <div className="round-num">{r.numero}</div>
              <div className="round-name">{r.nome}</div>
              <div className="round-dates">{fmtDate(r.data_inizio)} → {fmtDate(r.data_fine)}</div>
              <div style={{marginTop:"0.6rem"}}>
                {r.stato==="active"&&<span className="badge badge-green" style={{fontSize:"0.65rem"}}><div className="pulse"/>LIVE</span>}
                {r.stato==="completed"&&<span className="badge badge-muted" style={{fontSize:"0.65rem"}}>Completata</span>}
                {r.stato==="scheduled"&&<span className="badge badge-blue" style={{fontSize:"0.65rem"}}>Programmata</span>}
              </div>
            </div>
          ))}</div>
        )}
        {tab === "giornata" && selRound && (() => {
          const ranking = roundRanking(selRound);
          return (<>
            <div className="flex-between" style={{marginBottom:"1rem"}}>
              <div><div style={{fontWeight:700}}>{selRound.nome}</div><div className="text-muted">{fmtDate(selRound.data_inizio)} → {fmtDate(selRound.data_fine)}</div></div>
              {selRound.stato==="active"&&<span className="badge badge-green"><div className="pulse"/>LIVE</span>}
              {selRound.stato==="completed"&&<span className="badge badge-muted">Completata</span>}
              {selRound.stato==="scheduled"&&<span className="badge badge-blue">Programmata</span>}
            </div>
            {selRound.stato==="scheduled" ? <div className="empty">Non ancora iniziata.</div> : ranking.length===0 ? <div className="empty">Nessun dato.</div> :
              <div className="lb-table">{ranking.map((team,i) => {
                const score = team.live_score !== undefined ? team.live_score : team.score;
                return (
                  <div key={team.id} className={`lb-row lb-cols ${i===0?"top1":i===1?"top2":i===2?"top3":""}`}>
                    <div className={`lb-rank ${i===0?"r1":i===1?"r2":i===2?"r3":""}`}>{rankIcon(i)}</div>
                    <div><div style={{fontWeight:700}}>{team.squadra}</div><div className="team-chips">{(team.cryptos||[]).map(c=><span key={c.id} className="mini-chip">{c.symbol}</span>)}</div></div>
                    <div className={`lb-score ${scoreClass(score)}`}>{fmt(score)}</div>
                  </div>
                );
              })}</div>
            }
          </>);
        })()}
      </div>
    </div>
  );
}

function AdminPage({ adminAuthed, setAdminAuthed }) {
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState("calendario");
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [calForm, setCalForm] = useState({ totalRounds: 8, startDate: "", intervalDays: 7 });

  function login() { if (pw === ADMIN_PASSWORD) { setAdminAuthed(true); loadAll(); } else setPwErr(true); }

  async function loadAll() {
    const [{ data: t }, { data: r }] = await Promise.all([supabase.from("teams").select("*").order("created_at"), supabase.from("rounds").select("*").order("numero")]);
    setTeams(t || []); setRounds(r || []);
  }

  useEffect(() => { if (adminAuthed) loadAll(); }, [adminAuthed]);

  if (!adminAuthed) return (
    <div className="card" style={{ maxWidth: 360, margin: "0 auto" }}>
      <div className="card-title">// Accesso Admin</div>
      {pwErr && <div className="alert alert-error">Password errata.</div>}
      <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /></div>
      <button className="btn btn-primary mt" onClick={login}>Accedi</button>
    </div>
  );

  async function generateCalendar() {
    if (!calForm.startDate) return setMsg({ type: "error", msg: "Inserisci la data di inizio." });
    setBusy(true);
    try {
      await supabase.from("round_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const newRounds = [];
      for (let i = 0; i < calForm.totalRounds; i++) {
        const start = new Date(calForm.startDate); start.setDate(start.getDate() + i * calForm.intervalDays);
        const end = new Date(start); end.setDate(end.getDate() + calForm.intervalDays);
        newRounds.push({ numero: i+1, nome: `Giornata ${i+1}`, data_inizio: start.toISOString(), data_fine: end.toISOString(), stato: "scheduled" });
      }
      await supabase.from("rounds").insert(newRounds);
      setMsg({ type: "success", msg: `✅ Calendario creato: ${calForm.totalRounds} giornate.` }); loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function startRound(round) {
    setBusy(true);
    try {
      const { data: t } = await supabase.from("teams").select("cryptos");
      const prices = await fetchCryptoPrices([...new Set(t.flatMap(x => x.cryptos.map(c => c.id)))]);
      await supabase.from("rounds").update({ stato: "active", start_prices: prices, data_inizio: new Date().toISOString() }).eq("id", round.id);
      setMsg({ type: "success", msg: "▶ Giornata avviata!" }); loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function stopRound(round) {
    setBusy(true);
    try {
      const { data: t } = await supabase.from("teams").select("*");
      const endPrices = await fetchCryptoPrices([...new Set(t.flatMap(x => x.cryptos.map(c => c.id)))]);
      await supabase.from("rounds").update({ stato: "completed", end_prices: endPrices, data_fine: new Date().toISOString() }).eq("id", round.id);
      await supabase.from("round_scores").upsert(t.map(team => ({ round_id: round.id, team_id: team.id, score: calcScore(team.cryptos, round.start_prices, endPrices) })), { onConflict: "round_id,team_id" });
      setMsg({ type: "success", msg: "■ Giornata terminata!" }); loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function deleteTeam(id) {
    await supabase.from("round_scores").delete().eq("team_id", id);
    await supabase.from("teams").delete().eq("id", id);
    loadAll();
  }

  async function fullReset() {
    setBusy(true);
    await supabase.from("round_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setConfirmReset(false); setMsg({ type: "success", msg: "Reset completato." }); loadAll(); setBusy(false);
  }

  const activeRound = rounds.find(r => r.stato === "active");
  const completed = rounds.filter(r => r.stato === "completed");

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)} style={{ cursor: "pointer" }}>{msg.msg} ✕</div>}
      <div className="card">
        <div className="stat-grid">
          <div className="stat-box"><div className="stat-num">{teams.length}</div><div className="stat-label">Squadre</div></div>
          <div className="stat-box"><div className="stat-num">{rounds.length}</div><div className="stat-label">Giornate</div></div>
          <div className="stat-box"><div className="stat-num">{completed.length}</div><div className="stat-label">Completate</div></div>
          <div className="stat-box"><div style={{paddingTop:"0.3rem"}}>{activeRound?<span className="badge badge-green"><div className="pulse"/>LIVE</span>:<span style={{color:"var(--muted)",fontFamily:"JetBrains Mono",fontWeight:700}}>—</span>}</div><div className="stat-label">Stato</div></div>
        </div>
        <div className="tab-bar">
          <div className={`tab ${tab==="calendario"?"active":""}`} onClick={() => setTab("calendario")}>Calendario</div>
          <div className={`tab ${tab==="squadre"?"active":""}`} onClick={() => setTab("squadre")}>Squadre ({teams.length})</div>
          <div className={`tab ${tab==="impostazioni"?"active":""}`} onClick={() => setTab("impostazioni")}>Impostazioni</div>
        </div>
        {tab === "calendario" && (<>
          <div className="card-sm" style={{marginBottom:"1rem"}}>
            <div style={{fontWeight:700,marginBottom:"0.8rem",fontSize:"0.85rem"}}>📅 Genera Calendario</div>
            <div className="form-grid">
              <div className="field"><label>Giornate</label><input type="number" min="1" max="52" value={calForm.totalRounds} onChange={e => setCalForm(p => ({...p,totalRounds:parseInt(e.target.value)}))} /></div>
              <div className="field"><label>Durata (giorni)</label><input type="number" min="1" max="30" value={calForm.intervalDays} onChange={e => setCalForm(p => ({...p,intervalDays:parseInt(e.target.value)}))} /></div>
              <div className="field full"><label>Data Inizio</label><input type="date" value={calForm.startDate} onChange={e => setCalForm(p => ({...p,startDate:e.target.value}))} /></div>
            </div>
            <div className="flex mt">
              <button className="btn btn-primary btn-sm" onClick={generateCalendar} disabled={busy}>{busy?"...":"Genera"}</button>
              <span className="text-muted" style={{fontSize:"0.75rem"}}>⚠ Sovrascrive</span>
            </div>
          </div>
          {rounds.length === 0 ? <div className="empty">Nessun calendario.</div> :
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>{rounds.map(r => (
              <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"0.8rem",padding:"0.8rem 1rem",background:"var(--bg)",borderRadius:"10px",border:`1px solid ${r.stato==="active"?"rgba(43,217,195,0.4)":"var(--border)"}`}}>
                <div>
                  <div className="flex"><span style={{fontWeight:700,fontSize:"0.9rem"}}>{r.nome}</span>
                    {r.stato==="active"&&<span className="badge badge-green" style={{fontSize:"0.65rem"}}><div className="pulse"/>LIVE</span>}
                    {r.stato==="completed"&&<span className="badge badge-muted" style={{fontSize:"0.65rem"}}>Completata</span>}
                    {r.stato==="scheduled"&&<span className="badge badge-blue" style={{fontSize:"0.65rem"}}>Programmata</span>}
                  </div>
                  <div className="text-muted" style={{fontSize:"0.78rem",marginTop:"0.2rem"}}>{fmtDate(r.data_inizio)} → {fmtDate(r.data_fine)}</div>
                </div>
                <div>
                  {r.stato==="scheduled"&&!activeRound&&<button className="btn btn-primary btn-sm" onClick={() => startRound(r)} disabled={busy}>▶ Avvia</button>}
                  {r.stato==="active"&&<button className="btn btn-danger btn-sm" onClick={() => stopRound(r)} disabled={busy}>■ Termina</button>}
                </div>
              </div>
            ))}</div>
          }
        </>)}
        {tab === "squadre" && (teams.length === 0 ? <div className="empty">Nessuna squadra.</div> :
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>{teams.map((team,i) => (
            <div key={team.id} style={{display:"grid",gridTemplateColumns:"28px 1fr auto",gap:"0.8rem",alignItems:"center",padding:"0.75rem 1rem",background:"var(--bg)",borderRadius:"10px",border:"1px solid var(--border)"}}>
              <span style={{fontFamily:"JetBrains Mono",color:"var(--muted)",fontWeight:700,fontSize:"0.85rem"}}>#{i+1}</span>
              <div><div style={{fontWeight:700}}>{team.squadra}</div><div className="text-muted">{team.nome} {team.cognome} · {team.email}</div><div className="team-chips">{(team.cryptos||[]).map(c=><span key={c.id} className="mini-chip">{c.symbol}</span>)}</div></div>
              <button onClick={() => deleteTeam(team.id)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:"1.1rem"}}>✕</button>
            </div>
          ))}</div>
        )}
        {tab === "impostazioni" && (
          <div className="card-sm" style={{borderColor:"rgba(255,77,109,0.25)"}}>
            <div style={{fontWeight:700,color:"var(--red)",marginBottom:"0.6rem"}}>⚠ Reset Completo</div>
            <p className="text-muted" style={{marginBottom:"0.8rem",lineHeight:1.6}}>Elimina squadre, punteggi e calendario. Irreversibile.</p>
            {!confirmReset ? <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Reset Tutto</button> :
              <div className="flex"><span className="text-muted">Sicuro?</span><button className="btn btn-danger btn-sm" onClick={fullReset} disabled={busy}>Sì, cancella tutto</button><button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Annulla</button></div>}
          </div>
        )}
      </div>
    </div>
  );
}
