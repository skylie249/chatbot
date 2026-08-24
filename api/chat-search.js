// NOTE: duck-duck-scrape is an unofficial HTML scraper of DuckDuckGo, not
// a supported API. It can break or start returning empty/blocked results
// at any time without notice. The catch block below falls back to the
// model's own knowledge when the search fails, so a scraper outage
// degrades answer quality rather than taking the endpoint down - but if
// search results become unreliable long-term, consider swapping to an
// official search API.
import { search } from 'duck-duck-scrape';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { isRateLimited } from './_lib/rateLimit.js';
import { getClientIp } from './_lib/clientIp.js';
import { isNonEmptyString } from './_lib/validate.js';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

function isRateLimitError(error) {
  return error?.status === 429 || /429/.test(error?.message || '');
}

async function generateWithOpenRouter(prompt) {
  const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  const completion = await openrouter.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0]?.message?.content ?? '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (isRateLimited(`chat-search:${getClientIp(req)}`, { windowMs: 60_000, max: 10 })) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
  }

  try {
    const { userQuery } = req.body || {};

    if (!isNonEmptyString(userQuery, 500)) {
      return res.status(400).json({ error: 'userQuery is required' });
    }

    // 1. DuckDuckGo 웹 검색 수행 (검색 결과 상위 5개 가져오기)
    let searchContext = "";
    try {
      const searchResults = await search(userQuery);
      const topResults = searchResults.results.slice(0, 5);
      searchContext = topResults.map((item, index) => {
        return `[${index + 1}] 제목: ${item.title}\n내용: ${item.description}`;
      }).join('\n\n');
    } catch (e) {
      console.warn('Web search error:', e.message);
      searchContext = "웹 실시간 검색에 실패했습니다. 가지고 있는 자체 지식을 활용하여 답변해주세요.";
    }

    // 2. Gemini API 호출 (429 발생 시 OpenRouter로 폴백)
    const prompt = `너는 최신 검색 결과를 바탕으로 질문에 친절하게 답변해주는 노사협의회 챗봇 AI Assistant이다.
제공된 [검색 결과]를 바탕으로 사용자의 질문에 정확하고 요약해서 답변해줘.
마크다운 기호(별표, 샵 등)는 절대 사용하지 말고 오직 평문(Plain text)으로만 답변해라. 줄바꿈은 자유롭게 사용해라.
검색 결과에 질문에 대한 답이 없다면, 가지고 있는 상식을 활용하되 불확실한 경우 모른다고 답해라.

[검색 결과]
${searchContext}

[질문]
${userQuery}`;

    let text;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (error) {
      if (!isRateLimitError(error)) {
        throw error;
      }
      console.warn('Gemini rate limited (429), falling back to OpenRouter:', error.message);
      text = await generateWithOpenRouter(prompt);
    }

    // 3. 답변 반환 (데이터 저장/로그 없이 즉시 반환)
    return res.status(200).json({ answer: text });
  } catch (error) {
    console.error('AI Search Error:', error);
    return res.status(500).json({ error: '답변 생성 중 오류가 발생했습니다.' });
  }
}
