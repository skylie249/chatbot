import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Users, Send } from 'lucide-react';
import ChatWidget from './components/ChatWidget.jsx';
import InquiryModal from './components/InquiryModal.jsx';

export default function LaborCouncilHome() {
  const [modalState, setModalState] = useState({ isOpen: false, type: null }); // 'proposal' | 'counsel'

  const openModal = (type) => setModalState({ isOpen: true, type });
  const closeModal = () => setModalState({ isOpen: false, type: null });

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
            <button type="button" onClick={() => openModal('proposal')} className="hover:text-blue-300 transition-colors cursor-pointer">안건제안</button>
            <button type="button" onClick={() => openModal('counsel')} className="hover:text-blue-300 transition-colors cursor-pointer">고충상담</button>
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
              <button type="button" onClick={() => openModal('proposal')} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md cursor-pointer">
                안건 제안하기
              </button>
              <button type="button" onClick={() => openModal('counsel')} className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg text-sm transition-all border border-white/20 cursor-pointer">
                고충 상담
              </button>
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
            <button type="button" onClick={() => openModal('proposal')} className="inline-flex font-semibold text-blue-600 hover:text-blue-700 items-center gap-1 cursor-pointer">
              제안하러 가기 <ChevronRight className="w-5 h-5" />
            </button>
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
            <button type="button" onClick={() => openModal('counsel')} className="inline-flex font-semibold text-indigo-600 hover:text-indigo-700 items-center gap-1 cursor-pointer">
              고충 상담 작성 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      <ChatWidget />

      <InquiryModal type={modalState.type} isOpen={modalState.isOpen} onClose={closeModal} />

      {/* 푸터 */}
      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-xs border-t border-slate-700 mt-12">
        <p>노사협의회 근로자위원 대표 소통 플랫폼 | 근로자의 권익과 건강한 일터를 위해 함께합니다.</p>
      </footer>
    </div>
  );
}
