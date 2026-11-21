const file = 'E:/opencode-portable-v2/BIO-sienna/index.html';
const source = await Bun.file(file).text();
const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
scripts.forEach((script, index) => {
  new Function(script);
  console.log(`script ${index + 1}: syntax OK`);
});
console.log({
  scripts: scripts.length,
  tracks: (source.match(/src: "music\//g) || []).length,
  photos: (source.match(/src="photo[12]\.jpg"/g) || []).length,
  links: (source.match(/href=/g) || []).length
});

const original = await Bun.file('E:/opencode-portable-v2/BIO-sienna/original.html').text();
const collect = (text, pattern) => [...text.matchAll(pattern)].map(match => match[1]).sort();
for (const [label, pattern] of [
  ['relative assets', /(?:src|href)="((?:photo[12]\.jpg|music\/[^\"]+))"/g],
  ['outbound links', /href="([^\"]+)"/g],
  ['track sources', /src: "(music\/[^\"]+)"/g],
  ['track titles', /title: "([^\"]+)"/g]
]) {
  const before = JSON.stringify(collect(original, pattern));
  const after = JSON.stringify(collect(source, pattern));
  if (before !== after) throw new Error(`${label} changed`);
  console.log(`${label}: preserved`);
}

const luminance = hex => {
  const values = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
};
const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + .05) / (dark + .05);
};
for (const [foreground, background] of [['#fff0e6', '#8a402f'], ['#ffe6d8', '#82402e'], ['#f7cbb5', '#843f30']]) {
  console.log(`contrast ${foreground}/${background}: ${contrast(foreground, background).toFixed(2)}:1`);
}
