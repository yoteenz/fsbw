/**
 * Facade for globe.gl so Vite can code-split it into a dedicated chunk instead of
 * merging dynamic `import('globe.gl')` into the main vendor bundle (~MB-scale parse on mobile).
 */
import Globe from 'globe.gl';

export default Globe;
