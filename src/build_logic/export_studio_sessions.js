#!/usr/bin/env node
/**
 * Export studio ensembles as JSON, one entry per record.
 *
 *   node src/build_logic/export_studio_sessions.js > sessions.json
 *
 * Who played what on which track lives in src/data/songs_and_tunes/*.yaml,
 * under studio_versions, because the Rabbithole player needs it to follow a
 * picker from one track to the next. PickiPedia wants the same data to answer
 * the question backwards — which records is this musician on — and its
 * importer reads this file's output.
 *
 * Deliberately standalone: no chain data, no build, no network. It reads the
 * YAML and prints. That keeps it runnable from a cron job on a machine that
 * has this checkout and nothing else set up.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SONGS = path.resolve(HERE, '../data/songs_and_tunes');

/**
 * A track's display title.
 *
 * Songs carry a primary_display_name when the filename is not what people call
 * it; otherwise the filename slug is title-cased. "silver-44" is Silver 44,
 * and words that are already capitalised in the slug stay as they are.
 */
function trackTitle(song, slug) {
    if (song.primary_display_name) {
        return song.primary_display_name;
    }
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** The players of one studio version, as a list rather than a map. */
function personnel(version) {
    const ensemble = version.ensemble || {};
    return Object.entries(ensemble).map(([name, instruments]) => ({
        name,
        instruments: Array.isArray(instruments)
            ? instruments
            : String(instruments || '').split(',').map(s => s.trim()).filter(Boolean),
    }));
}

export function collectSessions(songsDir = SONGS) {
    const records = new Map();

    for (const file of fs.readdirSync(songsDir).filter(f => f.endsWith('.yaml'))) {
        const slug = file.replace(/\.yaml$/, '');
        let song;
        try {
            song = yaml.load(fs.readFileSync(path.resolve(songsDir, file), 'utf8')) || {};
        } catch (err) {
            // One unparseable song file should not cost the wiki every other
            // record's personnel. Say which, and carry on.
            process.stderr.write(`skipping ${file}: ${err.message}\n`);
            continue;
        }

        const versions = song.studio_versions || {};
        for (const byArtist of Object.values(versions)) {
            for (const [recordName, version] of Object.entries(byArtist || {})) {
                const players = personnel(version || {});
                if (players.length === 0) {
                    continue;
                }
                if (!records.has(recordName)) {
                    records.set(recordName, { name: recordName, tracks: [] });
                }
                records.get(recordName).tracks.push({
                    title: trackTitle(song, slug),
                    slug,
                    // Session details, where the file bothers to say.
                    recorded: version.record || null,
                    studio: version.studio || null,
                    engineer: version.engineer || null,
                    personnel: players,
                });
            }
        }
    }

    // Alphabetical within a record. The YAML says nothing about running order
    // — that lives on the Release page — and file order is whatever the
    // directory happens to return, which would reshuffle the wiki page for no
    // reason on some other machine.
    for (const record of records.values()) {
        record.tracks.sort((a, b) => a.title.localeCompare(b.title));
    }

    return { records: [...records.values()].sort((a, b) => a.name.localeCompare(b.name)) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const sessions = collectSessions();
    const tracks = sessions.records.reduce((n, r) => n + r.tracks.length, 0);
    process.stderr.write(`${sessions.records.length} records, ${tracks} tracks\n`);
    process.stdout.write(JSON.stringify(sessions, null, 2) + '\n');
}
