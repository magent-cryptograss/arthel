import { initProjectDirs } from './src/build_logic/locations.js';
import { buildSongAPIData } from './src/build_logic/build_song_api_data.js';

initProjectDirs('justinholmes.com');
buildSongAPIData();
