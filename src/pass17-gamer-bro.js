import {createGamerBro as createBaseGamerBro} from '../playground-v2/gamer-bro.js?v=pass17-base';
import {applyPass17ConceptHero} from './pass17-concept-hero.js?v=17-hero-1';

// Drop-in Pass 17 wrapper. It preserves the proven Gamer Bro controller API while
// applying the Prism Valley V2 concept-match presentation shell to every GB1/GB2
// instance created by the title screen or the world.
export function createGamerBro(THREE, renderer, options={}) {
  const bro=createBaseGamerBro(THREE,renderer,options);
  const colorway=options.colorway==='pink'?'pink':'teal';
  const heroId=colorway==='pink'?'gb1':'gb2';
  const mobile=options.detail==='low';
  const meta=applyPass17ConceptHero(THREE,bro,{heroId,colorway,mobile});
  bro.conceptMatch=meta;
  if(typeof window!=='undefined'){
    window.__pass17ConceptHeroInstances=(window.__pass17ConceptHeroInstances||0)+1;
    window.__pass17ConceptHeroLast=meta;
    document.documentElement.dataset.conceptHero='1';
  }
  return bro;
}
