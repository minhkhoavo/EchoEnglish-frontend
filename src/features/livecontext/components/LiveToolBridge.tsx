/**
 * LiveToolBridge
 *
 * Bridges Gemini Live tool calls to the existing EchoEnglish RTK Query
 * mutations. Mount once near the app root (inside <CompanionProvider>) so
 * the AI can really *do* things — not just point at them.
 *
 * The component registers tool handlers on mount and unregisters on unmount.
 * Each handler awaits the existing RTK Query mutation/query and returns a
 * compact JSON object back to Gemini.
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useCompanion } from '../context/CompanionContext';
import { emitUiAction } from '../utils/ui-actions';
import {
  useCreateFlashcardMutation,
  useGetFlashcardsQuery,
  useGetCategoriesQuery,
  useDeleteFlashcardMutation,
} from '@/features/flashcard/services/flashcardApi';
import type {
  Flashcard,
  Category,
} from '@/features/flashcard/types/flashcard.types';

export default function LiveToolBridge() {
  const { registerTool, currentPage } = useCompanion();
  const navigate = useNavigate();
  const location = useLocation();

  const [createFlashcard] = useCreateFlashcardMutation();
  const [deleteFlashcard] = useDeleteFlashcardMutation();
  const { data: flashcards = [], refetch: refetchFlashcards } =
    useGetFlashcardsQuery();
  const { data: categories = [], refetch: refetchCategories } =
    useGetCategoriesQuery();

  useEffect(() => {
    // create_flashcard ----------------------------------------------------
    const unregisterCreate = registerTool('create_flashcard', async (args) => {
      const front = String(args.front || '').trim();
      const back = String(args.back || '').trim();
      if (!front || !back) {
        return { success: false, error: 'front and back are required' };
      }

      // Resolve category — accept id directly, or match by name (case-insensitive)
      let categoryId = String(args.category_id || '').trim();
      if (!categoryId && args.category_name) {
        const wanted = String(args.category_name).trim().toLowerCase();
        const match = (categories as Category[]).find(
          (c) => c.name.toLowerCase() === wanted
        );
        if (match?._id) categoryId = match._id;
      }
      if (!categoryId && (categories as Category[])[0]?._id) {
        categoryId = (categories as Category[])[0]._id!;
      }
      if (!categoryId) {
        return {
          success: false,
          error:
            'No flashcard category exists yet. Ask the user to create one first or pass category_name.',
        };
      }

      const difficulty =
        (args.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium';
      const tags = args.tags
        ? String(args.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      try {
        const created = await createFlashcard({
          front,
          back,
          category: categoryId,
          difficulty,
          tags,
          source: args.source ? String(args.source) : undefined,
          phonetic: args.phonetic ? String(args.phonetic) : undefined,
          isAIGenerated: true,
        }).unwrap();
        toast.success(`AI saved flashcard: "${front}"`);
        return {
          success: true,
          flashcard: {
            id: created._id,
            front: created.front,
            back: created.back,
            category: created.category,
          },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { success: false, error: msg };
      }
    });

    // list_flashcards -----------------------------------------------------
    const unregisterList = registerTool('list_flashcards', async (args) => {
      try {
        await refetchFlashcards();
      } catch {
        /* ignore — use cache */
      }
      let result = flashcards as Flashcard[];
      if (args.category_id) {
        result = result.filter((f) => f.category === args.category_id);
      }
      if (args.search) {
        const q = String(args.search).toLowerCase();
        result = result.filter(
          (f) =>
            f.front.toLowerCase().includes(q) ||
            f.back.toLowerCase().includes(q) ||
            (f.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }
      const limit = Number(args.limit) || 20;
      return {
        total: result.length,
        flashcards: result.slice(0, limit).map((f) => ({
          id: f._id,
          front: f.front,
          back: f.back,
          category: f.category,
          difficulty: f.difficulty,
          tags: f.tags,
        })),
      };
    });

    // list_flashcard_categories ------------------------------------------
    const unregisterCats = registerTool(
      'list_flashcard_categories',
      async () => {
        try {
          await refetchCategories();
        } catch {
          /* ignore */
        }
        return {
          count: (categories as Category[]).length,
          categories: (categories as Category[]).map((c) => ({
            id: c._id,
            name: c.name,
            description: c.description,
            flashcardCount: c.flashcardCount,
          })),
        };
      }
    );

    // delete_flashcard ---------------------------------------------------
    const unregisterDelete = registerTool('delete_flashcard', async (args) => {
      const fid = String(args.flashcard_id || '').trim();
      if (!fid) return { success: false, error: 'flashcard_id required' };
      try {
        await deleteFlashcard(fid).unwrap();
        toast.success('AI deleted flashcard');
        return { success: true };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });

    // open_flashcard_dialog ----------------------------------------------
    // Opens the real "Create Flashcard" dialog on screen and pre-fills it so
    // the user watches the form populate (then optionally auto-submits).
    const unregisterOpenDialog = registerTool(
      'open_flashcard_dialog',
      async (args) => {
        const onFlashcards = location.pathname.startsWith('/flashcards');
        if (!onFlashcards) {
          // Make sure we're on the cards tab so the dialog is mounted.
          navigate('/flashcards?tab=flashcards');
        }

        const tags = args.tags
          ? String(args.tags)
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined;

        const payload = {
          front: args.front ? String(args.front) : undefined,
          back: args.back ? String(args.back) : undefined,
          categoryName: args.category_name
            ? String(args.category_name)
            : undefined,
          difficulty: args.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
          tags,
          phonetic: args.phonetic ? String(args.phonetic) : undefined,
          source: args.source ? String(args.source) : undefined,
          autoSubmit: args.auto_submit === 'true',
        };

        // Wait for the dialog to mount if we just navigated, then emit.
        const delay = onFlashcards ? 150 : 900;
        await new Promise((res) => setTimeout(res, delay));
        emitUiAction('open-flashcard-dialog', payload);

        return {
          success: true,
          opened: true,
          prefilled: payload,
          note: payload.autoSubmit
            ? 'Dialog opened, prefilled, and will auto-save.'
            : 'Dialog opened and prefilled — user can review then click Create.',
        };
      }
    );

    // open_resource ------------------------------------------------------
    const unregisterOpenResource = registerTool(
      'open_resource',
      async (args) => {
        const rid = String(args.resource_id || '').trim();
        if (!rid) return { success: false, error: 'resource_id required' };
        navigate(`/resources/${rid}`);
        return { success: true, navigated_to: `/resources/${rid}` };
      }
    );

    // get_resource_text --------------------------------------------------
    // Default implementation: scrape the article-body div the RawHtmlRenderer
    // mounted on the resource detail page. ResourceDetailPage may also push
    // richer info into pageContext via setPageContext('resource', ...).
    const unregisterGetResource = registerTool(
      'get_resource_text',
      async () => {
        const articleBody = document.querySelector<HTMLElement>(
          '[data-ai-role="article-body"]'
        );
        if (!articleBody) {
          return {
            available: false,
            error:
              'No article-body found on the page — the user is probably not on a resource detail page.',
          };
        }
        const text = (articleBody.textContent || '').trim();
        // Also collect every paragraph/heading individually so the AI can refer
        // to "paragraph 3" etc.
        const parts = Array.from(
          articleBody.querySelectorAll<HTMLElement>(
            '[data-ai-role="heading"], [data-ai-role="paragraph"], [data-ai-role="list-item"], [data-ai-role="quote"]'
          )
        )
          .slice(0, 60)
          .map((el) => ({
            ai_id: el.dataset.aiId,
            role: el.dataset.aiRole,
            text: (el.textContent || '').trim().slice(0, 300),
          }));
        return {
          available: true,
          wordCount: text.split(/\s+/).filter(Boolean).length,
          text: text.slice(0, 4000),
          parts,
        };
      }
    );

    return () => {
      unregisterCreate();
      unregisterList();
      unregisterCats();
      unregisterDelete();
      unregisterOpenResource();
      unregisterGetResource();
    };
    // currentPage is included so the registry refreshes if the cache is reset
    // when navigating between pages.
  }, [
    registerTool,
    navigate,
    createFlashcard,
    deleteFlashcard,
    flashcards,
    categories,
    refetchFlashcards,
    refetchCategories,
    currentPage,
  ]);

  return null;
}
