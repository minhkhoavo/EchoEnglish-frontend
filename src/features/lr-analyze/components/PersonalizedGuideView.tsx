import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LearningResource } from '../types/analysis';

interface PersonalizedGuideViewProps {
  resource: LearningResource;
}

export function PersonalizedGuideView({
  resource,
}: PersonalizedGuideViewProps) {
  const sections = resource.generatedContent?.sections || [];
  const quickTips = resource.generatedContent?.quickTips || [];

  if (sections.length === 0 && quickTips.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748b]">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No guide content available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#e5e7eb]">
        <div className="p-2 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0f172a] truncate">
            {resource.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-[#3b82f6] text-white border-0 text-xs">
              {sections.length} sections
            </Badge>
            {quickTips.length > 0 && (
              <Badge
                variant="outline"
                className="border-[#10b981] text-[#10b981] text-xs"
              >
                {quickTips.length} tips
              </Badge>
            )}
            {resource.estimatedTime && (
              <span className="text-xs text-[#94a3b8]">
                ~{resource.estimatedTime} min
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Quick Tips Section */}
        {quickTips.length > 0 && (
          <Card className="p-3 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#10b981] rounded">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-[#0f172a]">Quick Tips</h4>
            </div>
            <div className="space-y-2">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-white rounded border border-[#bbf7d0]"
                >
                  <div className="flex-shrink-0 w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-xs text-[#1e293b] leading-relaxed flex-1">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Guide Sections with Markdown Rendering */}
        {sections.map((section, index) => (
          <Card
            key={index}
            className="p-3 border border-[#f1f5f9] hover:border-[#3b82f6] transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <h4 className="text-sm font-bold text-[#0f172a] leading-tight flex-1">
                {section.heading}
              </h4>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-sm max-w-none ml-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-[#0f172a] mt-3 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-[#1e293b] mt-3 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-[#334155] mt-2 mb-1.5">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs text-[#475569] leading-relaxed mb-2">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-4 space-y-1 mb-2 text-xs">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-4 space-y-1 mb-2 text-xs">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[#475569] leading-relaxed">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#0f172a]">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-[#334155]">{children}</em>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-[#f1f5f9] text-[#dc2626] px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block bg-[#1e293b] text-[#e2e8f0] p-2 rounded overflow-x-auto text-xs font-mono my-2">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#3b82f6] pl-2 py-1 bg-[#eff6ff] rounded-r my-2 italic text-[#475569] text-xs">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-[#3b82f6] hover:text-[#2563eb] underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
