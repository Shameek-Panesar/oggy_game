import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
if (!process.argv[2]) throw new Error('Usage: node scripts/bundle.js <esbuild executable>');
const result=spawnSync(process.argv[2],[
  'scripts/preview.js','--bundle','--format=iife','--minify','--legal-comments=inline'
],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
if(result.status!==0) throw result.error??new Error(result.stderr);
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
writeFileSync(new URL('../Play House.html',import.meta.url),
  html.replace('<!-- BUILD:PREVIEW -->',()=>'<script>\n'+result.stdout.replace(/<\/script/gi,'<\\/script')+'\n</script>'));
