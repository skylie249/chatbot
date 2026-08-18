const BAD_WORDS = [
  '개새끼', '씨발', '병신', '지랄', '좆', '미친', '염병', '새끼', '존나', '씹', '닥쳐', '꺼져', '호로자식', '등신', '호구', '느금마', '느애비', '엠창', '창녀', '걸레',
  '시발', '씨빨', '씨바', '시바', '씨벌', '개새', '새키', '졸라', '찌랄', 'ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㅈㄴ'
];

// Allow optional whitespace/punctuation between each character so simple
// evasion like "시 발" or "시.발" is still caught. Not foolproof (jamo
// splitting, homoglyphs, etc. still slip through) but meaningfully harder
// to bypass than a plain substring match.
const SEPARATOR = '[\\s.\\-_*~!@#^&]*';

const escapeChar = (char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const wordPatterns = BAD_WORDS.map(
  (word) => new RegExp(word.split('').map(escapeChar).join(SEPARATOR), 'gi')
);

export function filterProfanity(text) {
  if (!text) return text;

  let filtered = text;
  wordPatterns.forEach((pattern) => {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  });

  return filtered;
}
