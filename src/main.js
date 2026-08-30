const chunkPaths = [
  './chunks/part01.txt',
  './chunks/part02.txt',
  './chunks/part03.txt',
  './chunks/part04.txt',
  './chunks/part05.txt'
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
