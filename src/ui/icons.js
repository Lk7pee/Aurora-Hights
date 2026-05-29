const paths = {
  play: "M8 5v14l11-7-11-7Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  save: "M5 4h12l2 2v14H5V4Zm4 0v6h6V4M8 18h8v-5H8v5Z",
  map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
  bag: "M7 8V7a5 5 0 0 1 10 0v1m-12 0h14l-1 13H6L5 8Z",
  shirt: "M8 4 5 6l-3 4 4 3v7h12v-7l4-3-3-4-3-2a4 4 0 0 1-8 0Z",
  image: "M4 5h16v14H4V5Zm3 11 4-5 3 4 2-3 3 4M8 9h.01",
  settings: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6v3m0 14v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1",
  heart: "M12 21s-8-5.1-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.9-8 11-8 11Z",
  bolt: "M13 2 4 14h7l-1 8 10-13h-7l1-7Z",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v10m-3-7h5a2 2 0 0 1 0 4H9",
  gem: "M6 3h12l4 6-10 12L2 9l4-6Zm-4 6h20M8 3l4 18 4-18",
  book: "M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3V5Zm0 0v17",
  lock: "M7 10V7a5 5 0 0 1 10 0v3m-11 0h12v11H6V10Z",
  back: "M15 18 9 12l6-6",
  home: "M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z",
  rotate: "M4 4h6v6H4V4Zm10 10h6v6h-6v-6ZM20 8a6 6 0 0 0-10.2-4.2L8 5.6M4 16a6 6 0 0 0 10.2 4.2L16 18.4",
  check: "M20 6 9 17l-5-5",
  star: "M12 2 15 9l7 .5-5.3 4.7 1.7 6.8L12 17l-6.4 4 1.7-6.8L2 9.5 9 9l3-7Z",
  trophy: "M7 4h10v3h4a5 5 0 0 1-5 5h-.4A6 6 0 0 1 13 15.9V19h3v2H8v-2h3v-3.1A6 6 0 0 1 8.4 12H8a5 5 0 0 1-5-5h4V4Zm0 5V7H5a3 3 0 0 0 2 2Zm10 0a3 3 0 0 0 2-2h-2v2Z",
  volume: "M4 9v6h4l5 4V5L8 9H4Zm12-1a5 5 0 0 1 0 8m2-11a9 9 0 0 1 0 14",
  mute: "M4 9v6h4l5 4V5L8 9H4Zm13 1 4 4m0-4-4 4",
  message: "M4 5h16v11H8l-4 4V5Zm4 4h8M8 12h5",
  maximize: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  x: "M6 6l12 12M18 6 6 18",
  chevron: "M9 18l6-6-6-6",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"
};

export function icon(name, className = "") {
  const path = paths[name] ?? paths.star;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}
