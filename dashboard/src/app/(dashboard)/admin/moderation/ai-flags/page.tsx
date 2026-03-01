'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Brain, AlertTriangle, MessageSquare, Image, Video, CheckCircle, XCircle } from 'lucide-react';

interface AIFlag {
  id: number;
  content_type: 'message' | 'post' | 'comment';
  content_id: number;
  content_preview: string;
  user_id: number;
  user_name: string;
  flag_type: string;
  confidence_score: number;
  ai_model: string;
  flagged_at: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  action_taken?: string;
}

export default function AIFlagsPage() {
  const [flags, setFlags] = useState<AIFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedFlag, setSelectedFlag] = useState<AIFlag | null>(null);

  useEffect(() => {
    loadAIFlags();
  }, [filter]);

  const loadAIFlags = async () => {
    const response = await api.moderation.aiFlags({ status: filter });
    if (response.success) {
      setFlags(response.data);
    }
    setLoading(false);
  };

  const handleReview = async (flagId: number, action: 'approve' | 'remove' | 'dismiss') => {
    const response = await api.moderation.takeAction(flagId, action);
    if (response.success) {
      setSelectedFlag(null);
      loadAIFlags();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-red-400 bg-red-500/20';
    if (score >= 70) return 'text-orange-400 bg-orange-500/20';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  const getFlagTypeIcon = (type: string) => {
    switch (type) {
      case 'toxic':
      case 'harassment':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'spam':
        return <MessageSquare className="w-5 h-5 text-orange-400" />;
      case 'nsfw':
        return <Image className="w-5 h-5 text-purple-400" />;
      default:
        return <Brain className="w-5 h-5 text-blue-400" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'post':
        return <Image className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <PageTemplate title="AI Content Flags" description="Review AI-detected toxic content">
        <LoadingSpinner size="lg" />
      </PageTemplate>
    );
  }

  const stats = {
    total: flags.length,
    pending: flags.filter(f => f.status === 'pending').length,
    reviewed: flags.filter(f => f.status === 'reviewed').length,
    dismissed: flags.filter(f => f.status === 'dismissed').length,
    highConfidence: flags.filter(f => f.confidence_score >= 90).length,
  };

  return (
    <PageTemplate
      title="AI Toxic Content Flags"
      description="Review content automatically flagged by AI moderation"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Flags</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Brain className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reviewed</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.reviewed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Dismissed</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">{stats.dismissed}</p>
            </div>
            <XCircle className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Confidence</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats.highConfidence}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6">
        <div className="flex gap-2">
          {['pending', 'reviewed', 'dismissed', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* AI Flags List */}
      {flags.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No AI flags found"
          description="No content has been flagged by AI moderation"
        />
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-white/5 rounded-xl">
                    {getFlagTypeIcon(flag.flag_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white capitalize">
                        {flag.flag_type.replace('_', ' ')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getConfidenceColor(flag.confidence_score)}`}>
                        {flag.confidence_score}% confidence
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        {getContentTypeIcon(flag.content_type)}
                        <span>{flag.content_type}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3 line-clamp-2">{flag.content_preview}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>User: {flag.user_name}</span>
                      <span>•</span>
                      <span>Model: {flag.ai_model}</span>
                      <span>•</span>
                      <span>{new Date(flag.flagged_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {flag.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(flag.id, 'approve')}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(flag.id, 'remove')}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleReview(flag.id, 'dismiss')}
                      className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {flag.status !== 'pending' && (
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm ${
                      flag.status === 'reviewed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flag.status}
                    </span>
                    {flag.reviewed_by && (
                      <p className="text-gray-400 text-sm mt-2">
                        by {flag.reviewed_by}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {flag.action_taken && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm">
                    <span className="font-medium">Action taken:</span> {flag.action_taken}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Model Info */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Brain className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-white mb-2">AI Moderation Models</h4>
            <p className="text-gray-300 mb-3">
              Our AI moderation system uses multiple models to detect toxic content:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong>Toxicity Detection</strong>: Identifies harassment, hate speech, and threats</li>
              <li>• <strong>Spam Detection</strong>: Catches promotional content and repetitive messages</li>
              <li>• <strong>NSFW Detection</strong>: Flags inappropriate images and videos</li>
              <li>• <strong>Context Analysis</strong>: Understands context to reduce false positives</li>
            </ul>
            <p className="text-gray-400 text-sm mt-3">
              Confidence scores above 90% are highly reliable. Review lower scores carefully.
            </p>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
