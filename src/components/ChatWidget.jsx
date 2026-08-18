import React, { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    sender: 'bot',
    text: '안녕하세요! 노사협의회 근로자위원 챗봇입니다. 원하시는 메뉴를 선택해 주세요.',
    options: [
      { label: '규정 파일 다운로드', action: 'SELECT_MENU', value: 'REGULATION' },
      { label: '일반 문의 (AI 검색)', action: 'SELECT_MENU', value: 'AI_SEARCH' }
    ]
  }
];

export default function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState('menu'); // 'menu' | 'ai_search'
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const query = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setIsSubmitting(true);

    setChatMessages(prev => [...prev, { sender: 'bot', text: '웹에서 정보를 검색하여 답변을 생성 중입니다...', isLoading: true, id: 'loading' }]);

    try {
      const response = await fetch('/api/chat-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: query })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => {
          const newMessages = prev.filter(msg => msg.id !== 'loading');
          return [
            ...newMessages,
            {
              sender: 'bot',
              text: data.answer,
              options: [
                { label: '다른 기능 선택하기', action: 'SELECT_MENU', value: 'HOME' }
              ]
            }
          ];
        });
      } else {
        setChatMessages(prev => {
          const newMessages = prev.filter(msg => msg.id !== 'loading');
          return [
            ...newMessages,
            { sender: 'bot', text: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.' }
          ];
        });
      }
    } catch (error) {
      console.error('AI search error:', error);
      setChatMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== 'loading');
        return [
          ...newMessages,
          { sender: 'bot', text: '시스템 오류로 인해 답변을 가져오지 못했습니다.' }
        ];
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionClick = async (option) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: option.label }]);

    await new Promise(resolve => setTimeout(resolve, 600));

    if (option.action === 'SELECT_MENU') {
      if (option.value === 'REGULATION') {
        try {
          const response = await fetch('/api/check-ip');
          const data = await response.json();

          if (data.allowed) {
            setChatMessages(prev => [...prev, {
              sender: 'bot',
              text: '다운로드할 규정을 선택해 주세요.',
              options: [
                { label: '행복ICT 제규정', action: 'DOWNLOAD', value: '행복ICT 제규정.pdf' },
                { label: '행복ICT 취업규칙', action: 'DOWNLOAD', value: '행복ICT 취업규칙.pdf' },
                { label: '행복ICT 내부규정', action: 'DOWNLOAD', value: '행복ICT 내부규정.pdf' },
                { label: '행복ICT 개인정보 내부 관리 계획서', action: 'DOWNLOAD', value: '행복ICT 개인정보 내부관리 계획서.pdf' },
                { label: '사내동호회운영규정', action: 'DOWNLOAD', value: '사내동호회운영규정.pdf' },
                { label: '이전으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
              ]
            }]);
          } else {
            setChatMessages(prev => [...prev, {
              sender: 'bot',
              text: `인가된 사내 네트워크에서만 규정 파일을 다운로드할 수 있습니다.\n현재 접속 IP: ${data.ip}`,
              options: [
                { label: '처음으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
              ]
            }]);
          }
        } catch (error) {
          console.error('IP check error:', error);
          setChatMessages(prev => [...prev, {
            sender: 'bot',
            text: '권한 확인 중 오류가 발생했습니다.',
            options: [
              { label: '처음으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
            ]
          }]);
        }
      } else if (option.value === 'AI_SEARCH') {
        setChatMode('ai_search');
        setInputMessage('');
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: '노동법 일반 상식이나 간단한 단어를 물어보시면 AI가 실시간으로 웹을 검색하여 답변해 드립니다. 무엇이 궁금하신가요?'
        }]);
      } else if (option.value === 'HOME') {
        setChatMode('menu');
        setInputMessage('');
        setChatMessages(INITIAL_MESSAGES);
      }
    } else if (option.action === 'DOWNLOAD') {
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: `[${option.label}] 파일 다운로드가 시작되었습니다. 다른 문의사항이 있으시면 아래 버튼을 눌러주세요.`,
        options: [
          { label: '처음으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
        ]
      }]);

      const fileUrl = `/api/download-regulation?file=${encodeURIComponent(option.value)}`;
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = option.value;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isChatOpen && (
        <div className="bg-white w-80 md:w-96 h-[460px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 mb-2">
          <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold">노사협의회 소통 챗봇</p>
                <p className="text-[10px] text-blue-200">24시간 일반 문의 및 규정 안내</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="text-blue-200 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>

                {msg.options && (
                  <div className={`flex flex-col gap-1.5 mt-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.options.map((opt, optIdx) => {
                      const isLatest = idx === chatMessages.length - 1;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => isLatest && handleOptionClick(opt)}
                          disabled={!isLatest}
                          className={`text-left bg-blue-50 text-blue-700 border border-blue-200 rounded-xl px-3 py-2 text-xs font-medium w-fit shadow-sm max-w-[90%] ${isLatest
                            ? 'hover:bg-blue-100 transition-colors cursor-pointer'
                            : 'opacity-60 cursor-default'
                            }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {chatMode === 'ai_search' && (
            <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
              <form onSubmit={handleAiSearch} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="질문을 입력해 주세요..."
                  disabled={isSubmitting}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOptionClick({ action: 'SELECT_MENU', value: 'HOME', label: '처음으로 돌아가기' })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  이전으로
                </button>
              </div>
              <div className="text-center mt-1">
                <span className="text-[9.5px] text-slate-500 leading-tight block px-1">
                  본 AI 검색 기능은 사용자의 질문 및 답변 내용을 서버나 DB에 일절 저장하지 않습니다.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
        aria-label="노사협의회 챗봇 열기"
      >
        <Bot className="w-6 h-6 text-amber-300" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          챗봇으로 문의하기
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
}
