const chunkPaths = [
  '01.txt',
  '02.txt',
  '03.txt',
  '04.txt',
  '05.txt',
  '06.txt',
  '07.txt',
  '08.txt',
  '09.txt',
  '10.txt'
].map((name) => new URL(`./chunks/${name}`, import.meta.url));

try {
  const parts = await Promise.all(chunkPaths.map(async (url) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url.pathname}: ${response.status}`);
    return response.text();
  }));
  const source = parts.join('');
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(url);
  } finally {
    URL.revokeObjectURL(url);
  }
} catch (error) {
  console.error(error);
  const boot = document.getElementById('boot');
  const fatal = document.getElementById('fatal');
  const fatalText = document.getElementById('fatalText');
  if (boot) boot.style.display = 'none';
  if (fatal) fatal.style.display = 'grid';
  if (fatalText) fatalText.textContent = 'Game files could not be loaded. ' + (error?.message || String(error));
}
