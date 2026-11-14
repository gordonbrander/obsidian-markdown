// The document and vault shared by the ofm-note and ofm-markdown demos.
import doc from './looking-glass.md?raw';
import jabberwocky from './jabberwocky.md?raw';
import { NoteService } from '/src/services/note.ts';

const vault = { Jabberwocky: jabberwocky };
const noteService = new NoteService(async (name) => vault[name]);

export { doc, noteService };
