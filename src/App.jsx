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
        { label: '담당자에게 문의 남기기', action: 'SELECT_MENU', value: 'INQUIRY' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // 폼 및 모달 상태
  const [modalState, setModalState] = useState({ isOpen: false, type: null }); // 'proposal' | 'counsel'
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 챗봇 메시지 전송 처리
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userEmail.trim()) return;

    const userText = inputMessage;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chat-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, content: userText })
      });

      if (response.ok) {
        setChatMode('menu');
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `'${userText}'에 대한 문의가 담당자에게 성공적으로 전달되었습니다. 확인 후 메일로 답변드리겠습니다.`,
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

  const handleOptionClick = (option) => {
    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: option.label }]);

    setTimeout(() => {
      if (option.action === 'SELECT_MENU') {
        if (option.value === 'REGULATION') {
          setChatMessages(prev => [...prev, {
            sender: 'bot',
            text: '다운로드할 규정을 선택해 주세요.',
            options: [
              { label: '행복ICT 제규정', action: 'DOWNLOAD', value: '행복ICT 제규정.pdf' },
              { label: '행복ICT 취업규칙', action: 'DOWNLOAD', value: '행복ICT 취업규칙.pdf' },
              { label: '행복ICT 내부규정', action: 'DOWNLOAD', value: '행복ICT 내부규정.pdf' },
              { label: '행복ICT 개인정보 내부 관리 계획서', action: 'DOWNLOAD', value: '행복ICT 개인정보 내부관리 계획서.pdf' },
              { label: '사내동호회운영규정', action: 'DOWNLOAD', value: '사내동호회운영규정.pdf' }
            ]
          }]);
        } else if (option.value === 'INQUIRY') {
          setChatMode('inquiry');
          setChatMessages(prev => [...prev, {
            sender: 'bot',
            text: '답변을 받으실 이메일 주소와 문의 내용을 화면 하단에 입력해 주세요.'
          }]);
        } else if (option.value === 'HOME') {
          setChatMode('menu');
          setInputMessage('');
          setUserEmail('');
          setChatMessages([{
            sender: 'bot',
            text: '처음으로 돌아왔습니다. 원하시는 메뉴를 선택해 주세요.',
            options: [
              { label: '규정 파일 다운로드', action: 'SELECT_MENU', value: 'REGULATION' },
              { label: '담당자에게 문의 남기기', action: 'SELECT_MENU', value: 'INQUIRY' }
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
    }, 600);
  };

  const openModal = (type) => {
    setModalState({ isOpen: true, type });
    setFormData({ title: '', content: '' });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalState.type,
          title: formData.title,
          content: formData.content
        })
      });

      if (response.ok) {
        alert(modalState.type === 'proposal' ? '안건 제안이 성공적으로 접수되었습니다.' : '고충 상담이 성공적으로 접수되었습니다. 철저히 비밀이 보장됩니다.');
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
              <h1 className="text-xl font-bold tracking-tight">근로자 노사협의회</h1>
              <p className="text-xs text-blue-200">근로자의 목소리를 대변하는 근로자위원 소통 창구</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#proposals" onClick={(e) => { e.preventDefault(); openModal('proposal'); }} className="hover:text-blue-300 transition-colors cursor-pointer">안건제안</a>
            <a href="#counsel" onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="hover:text-blue-300 transition-colors cursor-pointer">익명 고충상담</a>
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
              근로조건 개선, 복리후생 확대, 고충사항 등 언제든지 자유롭게 제안해 주세요.
              근로자위원이 함께 고민하고 회사 측에 전달하겠습니다.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a onClick={(e) => { e.preventDefault(); openModal('proposal'); }} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md cursor-pointer">
                안건 제안하기
              </a>
              <a onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg text-sm transition-all border border-white/20 cursor-pointer">
                익명 고충상담
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
            <h3 className="text-xl font-bold text-slate-800 mb-3">익명 고충 상담</h3>
            <p className="text-slate-600 mb-6">
              신원 노출 걱정 없이 직장 내 고충이나 건의사항을 근로자위원에게 전달하세요.
              비밀이 철저히 보장되며 최선을 다해 돕겠습니다.
            </p>
            <a onClick={(e) => { e.preventDefault(); openModal('counsel'); }} className="inline-flex font-semibold text-indigo-600 hover:text-indigo-700 items-center gap-1 cursor-pointer">
              익명 상담 작성 <ChevronRight className="w-5 h-5" />
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
                  <p className="text-[10px] text-blue-200">24시간 안건 접수 및 규정 안내</p>
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
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
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

            {/* 챗봇 입력폼 */}
            {chatMode === 'inquiry' && (
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="답변 받을 이메일 주소 (필수)"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="문의 내용을 입력하세요..."
                    required
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
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
                {modalState.type === 'proposal' ? '익명 안건 제안하기' : '익명 고충 상담하기'}
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
                    ? '작성해주신 안건은 익명으로 안전하게 근로자위원에게 전달되어 다음 정기회의 안건으로 검토됩니다. 자유롭게 제안해 주세요.'
                    : '고충 및 건의사항은 철저히 익명이 보장되며, 신원 노출 걱정 없이 자유롭게 작성하실 수 있습니다. 근로자위원이 확인 후 대응하겠습니다.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">제목 (선택)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder={modalState.type === 'proposal' ? '예: 구내식당 메뉴 개선 요청' : '예: 부서 내 업무 배분 관련 고충'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">내용 (필수)</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                  placeholder="상세한 내용을 자유롭게 작성해 주세요..."
                />
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
                  disabled={isSubmitting || !formData.content.trim()}
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
