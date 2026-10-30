// D1 allows at most 100 bound parameters per statement; an insert row binds 12.
export const IMPORT_CHUNK_SIZE = 8;
export const MAX_IMPORT_ROWS = 5000;

// D1 allows at most 100 bound parameters per statement; an update binds the user id, the category, the source and the ids.
export const MAX_UPDATE_IDS = 90;
