const chunkPaths = [
  './chunks/01.txt',
  './chunks/02.txt',
  './chunks/03.txt',
  './chunks/04.txt',
  './chunks/05.txt',
  './chunks/06.txt',
  './chunks/07.txt',
  './chunks/08.txt',
  './chunks/09.txt',
  './chunks/10.txt',
  './chunks/11.txt',
  './chunks/12.txt',
  './chunks/13.txt',
  './chunks/14.txt',
  './chunks/15.txt',
  './chunks/16.txt',
  './chunks/17.txt',
  './chunks/18.txt',
  './chunks/19.txt',
  './chunks/20.txt'
];

try {
  const parts = await Promise.all(chunkPaths.map(async (path) => {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
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
