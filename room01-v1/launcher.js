const fatal=document.getElementById('fatal');
const fatalText=document.getElementById('fatalText');

function fail(err){
  console.error(err);
  if(fatal){fatal.style.display='grid';}
  if(fatalText){fatalText.textContent='Room 01 could not start: '+(err?.message||String(err));}
}

try{
  const packedUrl=new URL('./main.js?v=104',import.meta.url);
  const packed=await fetch(packedUrl,{cache:'no-store'}).then(r=>{
    if(!r.ok) throw new Error('Unable to load game runtime ('+r.status+')');
    return r.text();
  });
  const match=packed.match(/const payload='([^']+)'/);
  if(!match) throw new Error('Packed Room 01 runtime payload is missing');
  if(typeof DecompressionStream!=='function') throw new Error('This browser does not support the Room 01 runtime decompressor');

  const bytes=Uint8Array.from(atob(match[1]),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  let source=await new Response(stream).text();

  const base=new URL('./',import.meta.url);
  const replacements=[
    ["../playground-v2/gamer-bro.js?v=room01",new URL('../playground-v2/gamer-bro.js?v=room01',base).href],
    ["./portal-v2.js?v=102",new URL('./portal-v2.js?v=104',base).href],
    ["./v04-sprites.js?v=102",new URL('./v04-sprites.js?v=104',base).href]
  ];
  for(const [from,to] of replacements) source=source.split(from).join(to);

  const blobUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{
    await import(blobUrl);
  } finally {
    setTimeout(()=>URL.revokeObjectURL(blobUrl),10000);
  }
}catch(err){
  fail(err);
}
