import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Play, FlaskConical, DownloadCloud } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { InsightPanel } from './components/InsightPanel';
import { OutputPanel } from './components/OutputPanel';
import { PRESETS, getPreset } from './data/presets';
import type {
  DataMode,
  Fidelity,
  GeneratorKind,
} from './types/playground.types';
import {
  usePgRoadmapAiMutation,
  usePgRoadmapPipelineMutation,
  usePgDailyAiMutation,
  usePgDailyPipelineMutation,
  usePgLoadRoadmapInputMutation,
  usePgLoadDailyContextMutation,
} from './services/playgroundApi';

function defaultPayload(
  presetId: string,
  kind: GeneratorKind,
  fidelity: Fidelity
): string {
  const p = getPreset(presetId);
  const payload =
    kind === 'roadmap'
      ? fidelity === 'ai'
        ? p.roadmapAi
        : p.roadmapPipeline
      : fidelity === 'ai'
        ? p.dailyAi
        : p.dailyPipeline;
  return JSON.stringify(payload, null, 2);
}

export default function PlaygroundPage() {
  const [kind, setKind] = useState<GeneratorKind>('roadmap');
  const [fidelity, setFidelity] = useState<Fidelity>('ai');
  const [mode, setMode] = useState<DataMode>('mock');
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [userId, setUserId] = useState<string>('');
  const [inputText, setInputText] = useState<string>(() =>
    defaultPayload(PRESETS[0].id, 'roadmap', 'ai')
  );
  const [output, setOutput] = useState<unknown>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  const [roadmapAi, roadmapAiState] = usePgRoadmapAiMutation();
  const [roadmapPipeline, roadmapPipelineState] =
    usePgRoadmapPipelineMutation();
  const [dailyAi, dailyAiState] = usePgDailyAiMutation();
  const [dailyPipeline, dailyPipelineState] = usePgDailyPipelineMutation();
  const [loadRoadmapInput, loadRoadmapState] = usePgLoadRoadmapInputMutation();
  const [loadDailyContext, loadDailyState] = usePgLoadDailyContextMutation();

  const loading =
    roadmapAiState.isLoading ||
    roadmapPipelineState.isLoading ||
    dailyAiState.isLoading ||
    dailyPipelineState.isLoading;
  const loadingReal = loadRoadmapState.isLoading || loadDailyState.isLoading;

  const preset = useMemo(() => getPreset(presetId), [presetId]);

  // Reset the editor payload whenever the scenario / generator / fidelity changes.
  const resync = useCallback((pId: string, k: GeneratorKind, f: Fidelity) => {
    setInputText(defaultPayload(pId, k, f));
    setOutput(undefined);
    setErrorMsg(undefined);
  }, []);

  useEffect(() => {
    resync(presetId, kind, fidelity);
  }, [presetId, kind, fidelity, resync]);

  const run = async () => {
    setErrorMsg(undefined);
    setOutput(undefined);
    let body: unknown;
    try {
      body = JSON.parse(inputText);
    } catch (e) {
      setErrorMsg(`Invalid JSON: ${(e as Error).message}`);
      return;
    }

    try {
      let res;
      if (kind === 'roadmap' && fidelity === 'ai') {
        res = await roadmapAi(body as never).unwrap();
      } else if (kind === 'roadmap') {
        res = await roadmapPipeline(body as never).unwrap();
      } else if (fidelity === 'ai') {
        res = await dailyAi(body as never).unwrap();
      } else {
        res = await dailyPipeline(body as never).unwrap();
      }
      setOutput((res as { data: unknown }).data);
    } catch (e) {
      const err = e as { data?: { message?: string; stack?: string } };
      setErrorMsg(
        err?.data?.stack ||
          err?.data?.message ||
          'Request failed (see network tab)'
      );
    }
  };

  // Pull real inputs from the API into the editor (firstTest + preferences for
  // roadmap; full DailyPlanContext / pipeline body for daily session).
  const loadReal = async () => {
    setErrorMsg(undefined);
    try {
      if (kind === 'roadmap') {
        const r = await loadRoadmapInput({
          userId: userId || undefined,
        }).unwrap();
        if (!r.data.hasTest) {
          setErrorMsg(
            'Loaded preferences, but this user has no analyzed first test — testAnalysis is empty.'
          );
        }
        setInputText(JSON.stringify(r.data.input, null, 2));
      } else {
        const r = await loadDailyContext({
          userId: userId || undefined,
        }).unwrap();
        setInputText(
          JSON.stringify(
            fidelity === 'ai' ? r.data.context : r.data.pipeline,
            null,
            2
          )
        );
      }
      setOutput(undefined);
    } catch (e) {
      const err = e as { data?: { message?: string; stack?: string } };
      setErrorMsg(
        err?.data?.message ||
          'Load failed — check userId and that the API is reachable.'
      );
    }
  };

  const Toggle = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <Button
      size="sm"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <div className="p-5 max-w-[1600px] mx-auto">
      {/* Header / controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 mr-2">
          <FlaskConical className="h-5 w-5 text-indigo-600" />
          <h1 className="text-lg font-bold">Generator Playground</h1>
          <Badge className="bg-amber-100 text-amber-700">
            dry-run · no DB writes
          </Badge>
        </div>

        <div className="flex gap-1">
          <Toggle
            active={kind === 'roadmap'}
            onClick={() => setKind('roadmap')}
          >
            Roadmap
          </Toggle>
          <Toggle
            active={kind === 'dailySession'}
            onClick={() => setKind('dailySession')}
          >
            Daily Session
          </Toggle>
        </div>

        <div className="flex gap-1">
          <Toggle active={fidelity === 'ai'} onClick={() => setFidelity('ai')}>
            AI only
          </Toggle>
          <Toggle
            active={fidelity === 'pipeline'}
            onClick={() => setFidelity('pipeline')}
          >
            Pipeline
          </Toggle>
        </div>

        <Select value={presetId} onValueChange={setPresetId}>
          <SelectTrigger className="w-[210px] h-9">
            <SelectValue placeholder="Preset" />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label} ({p.version})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={(v) => setMode(v as DataMode)}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mock">Mock data</SelectItem>
            <SelectItem value="real">Real API</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <Input
            placeholder="userId (for real data)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-[190px] h-9"
          />
          <Button
            variant="outline"
            onClick={loadReal}
            disabled={loadingReal}
            title="Load real inputs from the API (firstTest, competency, mistakes, resources, missed sessions)"
          >
            <DownloadCloud className="h-4 w-4 mr-1" />
            {loadingReal ? 'Loading…' : 'Load real data'}
          </Button>
          <Button onClick={run} disabled={loading}>
            <Play className="h-4 w-4 mr-1" />
            {loading ? 'Running…' : 'Run generator'}
          </Button>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4">
          <InputPanel
            kind={kind}
            fidelity={fidelity}
            value={inputText}
            onChange={setInputText}
          />
        </div>
        <div className="lg:col-span-3">
          <InsightPanel mode={mode} preset={preset} />
        </div>
        <div className="lg:col-span-5">
          <OutputPanel
            kind={kind}
            fidelity={fidelity}
            loading={loading}
            error={errorMsg}
            output={output}
          />
        </div>
      </div>
    </div>
  );
}
