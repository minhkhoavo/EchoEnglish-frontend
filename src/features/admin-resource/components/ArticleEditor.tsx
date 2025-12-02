import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useUploadAdminFileMutation,
} from '../services/adminResourceApi';
import type { Resource, CreateArticleData } from '../types/resource.types';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';

// Domain options
const DOMAIN_OPTIONS = [
  { value: 'BUSINESS', label: 'Business' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'HOSPITALITY', label: 'Hospitality' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'HUMAN_RESOURCES', label: 'Human Resources' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'GRAMMAR', label: 'Grammar' },
  { value: 'GENERAL', label: 'General' },
];

const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface ArticleEditorProps {
  article?: Resource;
  onBack: () => void;
  onSuccess: () => void;
}

export const ArticleEditor = ({
  article,
  onBack,
  onSuccess,
}: ArticleEditorProps) => {
  const { toast } = useToast();
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadAdminFileMutation();

  // Form state
  const [title, setTitle] = useState(article?.title || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [thumbnail, setThumbnail] = useState(article?.thumbnail || '');
  const [attachmentUrl, setAttachmentUrl] = useState(
    article?.attachmentUrl || ''
  );
  const [attachmentName, setAttachmentName] = useState(
    article?.attachmentName || ''
  );
  const [domain, setDomain] = useState(article?.labels?.domain || '');
  const [cefr, setCefr] = useState(article?.labels?.cefr || '');
  const [topics, setTopics] = useState<string[]>(article?.labels?.topic || []);
  const [topicInput, setTopicInput] = useState('');
  const [suitableForLearners, setSuitableForLearners] = useState(
    article?.suitableForLearners ?? true
  );

  const isEditing = !!article;
  const isLoading = isCreating || isUpdating;

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: article?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[350px] p-4 focus:outline-none',
      },
    },
  });

  // Handle thumbnail upload
  const handleThumbnailUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      try {
        const result = await uploadFile({
          file,
          folder: 'articles/thumbnails',
        }).unwrap();
        setThumbnail(result.data.url);
        toast({ title: 'Success', description: 'Thumbnail uploaded' });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to upload thumbnail',
          variant: 'destructive',
        });
      }
    },
    [uploadFile, toast]
  );

  // Handle attachment upload
  const handleAttachmentUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Only PDF, DOCX, and TXT files are allowed',
          variant: 'destructive',
        });
        return;
      }

      try {
        const result = await uploadFile({
          file,
          folder: 'articles/attachments',
        }).unwrap();
        setAttachmentUrl(result.data.url);
        setAttachmentName(file.name);
        toast({ title: 'Success', description: 'Attachment uploaded' });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to upload attachment',
          variant: 'destructive',
        });
      }
    },
    [uploadFile, toast]
  );

  // Add topic
  const addTopic = useCallback(() => {
    const trimmed = topicInput.trim().toLowerCase();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicInput('');
    }
  }, [topicInput, topics]);

  // Remove topic
  const removeTopic = useCallback((topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }, []);

  // Add link
  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // Submit form
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    const content = editor?.getHTML() || '';
    if (!content.trim() || content === '<p></p>') {
      toast({
        title: 'Error',
        description: 'Content is required',
        variant: 'destructive',
      });
      return;
    }

    const data: CreateArticleData = {
      title: title.trim(),
      content,
      summary: summary.trim() || undefined,
      thumbnail: thumbnail || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      labels: {
        domain: domain || undefined,
        cefr: cefr || undefined,
        topic: topics.length > 0 ? topics : undefined,
      },
      suitableForLearners,
    };

    try {
      if (isEditing) {
        await updateArticle({ id: article._id, data }).unwrap();
        toast({
          title: 'Success',
          description: 'Article updated successfully',
        });
      } else {
        await createArticle(data).unwrap();
        toast({
          title: 'Success',
          description: 'Article created successfully',
        });
      }
      onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} article`,
        variant: 'destructive',
      });
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h2>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? 'Update' : 'Publish'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title..."
              className="mt-1"
            />
          </div>

          {/* Editor Toolbar */}
          <div className="border rounded-md">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
              {/* Undo/Redo */}
              <Toggle
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Toggle>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Headings */}
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <Heading2 className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                <Heading3 className="h-4 w-4" />
              </Toggle>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Text formatting */}
              <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('underline')}
                onPressedChange={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
              >
                <UnderlineIcon className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
              >
                <Strikethrough className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('highlight')}
                onPressedChange={() =>
                  editor.chain().focus().toggleHighlight().run()
                }
              >
                <Highlighter className="h-4 w-4" />
              </Toggle>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Lists */}
              <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
              >
                <List className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
              >
                <ListOrdered className="h-4 w-4" />
              </Toggle>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Other */}
              <Toggle
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
              >
                <Quote className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('codeBlock')}
                onPressedChange={() =>
                  editor.chain().focus().toggleCodeBlock().run()
                }
              >
                <Code className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('link')}
                onPressedChange={addLink}
              >
                <LinkIcon className="h-4 w-4" />
              </Toggle>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Alignment */}
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign('left').run()
                }
              >
                <AlignLeft className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign('center').run()
                }
              >
                <AlignCenter className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign('right').run()
                }
              >
                <AlignRight className="h-4 w-4" />
              </Toggle>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="min-h-[400px]" />
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the article..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Thumbnail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thumbnail ? (
                <div className="relative">
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setThumbnail('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground mt-2">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">
                        Upload image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Attachment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attachment (PDF, DOCX, TXT)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attachmentUrl ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 truncate hover:text-primary"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate underline">
                      {attachmentName}
                    </span>
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => {
                      setAttachmentUrl('');
                      setAttachmentName('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Upload file
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleAttachmentUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                File content will be indexed for AI knowledge base
              </p>
            </CardContent>
          </Card>

          {/* Labels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Domain */}
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CEFR */}
              <div>
                <Label htmlFor="cefr">CEFR Level</Label>
                <Select value={cefr} onValueChange={setCefr}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topics */}
              <div>
                <Label>Topics</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Add topic"
                    onKeyDown={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addTopic())
                    }
                  />
                  <Button type="button" variant="outline" onClick={addTopic}>
                    Add
                  </Button>
                </div>
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTopic(topic)}
                      >
                        {topic}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="suitable">Suitable for Learners</Label>
                <Switch
                  id="suitable"
                  checked={suitableForLearners}
                  onCheckedChange={setSuitableForLearners}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enable to show this article in learning recommendations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
