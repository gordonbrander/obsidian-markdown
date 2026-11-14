// The document and vault shared by the ofm-note and ofm-markdown demos.
import doc from './looking-glass.md?raw';
import jabberwocky from './jabberwocky.md?raw';
import { noteService } from '/src/services/note.ts';

const vault = { Jabberwocky: jabberwocky };
noteService.setLoader(async (name) => vault[name]);

export { doc };
