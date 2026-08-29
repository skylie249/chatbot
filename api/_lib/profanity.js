import Filter from 'badwords-ko';

// badwords-ko ships a maintained list of ~570 Korean profanity entries -
// broader and better curated than a hand-rolled list. Supplement with a
// couple of common consonant-only abbreviations it doesn't include.
const filter = new Filter({ list: ['ㅅㅂ', 'ㅂㅅ'] });

// Filter#clean() splits the input on whitespace (including newlines) and
// rejoins with a single space, which would flatten multi-line form input
// into one line. Run it per line instead so paragraph breaks in user
// submissions survive.
export function filterProfanity(text) {
  if (!text) return text;

  return text
    .split('\n')
    .map((line) => filter.clean(line))
    .join('\n');
}
