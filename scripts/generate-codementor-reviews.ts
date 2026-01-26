import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, basename, extname } from 'path';

interface CodementorReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  authorImage?: string;
  authorImageLocal?: string;
}

interface RawReview {
  id: number;
  reviewer_name: string;
  date: string;
  rating: number;
  review_text: string;
  profile_image_url: string | null;
}

async function downloadImage(url: string, localPath: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure directory exists
    const dir = join(process.cwd(), 'public', 'assets', 'images', 'codementor');
    mkdirSync(dir, { recursive: true });

    writeFileSync(localPath, buffer);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to download ${url}:`, error);
    return false;
  }
}

function generateLocalImagePath(url: string, authorName: string, reviewId: number): string {
  const filename = basename(url.split('?')[0]); // Remove query parameters
  const ext = extname(filename) || '.jpg'; // Default to .jpg if no extension

  // Create a safe filename from author name and review ID
  const safeAuthorName = authorName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalFilename = safeFilename.endsWith(ext)
    ? `${reviewId}_${safeAuthorName}_${safeFilename}`
    : `${reviewId}_${safeAuthorName}_${safeFilename}${ext}`;

  return join('public', 'assets', 'images', 'codementor', finalFilename);
}

async function generateCodementorReviews() {
  try {
    console.log('Generating Codementor reviews data...');

    // Read the raw reviews data
    const rawDataPath = join(process.cwd(), 'public', 'data', 'codementor-reviews-raw.json');
    const rawData = JSON.parse(readFileSync(rawDataPath, 'utf-8'));
    const rawReviews: RawReview[] = rawData.reviews;

    console.log(`Found ${rawReviews.length} reviews in raw data`);

    // Transform to our format
    const reviews: CodementorReview[] = rawReviews.map((raw) => ({
      id: `review-${raw.id}`,
      author: raw.reviewer_name,
      date: raw.date,
      rating: Math.round(raw.rating), // Convert 5.0 to 5
      text: raw.review_text,
      authorImage: raw.profile_image_url || undefined,
    }));

    // Download author images (only download if they don't already exist)
    console.log('\nChecking author images...');

    // Collect all images that need downloading
    const imagesToDownload: Array<{ review: CodementorReview; url: string; localPath: string; }> = [];

    for (const review of reviews) {
      if (review.authorImage && review.authorImage.startsWith('http')) {
        const localPath = generateLocalImagePath(review.authorImage, review.author, parseInt(review.id.replace('review-', '')));
        if (!existsSync(localPath)) {
          imagesToDownload.push({ review, url: review.authorImage, localPath });
        } else {
          review.authorImageLocal = `/assets/images/codementor/${basename(localPath)}`;
        }
      }
    }

    if (imagesToDownload.length > 0) {
      console.log(`  Found ${imagesToDownload.length} images to download (downloading in parallel)...`);

      // Download images in parallel (batch of 10 at a time to avoid overwhelming the network)
      const BATCH_SIZE = 10;
      for (let i = 0; i < imagesToDownload.length; i += BATCH_SIZE) {
        const batch = imagesToDownload.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(({ url, localPath }) => downloadImage(url, localPath))
        );

        // Update reviews with local paths for successful downloads
        batch.forEach(({ review, localPath }, index) => {
          if (results[index].status === 'fulfilled' && results[index].value) {
            review.authorImageLocal = `/assets/images/codementor/${basename(localPath)}`;
          }
        });

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`  ✅ Downloaded batch ${Math.floor(i / BATCH_SIZE) + 1}: ${successCount}/${batch.length} images`);
      }
    } else {
      console.log('  ✅ All images already exist, skipping downloads');
    }

    // Create public/data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Write reviews to JSON file
    writeFileSync(
      join(dataDir, 'codementor-reviews.json'),
      JSON.stringify(reviews, null, 2)
    );
    console.log(`\n✅ Generated public/data/codementor-reviews.json with ${reviews.length} reviews`);
    console.log('Codementor reviews data generation complete!');

  } catch (error) {
    console.error('Error generating Codementor reviews data:', error);
    process.exit(1);
  }
}

generateCodementorReviews();
