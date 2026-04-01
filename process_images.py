import os
from PIL import Image, ImageEnhance
import glob

INPUT_DIR = '/Users/satoutakuma/Desktop/pictures'
OUTPUT_DIR = '/Users/satoutakuma/Desktop/hiroo-open/the-skin-atelier/public/images/optimized'
MAX_WIDTH = 1200

def apply_warm_tone(img):
    # Convert image to RGB if not already
    img = img.convert('RGB')
    
    # Split into R, G, B channels
    r, g, b = img.split()
    
    # Increase Red and a bit of Green to make it warm, reduce Blue
    r = r.point(lambda i: i * 1.1 if i * 1.1 < 255 else 255)
    g = g.point(lambda i: i * 1.05 if i * 1.05 < 255 else 255)
    b = b.point(lambda i: i * 0.9)
    
    # Merge back
    warm_img = Image.merge('RGB', (r, g, b))
    
    # Optionally enhance color slightly as well
    enhancer = ImageEnhance.Color(warm_img)
    warm_img = enhancer.enhance(1.1)
    
    return warm_img

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    image_files = glob.glob(os.path.join(INPUT_DIR, '*.*'))
    valid_exts = {'.jpg', '.jpeg', '.png'}
    
    for filepath in image_files:
        ext = os.path.splitext(filepath)[1].lower()
        if ext not in valid_exts:
            continue
            
        filename = os.path.basename(filepath)
        filename_no_ext = os.path.splitext(filename)[0]
        output_filename = f"{filename_no_ext}.webp"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        try:
            with Image.open(filepath) as img:
                # Calculate new size while keeping aspect ratio
                width, height = img.size
                if width > MAX_WIDTH:
                    new_width = MAX_WIDTH
                    new_height = int((MAX_WIDTH / width) * height)
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Apply warm tone
                warm_img = apply_warm_tone(img)
                
                # Save as optimized webp
                warm_img.save(output_path, 'WEBP', quality=85)
                print(f"Processed: {filename} -> {output_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == '__main__':
    main()
