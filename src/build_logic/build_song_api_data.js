/**
 * Build song data API files for rabbithole player dynamic loading
 */

import fs from 'fs';
import path from 'path';
import { getProjectDirs } from './locations.js';
import { getShowAndSetData } from './show_and_set_data.js';

export function buildSongAPIData() {
    console.log('🎵 Building song API data...');

    const { outputPrimarySiteDir } = getProjectDirs();
    const { songs } = getShowAndSetData();

    // Create API directory for songs
    const apiDir = path.join(outputPrimarySiteDir, 'api', 'songs');
    fs.mkdirSync(apiDir, { recursive: true });

    let songsBuilt = 0;

    // Iterate through all songs and create JSON files for those with chartifacts
    for (const [slug, songData] of Object.entries(songs)) {
        // Check if song has studio versions with chartifacts
        if (songData.studio_versions && typeof songData.studio_versions === 'object') {
            // studio_versions is an object like: { 0: { "Vowel Sounds": { ensemble: ..., chartifacts: ... } } }
            for (const artistVersions of Object.values(songData.studio_versions)) {
                if (typeof artistVersions === 'object') {
                    // Iterate through each album for this artist
                    for (const [albumName, versionData] of Object.entries(artistVersions)) {
                        // Check if this version has chartifacts
                        if (versionData.chartifacts && versionData.ensemble) {
                            // Create a clean data structure for the client
                            const songAPIData = {
                                slug: slug,
                                title: songData.title || slug.replace(/-/g, ' '),
                                album: albumName,
                                ensemble: versionData.ensemble,
                                chartifacts: {
                                    audioFile: versionData.chartifacts.audioFile,
                                    duration: versionData.chartifacts.duration,
                                    timeline: versionData.chartifacts.timeline,
                                    standardSectionLength: versionData.chartifacts.standardSectionLength,
                                    colorScheme: versionData.chartifacts.colorScheme || null
                                }
                            };

                            // Write the JSON file
                            const outputPath = path.join(apiDir, `${slug}.json`);
                            fs.writeFileSync(
                                outputPath,
                                JSON.stringify(songAPIData, null, 2)
                            );

                            songsBuilt++;
                            console.log(`  ✓ Built API data for: ${slug}`);
                        }
                    }
                }
            }
        }
    }

    console.log(`✅ Built ${songsBuilt} song API files`);
}
