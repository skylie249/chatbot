import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Bell,
  Send,
  Bot,
  X,
  ChevronRight,
  Users,
  Calendar
} from 'lucide-react';

export default function LaborCouncilHome() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState('menu'); // 'menu' | 'inquiry'
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: '안녕하세요! 노사협의회 근로자위원 챗봇입니다. 원하시는 메뉴를 선택해 주세요.',
      options: [
        { label: '규정 파일 다운로드', action: 'SELECT_MENU', value: 'REGULATION' },
        { label: '일반 문의 (AI 검색)', action: 'SELECT_MENU', value: 'AI_SEARCH' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatCategory, setChatCategory] = useState('근로조건');
  const [chatProblem, setChatProblem] = useState('');
  const [chatSuggestion, setChatSuggestion] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [chatAgreed, setChatAgreed] = useState(false);

  // 폼 및 모달 상태
  const [modalState, setModalState] = useState({ isOpen: false, type: null }); // 'proposal' | 'counsel'
  const [formData, setFormData] = useState({ authorMode: 'anonymous', author: '', category: '근로조건', problem: '', suggestion: '', counselTrack: 'general' });
  const [formAgreed, setFormAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 챗봇 메시지 전송 처리
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatSuggestion.trim() || !userEmail.trim()) return;

    const userText = `[${chatCategory}] 문의 접수`;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);

    setChatProblem('');
    setChatSuggestion('');
    setChatCategory('근로조건');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chat-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          category: chatCategory,
          problem: chatProblem,
          suggestion: chatSuggestion
        })
      });

      if (response.ok) {
        setChatMode('menu');
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `담당자에게 성공적으로 문의가 전달되었습니다. 확인 후 메일로 답변드리겠습니다.`,
            options: [
              { label: '처음으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
            ]
          }
        ]);
        setUserEmail('');
      } else {
        setChatMessages(prev => [
          ...prev,
          { sender: 'bot', text: `죄송합니다. 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.` }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: `시스템 오류로 인해 메시지를 전송하지 못했습니다.` }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const query = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setIsSubmitting(true);

    // Add loading indicator
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
    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: option.label }]);

    // 지연 효과 시뮬레이션
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
        setUserEmail('');
        setChatAgreed(false);
        setChatCategory('근로조건');
        setChatProblem('');
        setChatSuggestion('');
        setChatMessages([{
          sender: 'bot',
          text: '처음으로 돌아왔습니다. 원하시는 메뉴를 선택해 주세요.',
          options: [
            { label: '규정 파일 다운로드', action: 'SELECT_MENU', value: 'REGULATION' },
            { label: '일반 문의 (AI 검색)', action: 'SELECT_MENU', value: 'AI_SEARCH' }
          ]
        }]);
      }
    } else if (option.action === 'DOWNLOAD') {
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: `[${option.label}] 파일 다운로드가 시작되었습니다. 다른 문의사항이 있으시면 아래 버튼을 눌러주세요.`,
        options: [
          { label: '처음으로 돌아가기', action: 'SELECT_MENU', value: 'HOME' }
        ]
      }]);

      // 실제 파일 다운로드 (public 폴더 내 파일)
      const fileUrl = `/${option.value}`;
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = option.value;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const openModal = (type) => {
    setModalState({ isOpen: true, type });
    setFormData({ authorMode: 'anonymous', author: '', category: '근로조건', problem: '', suggestion: '', counselTrack: 'general' });
    setFormAgreed(false);
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.suggestion.trim()) return;
    if (formData.authorMode === 'named' && !formData.author.trim()) {
      alert('성명 및 소속을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalState.type,
          counselTrack: modalState.type === 'counsel' ? formData.counselTrack : null,
          authorMode: formData.authorMode,
          author: formData.authorMode === 'named' ? formData.author : '익명',
          category: formData.category,
          problem: formData.problem,
          suggestion: formData.suggestion
        })
      });

      if (response.ok) {
        alert(modalState.type === 'proposal' ? '안건 제안이 성공적으로 접수되었습니다.' : '고충 상담이 성공적으로 접수되었습니다.');
        closeModal();
      } else {
        alert('접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error(error);
      alert('접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      {/* 헤더 */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users className="w-7 h-7 text-blue-300" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">행복ICT 노사협의회 소통 플랫폼</h1>
              <p className="text-xs text-blue-200">근로자의 목소리에 늘 켜져(ON) 있는 따뜻한(溫) 소통 채널</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#proposals" onClick={(e) => { e.preventDefault(); openModal('proposal'); }} className="hover:text-blue-300 transition-colors cursor-pointer">안건제안</a>
            <a href="#counsel" onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="hover:text-blue-300 transition-colors cursor-pointer">고충상담</a>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-full">
            <span className="inline-block px-3 py-1 bg-blue-700 text-blue-100 rounded-full text-xs font-semibold mb-3">
              2026년 안건 수집 중
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              여러분의 의견이 더 나은 일터를 만듭니다
            </h2>
            <p className="text-blue-100 text-sm md:text-base mb-8 max-w-2xl mx-auto">
              근로조건 개선, 복리후생 확대, 고충사항 등 언제든지 자유롭게 제안해 주세요.<br />
              근로자위원이 함께 고민하고 회사 측에 전달하겠습니다.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a onClick={(e) => { e.preventDefault(); openModal('proposal'); }} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md cursor-pointer">
                안건 제안하기
              </a>
              <a onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg text-sm transition-all border border-white/20 cursor-pointer">
                고충 상담
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* 핵심 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">안건 및 의견 제출</h3>
            <p className="text-slate-600 mb-6">
              복지, 근무환경, 제도 개선 등 정기회의에서 다룰 안건을 자유롭게 제출해 주세요.
              작은 의견이 모여 더 나은 근로환경을 만듭니다.
            </p>
            <a onClick={(e) => { e.preventDefault(); openModal('proposal'); }} className="inline-flex font-semibold text-blue-600 hover:text-blue-700 items-center gap-1 cursor-pointer">
              제안하러 가기 <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">고충 상담</h3>
            <p className="text-slate-600 mb-6">
              직장 내 고충이나 건의사항을 기명 또는 무기명으로 근로자위원에게 전달하세요.
              비밀이 철저히 보장되며 최선을 다해 돕겠습니다.
            </p>
            <a onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="inline-flex font-semibold text-indigo-600 hover:text-indigo-700 items-center gap-1 cursor-pointer">
              고충 상담 작성 <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>

      {/* 퀵 메뉴 (Quick Menu) & Floating AI 챗봇 연결 */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* 챗봇 모달창 */}
        {isChatOpen && (
          <div className="bg-white w-80 md:w-96 h-[460px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 mb-2">
            {/* 챗봇 헤더 */}
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
                onClick={() => setIsChatOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 챗봇 메시지 내역 */}
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

                  {/* 옵션 버튼 영역 */}
                  {msg.options && (
                    <div className={`flex flex-col gap-1.5 mt-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.options.map((opt, optIdx) => {
                        const isLatest = idx === chatMessages.length - 1;
                        return (
                          <button
                            key={optIdx}
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

            {/* 챗봇 입력폼 (일반 문의 AI 검색) */}
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

        {/* 퀵 메뉴 토글 버튼 (Floating Button) */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
          aria-label="노사협의회 챗봇 열기"
        >
          <Bot className="w-6 h-6 text-amber-300" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
            챗봇으로 문의하기
          </span>
          {/* 알림 배지 */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* 폼 모달창 */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className={`p-5 flex justify-between items-center text-white ${modalState.type === 'proposal' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <h3 className="font-bold flex items-center gap-2 text-lg">
                {modalState.type === 'proposal' ? <Send className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                {modalState.type === 'proposal' ? '안건 제안하기' : '고충 상담하기'}
              </h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-5">
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className={`mt-0.5 ${modalState.type === 'proposal' ? 'text-amber-500' : 'text-indigo-500'}`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                <p>
                  {modalState.type === 'proposal'
                    ? '작성해주신 안건은 안전하게 근로자위원에게 전달되어 다음 정기회의 안건으로 검토됩니다. 자유롭게 제안해 주세요.'
                    : '고충 및 건의사항은 근로자위원이 확인 후 대응하겠습니다. 무기명 선택 시 철저히 익명이 보장되며, 신원 노출 걱정 없이 자유롭게 작성하실 수 있습니다.'}
                </p>
              </div>

              {modalState.type === 'counsel' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">고충 접수 트랙 선택</label>
                  <div className="flex flex-col gap-3">
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.counselTrack === 'general' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="counselTrack"
                        value="general"
                        checked={formData.counselTrack === 'general'}
                        onChange={(e) => setFormData({ ...formData, counselTrack: 'general', authorMode: 'anonymous' })}
                        className="mt-1 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-bold text-slate-800">1. 일반 근무환경 / 복지 / 제도 개선</span>
                        <span className="block text-xs text-indigo-600 mt-0.5">100% 익명 접수 (개인정보 필요 없음)</span>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.counselTrack === 'harassment' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="counselTrack"
                        value="harassment"
                        checked={formData.counselTrack === 'harassment'}
                        onChange={(e) => setFormData({ ...formData, counselTrack: 'harassment', authorMode: 'named' })}
                        className="mt-1 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-bold text-slate-800">2. 개인 피해 / 직장 내 괴롭힘 / 인권</span>
                        <span className="block text-xs text-red-500 mt-0.5">제한적 익명 / 실명 전환 안내</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {(modalState.type === 'proposal' || (modalState.type === 'counsel' && formData.counselTrack === 'harassment')) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">작성 방식</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="authorMode"
                        value="anonymous"
                        checked={formData.authorMode === 'anonymous'}
                        onChange={(e) => setFormData({ ...formData, authorMode: e.target.value })}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">무기명 (익명)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="authorMode"
                        value="named"
                        checked={formData.authorMode === 'named'}
                        onChange={(e) => setFormData({ ...formData, authorMode: e.target.value })}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">기명</span>
                    </label>
                  </div>
                  {modalState.type === 'counsel' && formData.counselTrack === 'harassment' && formData.authorMode === 'anonymous' && (
                    <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-md border border-red-100">
                      무기명으로 접수되지만, 가해자 조사 및 사실 관계 확인 등을 위해 추후 실명 전환이 필요할 수 있습니다.
                    </p>
                  )}
                </div>
              )}

              {formData.authorMode === 'named' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">성명 및 소속 (필수)</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                    placeholder="예: 홍길동 선임 / 개발팀"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">분류 선택 (필수)</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                >
                  <option value="근로조건">근로조건</option>
                  <option value="복리후생">복리후생</option>
                  <option value="조직문화">조직문화</option>
                  <option value="안전·보건">안전·보건</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">현상 및 문제점 (선택)</label>
                <textarea
                  rows={3}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                  placeholder="현재 어떤 불편이 있는지 작성해 주세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">개선 제안 아이디어 (필수)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.suggestion}
                  onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                  placeholder="어떻게 바뀌면 좋을지 제안해 주세요..."
                />
              </div>

              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                <input
                  type="checkbox"
                  id="formAgreement"
                  checked={formAgreed}
                  onChange={(e) => setFormAgreed(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <label htmlFor="formAgreement" className="text-xs text-slate-700 leading-snug cursor-pointer">
                  [필수] 건전한 노사문화를 위해 욕설, 비방, 인신공격 등의 내용은 삼가주시기 바랍니다. 위 작성 준수사항을 확인하였으며, 이에 동의합니다.
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.suggestion.trim() || !formAgreed}
                  className={`px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-2 ${modalState.type === 'proposal'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                >
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-xs border-t border-slate-700 mt-12">
        <p>노사협의회 근로자위원 대표 소통 플랫폼 | 근로자의 권익과 건강한 일터를 위해 함께합니다.</p>
      </footer>
    </div>
  );
}
