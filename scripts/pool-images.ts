import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), '../tmp_pictures');
const outputDir = path.join(process.cwd(), 'public/images/pool');
const blogDir = path.join(process.cwd(), 'content/blog');

async function main() {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
    console.log(`Found ${files.length} images to process...`);

    const poolFiles: string[] = [];

    let count = 1;
    for (const file of files) {
        const ext = path.extname(file);
        const inputPath = path.join(inputDir, file);
        const outName = `pool-img-${count}.webp`;
        const outPath = path.join(outputDir, outName);
        
        try {
            await sharp(inputPath)
                .resize({ width: 1200, height: 800, fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(outPath);
            poolFiles.push(`/images/pool/${outName}`);
            count++;
        } catch (e) {
            console.error(`Failed to process ${file}:`, e);
        }
    }

    console.log(`Successfully generated ${poolFiles.length} optimized pool images.`);

    // Replace images in existing blog entries
    const markdowns = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (let i = 0; i < markdowns.length; i++) {
        const mdPath = path.join(blogDir, markdowns[i]);
        let content = fs.readFileSync(mdPath, 'utf8');
        
        // Pick sequential from pool, wrap around if needed
        const poolImage = poolFiles[i % poolFiles.length];
        
        content = content.replace(/image: "https:\/\/images\.pexels\.com[^"]+"/g, `image: "${poolImage}"`);
        // If they had different image formatting
        content = content.replace(/image: 'https:\/\/images\.pexels\.com[^']+'/g, `image: "${poolImage}"`);
        
        fs.writeFileSync(mdPath, content, 'utf8');
        console.log(`Updated ${markdowns[i]} with ${poolImage}`);
    }

    console.log("Done updating markdown files.");
}

main().catch(console.error);
