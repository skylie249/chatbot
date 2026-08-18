import React, { useEffect, useState } from 'react';
import { HelpCircle, Send, X } from 'lucide-react';

const INITIAL_FORM_DATA = {
  authorMode: 'anonymous',
  author: '',
  category: '근로조건',
  problem: '',
  suggestion: '',
  counselTrack: 'general'
};

export default function InquiryModal({ type, isOpen, onClose }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formAgreed, setFormAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setFormAgreed(false);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

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
          type,
          counselTrack: type === 'counsel' ? formData.counselTrack : null,
          authorMode: formData.authorMode,
          author: formData.authorMode === 'named' ? formData.author : '익명',
          category: formData.category,
          problem: formData.problem,
          suggestion: formData.suggestion
        })
      });

      if (response.ok) {
        alert(type === 'proposal' ? '안건 제안이 성공적으로 접수되었습니다.' : '고충 상담이 성공적으로 접수되었습니다.');
        onClose();
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className={`p-5 flex justify-between items-center text-white ${type === 'proposal' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          <h3 className="font-bold flex items-center gap-2 text-lg">
            {type === 'proposal' ? <Send className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            {type === 'proposal' ? '안건 제안하기' : '고충 상담하기'}
          </h3>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-5">
          <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className={`mt-0.5 ${type === 'proposal' ? 'text-amber-500' : 'text-indigo-500'}`}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <p>
              {type === 'proposal'
                ? '작성해주신 안건은 안전하게 근로자위원에게 전달되어 다음 정기회의 안건으로 검토됩니다. 자유롭게 제안해 주세요.'
                : '고충 및 건의사항은 근로자위원이 확인 후 대응하겠습니다. 무기명 선택 시 철저히 익명이 보장되며, 신원 노출 걱정 없이 자유롭게 작성하실 수 있습니다.'}
            </p>
          </div>

          {type === 'counsel' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">고충 접수 트랙 선택</label>
              <div className="flex flex-col gap-3">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.counselTrack === 'general' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="counselTrack"
                    value="general"
                    checked={formData.counselTrack === 'general'}
                    onChange={() => setFormData({ ...formData, counselTrack: 'general', authorMode: 'anonymous' })}
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
                    onChange={() => setFormData({ ...formData, counselTrack: 'harassment', authorMode: 'named' })}
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

          {(type === 'proposal' || (type === 'counsel' && formData.counselTrack === 'harassment')) && (
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
              {type === 'counsel' && formData.counselTrack === 'harassment' && formData.authorMode === 'anonymous' && (
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
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.suggestion.trim() || !formAgreed}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-2 ${type === 'proposal'
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
  );
}
