const fs = require('fs');
const lines = fs.readFileSync('tmp-out.json', 'utf8').split('\n');
const jsonStr = lines.slice(2).join('\n'); // skip first two lines
const data = JSON.parse(jsonStr);
const target = data.find(x => x.generation_recipe && x.generation_recipe.includes('角栓はオイルで溶かす'));
const parsed = JSON.parse(target.generation_recipe);
fs.writeFileSync('content/blog/oil-cleansing-barrier.md', parsed.captionText);
console.log("Written!");
