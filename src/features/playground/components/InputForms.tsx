import {
  Section,
  Field,
  TextField,
  NumberField,
  AreaField,
  SelectField,
  TagsField,
  ArrayEditor,
  SEVERITY_OPTS,
  DIFFICULTY_OPTS,
  PROFICIENCY_OPTS,
  PRIMARY_GOAL_OPTS,
  ROADMAP_LEVEL_OPTS,
  CEFR_OPTS,
  STUDY_TIME_OPTS,
  RESOURCE_TYPE_OPTS,
  DOW_OPTS,
} from './formKit';
import type { Fidelity } from '../types/playground.types';

// The forms operate on the parsed JSON object so the JSON tab stays in sync.
type Obj = Record<string, unknown>;
interface Weakness {
  skillKey?: string;
  skillName?: string;
  category?: string;
  severity?: string;
  userAccuracy?: number;
}
interface DomainPerf {
  domain?: string;
  accuracy?: number;
}
interface LowestSkill {
  skill?: string;
  currentAccuracy?: number;
  proficiency?: string;
}
interface Mistake {
  questionId?: string;
  questionText?: string;
  contentTags?: string[];
  skillTag?: string;
  partNumber?: number;
  difficulty?: string;
  mistakeCount?: number;
}
interface Resource {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  domain?: string;
  topics?: string[];
}
interface Missed {
  focus?: string;
  targetSkills?: string[];
  suggestedDomains?: string[];
}
interface Material {
  title?: string;
  type?: string;
  domain?: string;
}

const asArr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const asObj = (v: unknown): Obj =>
  v && typeof v === 'object' ? (v as Obj) : {};
const asStrArr = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : [];

// ============================ Weakness editor ============================
function WeaknessEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: Weakness[];
  onChange: (n: Weakness[]) => void;
}) {
  return (
    <ArrayEditor<Weakness>
      title={title}
      items={items}
      onChange={onChange}
      addLabel="Add weakness"
      makeNew={() => ({
        skillKey: '',
        skillName: '',
        category: 'grammar',
        severity: 'medium',
        userAccuracy: 50,
      })}
      render={(w, update) => (
        <div className="grid grid-cols-2 gap-1.5 pr-4">
          <TextField
            label="Skill name"
            value={w.skillName}
            onChange={(v) => update({ skillName: v })}
          />
          <TextField
            label="Skill key"
            value={w.skillKey}
            onChange={(v) => update({ skillKey: v })}
          />
          <TextField
            label="Category"
            value={w.category}
            onChange={(v) => update({ category: v })}
          />
          <SelectField
            label="Severity"
            value={w.severity}
            options={SEVERITY_OPTS}
            onChange={(v) => update({ severity: v })}
          />
          <NumberField
            label="User accuracy %"
            value={w.userAccuracy}
            min={0}
            max={100}
            onChange={(v) => update({ userAccuracy: v })}
          />
        </div>
      )}
    />
  );
}

// ============================ ROADMAP FORM ============================
export function RoadmapForm({
  value,
  fidelity,
  onChange,
}: {
  value: Obj;
  fidelity: Fidelity;
  onChange: (next: Obj) => void;
}) {
  const set = (patch: Obj) => onChange({ ...value, ...patch });
  const prefs = asObj(value.userPreferences);
  const setPrefs = (patch: Obj) =>
    set({ userPreferences: { ...prefs, ...patch } });
  const ta = asObj(value.testAnalysis);
  const setTA = (patch: Obj) => set({ testAnalysis: { ...ta, ...patch } });

  return (
    <div className="space-y-2">
      <Section title="Basics">
        <AreaField
          label="User prompt"
          value={value.userPrompt as string}
          onChange={(v) => set({ userPrompt: v })}
        />
        <div className="grid grid-cols-3 gap-1.5">
          <NumberField
            label="Target score"
            value={value.targetScore as number}
            onChange={(v) => set({ targetScore: v })}
          />
          <NumberField
            label="Min/day"
            value={value.studyTimePerDay as number}
            onChange={(v) => set({ studyTimePerDay: v })}
          />
          <NumberField
            label="Days/week"
            value={value.studyDaysPerWeek as number}
            onChange={(v) => set({ studyDaysPerWeek: v })}
          />
        </div>
        <SelectField
          label="Today day-of-week (0=Sun)"
          value={String(value.todayDayOfWeek ?? '')}
          options={DOW_OPTS}
          onChange={(v) => set({ todayDayOfWeek: Number(v) })}
        />
        {fidelity === 'pipeline' && (
          <TextField
            label="testResultId (optional — loads analysis from DB)"
            value={value.testResultId as string}
            onChange={(v) => set({ testResultId: v })}
          />
        )}
      </Section>

      <Section title="User preferences">
        <div className="grid grid-cols-2 gap-1.5">
          <SelectField
            label="Primary goal"
            value={prefs.primaryGoal as string}
            options={PRIMARY_GOAL_OPTS}
            onChange={(v) => setPrefs({ primaryGoal: v })}
          />
          <SelectField
            label="Current level"
            value={prefs.currentLevel as string}
            options={ROADMAP_LEVEL_OPTS}
            onChange={(v) => setPrefs({ currentLevel: v })}
          />
          <SelectField
            label="Preferred study time"
            value={prefs.preferredStudyTime as string}
            options={STUDY_TIME_OPTS}
            onChange={(v) => setPrefs({ preferredStudyTime: v })}
          />
        </div>
        <TagsField
          label="Content interests"
          value={asStrArr(prefs.contentInterests)}
          onChange={(v) => setPrefs({ contentInterests: v })}
        />
        <TagsField
          label="Study days of week (numbers 0-6)"
          numeric
          value={(prefs.studyDaysOfWeek as number[]) ?? []}
          onChange={(v) => setPrefs({ studyDaysOfWeek: v })}
        />
      </Section>

      <Section title="Test analysis (first test)">
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            label="Score"
            value={ta.score as number}
            onChange={(v) => setTA({ score: v })}
          />
        </div>
        <AreaField
          label="Summary"
          value={ta.summary as string}
          onChange={(v) => setTA({ summary: v })}
        />
        <TagsField
          label="Strengths"
          value={asStrArr(ta.strengths)}
          onChange={(v) => setTA({ strengths: v })}
        />
        <WeaknessEditor
          title="Weaknesses"
          items={asArr<Weakness>(ta.weaknesses)}
          onChange={(v) => setTA({ weaknesses: v })}
        />
        <ArrayEditor<DomainPerf>
          title="Domain performance"
          items={asArr<DomainPerf>(ta.domainsPerformance)}
          addLabel="Add domain"
          makeNew={() => ({ domain: '', accuracy: 50 })}
          onChange={(v) => setTA({ domainsPerformance: v })}
          render={(d, update) => (
            <div className="grid grid-cols-2 gap-1.5 pr-4">
              <TextField
                label="Domain"
                value={d.domain}
                onChange={(v) => update({ domain: v })}
              />
              <NumberField
                label="Accuracy %"
                value={d.accuracy}
                min={0}
                max={100}
                onChange={(v) => update({ accuracy: v })}
              />
            </div>
          )}
        />
      </Section>
    </div>
  );
}

// ============================ DAILY (shared sections) ============================
function DailyFocusSection({
  df,
  setDF,
}: {
  df: Obj;
  setDF: (p: Obj) => void;
}) {
  return (
    <Section title="Daily focus">
      <TextField
        label="Focus"
        value={df.focus as string}
        onChange={(v) => setDF({ focus: v })}
      />
      <TagsField
        label="Target skills"
        value={asStrArr(df.targetSkills)}
        onChange={(v) => setDF({ targetSkills: v })}
      />
      <TagsField
        label="Suggested domains"
        value={asStrArr(df.suggestedDomains)}
        onChange={(v) => setDF({ suggestedDomains: v })}
      />
      <NumberField
        label="Estimated minutes"
        value={df.estimatedMinutes as number}
        onChange={(v) => setDF({ estimatedMinutes: v })}
      />
    </Section>
  );
}

function WeekFocusSection({ wf, setWF }: { wf: Obj; setWF: (p: Obj) => void }) {
  return (
    <Section title="Week focus">
      <div className="grid grid-cols-2 gap-1.5">
        <NumberField
          label="Week number"
          value={wf.weekNumber as number}
          onChange={(v) => setWF({ weekNumber: v })}
        />
        <TextField
          label="Title"
          value={wf.title as string}
          onChange={(v) => setWF({ title: v })}
        />
      </div>
      <AreaField
        label="Summary"
        value={wf.summary as string}
        onChange={(v) => setWF({ summary: v })}
      />
      <TagsField
        label="Focus skills"
        value={asStrArr(wf.focusSkills)}
        onChange={(v) => setWF({ focusSkills: v })}
      />
      <TagsField
        label="Recommended domains"
        value={asStrArr(wf.recommendedDomains)}
        onChange={(v) => setWF({ recommendedDomains: v })}
      />
      <WeaknessEditor
        title="Target weaknesses"
        items={asArr<Weakness>(wf.targetWeaknesses)}
        onChange={(v) => setWF({ targetWeaknesses: v })}
      />
    </Section>
  );
}

function MistakesSection({
  items,
  onChange,
}: {
  items: Mistake[];
  onChange: (n: Mistake[]) => void;
}) {
  return (
    <Section title="Mistakes to review">
      <ArrayEditor<Mistake>
        title="Mistakes"
        items={items}
        onChange={onChange}
        addLabel="Add mistake"
        makeNew={() => ({
          questionId: '',
          questionText: '',
          skillTag: '',
          partNumber: 5,
          difficulty: 'medium',
          mistakeCount: 1,
          contentTags: [],
        })}
        render={(m, update) => (
          <div className="space-y-1.5 pr-4">
            <AreaField
              label="Question text"
              value={m.questionText}
              onChange={(v) => update({ questionText: v })}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <TextField
                label="Question id"
                value={m.questionId}
                onChange={(v) => update({ questionId: v })}
              />
              <TextField
                label="Skill tag"
                value={m.skillTag}
                onChange={(v) => update({ skillTag: v })}
              />
              <NumberField
                label="Part"
                value={m.partNumber}
                onChange={(v) => update({ partNumber: v })}
              />
              <SelectField
                label="Difficulty"
                value={m.difficulty}
                options={DIFFICULTY_OPTS}
                onChange={(v) => update({ difficulty: v })}
              />
              <NumberField
                label="Mistake count"
                value={m.mistakeCount}
                onChange={(v) => update({ mistakeCount: v })}
              />
            </div>
            <TagsField
              label="Content tags"
              value={asStrArr(m.contentTags)}
              onChange={(v) => update({ contentTags: v as string[] })}
            />
          </div>
        )}
      />
    </Section>
  );
}

function ResourcesSection({
  items,
  onChange,
}: {
  items: Resource[];
  onChange: (n: Resource[]) => void;
}) {
  return (
    <Section title="Available resources" defaultOpen={false}>
      <ArrayEditor<Resource>
        title="Resources"
        items={items}
        onChange={onChange}
        addLabel="Add resource"
        makeNew={() => ({ type: 'article', title: '', description: '' })}
        render={(r, update) => (
          <div className="space-y-1.5 pr-4">
            <div className="grid grid-cols-2 gap-1.5">
              <SelectField
                label="Type"
                value={r.type}
                options={RESOURCE_TYPE_OPTS}
                onChange={(v) => update({ type: v })}
              />
              <TextField
                label="Title"
                value={r.title}
                onChange={(v) => update({ title: v })}
              />
              <TextField
                label="Domain"
                value={r.domain}
                onChange={(v) => update({ domain: v })}
              />
              <TextField
                label="URL"
                value={r.url}
                onChange={(v) => update({ url: v })}
              />
            </div>
            <AreaField
              label="Description"
              value={r.description}
              onChange={(v) => update({ description: v })}
            />
            <TagsField
              label="Topics"
              value={asStrArr(r.topics)}
              onChange={(v) => update({ topics: v as string[] })}
            />
          </div>
        )}
      />
    </Section>
  );
}

function MissedSection({
  items,
  onChange,
}: {
  items: Missed[];
  onChange: (n: Missed[]) => void;
}) {
  return (
    <Section title="Missed sessions" defaultOpen={false}>
      <ArrayEditor<Missed>
        title="Missed"
        items={items}
        onChange={onChange}
        addLabel="Add missed"
        makeNew={() => ({ focus: '', targetSkills: [], suggestedDomains: [] })}
        render={(s, update) => (
          <div className="space-y-1.5 pr-4">
            <TextField
              label="Focus"
              value={s.focus}
              onChange={(v) => update({ focus: v })}
            />
            <TagsField
              label="Target skills"
              value={asStrArr(s.targetSkills)}
              onChange={(v) => update({ targetSkills: v as string[] })}
            />
            <TagsField
              label="Suggested domains"
              value={asStrArr(s.suggestedDomains)}
              onChange={(v) => update({ suggestedDomains: v as string[] })}
            />
          </div>
        )}
      />
    </Section>
  );
}

function DirectivesSection({
  ud,
  setUD,
}: {
  ud: Obj | undefined;
  setUD: (p: Obj | undefined) => void;
}) {
  const d = ud ?? {};
  const has = !!ud;
  return (
    <Section title="User directives (memo)" defaultOpen={false}>
      {!has ? (
        <button
          type="button"
          className="text-xs text-indigo-600"
          onClick={() => setUD({ focus: '', note: '', materials: [] })}
        >
          + Enable memo directives
        </button>
      ) : (
        <div className="space-y-1.5">
          <button
            type="button"
            className="text-xs text-red-500"
            onClick={() => setUD(undefined)}
          >
            Remove directives
          </button>
          <TextField
            label="Focus"
            value={d.focus as string}
            onChange={(v) => setUD({ ...d, focus: v })}
          />
          <AreaField
            label="Note"
            value={d.note as string}
            onChange={(v) => setUD({ ...d, note: v })}
          />
          <ArrayEditor<Material>
            title="Materials"
            items={asArr<Material>(d.materials)}
            addLabel="Add material"
            makeNew={() => ({ title: '', type: 'article', domain: '' })}
            onChange={(v) => setUD({ ...d, materials: v })}
            render={(m, update) => (
              <div className="grid grid-cols-3 gap-1.5 pr-4">
                <TextField
                  label="Title"
                  value={m.title}
                  onChange={(v) => update({ title: v })}
                />
                <SelectField
                  label="Type"
                  value={m.type}
                  options={RESOURCE_TYPE_OPTS}
                  onChange={(v) => update({ type: v })}
                />
                <TextField
                  label="Domain"
                  value={m.domain}
                  onChange={(v) => update({ domain: v })}
                />
              </div>
            )}
          />
        </div>
      )}
    </Section>
  );
}

// ============================ DAILY (AI) FORM ============================
export function DailyForm({
  value,
  onChange,
}: {
  value: Obj;
  onChange: (next: Obj) => void;
}) {
  const set = (patch: Obj) => onChange({ ...value, ...patch });
  const df = asObj(value.dailyFocus);
  const wf = asObj(value.weekFocus);
  const comp = asObj(value.competencyProfile);
  const prefs = asObj(value.userPreferences);

  return (
    <div className="space-y-2">
      <DailyFocusSection
        df={df}
        setDF={(p) => set({ dailyFocus: { ...df, ...p } })}
      />
      <WeekFocusSection
        wf={wf}
        setWF={(p) => set({ weekFocus: { ...wf, ...p } })}
      />

      <Section title="Competency profile">
        <SelectField
          label="Current level (CEFR)"
          value={comp.currentLevel as string}
          options={CEFR_OPTS}
          onChange={(v) =>
            set({ competencyProfile: { ...comp, currentLevel: v } })
          }
        />
        <ArrayEditor<LowestSkill>
          title="Lowest skills"
          items={asArr<LowestSkill>(comp.lowestSkills)}
          addLabel="Add skill"
          makeNew={() => ({
            skill: '',
            currentAccuracy: 40,
            proficiency: 'weak',
          })}
          onChange={(v) =>
            set({ competencyProfile: { ...comp, lowestSkills: v } })
          }
          render={(s, update) => (
            <div className="grid grid-cols-3 gap-1.5 pr-4">
              <TextField
                label="Skill"
                value={s.skill}
                onChange={(v) => update({ skill: v })}
              />
              <NumberField
                label="Accuracy %"
                value={s.currentAccuracy}
                min={0}
                max={100}
                onChange={(v) => update({ currentAccuracy: v })}
              />
              <SelectField
                label="Proficiency"
                value={s.proficiency}
                options={PROFICIENCY_OPTS}
                onChange={(v) => update({ proficiency: v })}
              />
            </div>
          )}
        />
      </Section>

      <Section title="User preferences" defaultOpen={false}>
        <SelectField
          label="Preferred study time"
          value={prefs.preferredStudyTime as string}
          options={STUDY_TIME_OPTS}
          onChange={(v) =>
            set({ userPreferences: { ...prefs, preferredStudyTime: v } })
          }
        />
        <TagsField
          label="Content interests"
          value={asStrArr(prefs.contentInterests)}
          onChange={(v) =>
            set({ userPreferences: { ...prefs, contentInterests: v } })
          }
        />
      </Section>

      <MistakesSection
        items={asArr<Mistake>(value.mistakesToReview)}
        onChange={(v) => set({ mistakesToReview: v })}
      />
      <ResourcesSection
        items={asArr<Resource>(value.availableResources)}
        onChange={(v) => set({ availableResources: v })}
      />
      <MissedSection
        items={asArr<Missed>(value.missedSessions)}
        onChange={(v) => set({ missedSessions: v })}
      />
      <DirectivesSection
        ud={value.userDirectives as Obj | undefined}
        setUD={(v) => set({ userDirectives: v })}
      />
    </div>
  );
}

// ============================ DAILY (PIPELINE) FORM ============================
// Pipeline edits the roadmap's selected week + memo + inline simContext.
export function DailyPipelineForm({
  value,
  onChange,
}: {
  value: Obj;
  onChange: (next: Obj) => void;
}) {
  const set = (patch: Obj) => onChange({ ...value, ...patch });
  const roadmap = asObj(value.roadmap);
  const weeks = asArr<Obj>(roadmap.weeklyFocuses);
  const targetWeek = value.targetWeekNumber as number;
  const idx = weeks.findIndex((w) => (w.weekNumber as number) === targetWeek);
  const wf = idx >= 0 ? weeks[idx] : {};

  const setWeek = (patch: Obj) => {
    if (idx < 0) return;
    const next = [...weeks];
    next[idx] = { ...wf, ...patch };
    set({ roadmap: { ...roadmap, weeklyFocuses: next } });
  };

  const sim = asObj(value.simContext);
  const simUser = asObj(sim.user);
  const comp = asObj(simUser.competencyProfile);

  return (
    <div className="space-y-2">
      <Section title="Pipeline target">
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            label="Target week number"
            value={targetWeek}
            onChange={(v) => set({ targetWeekNumber: v })}
          />
          <SelectField
            label="Target day-of-week"
            value={String(value.targetDayOfWeek ?? '')}
            options={DOW_OPTS}
            onChange={(v) => set({ targetDayOfWeek: Number(v) })}
          />
          <SelectField
            label="Is blocked (critical)"
            value={String(value.isBlocked ?? 'false')}
            options={['false', 'true']}
            onChange={(v) => set({ isBlocked: v === 'true' })}
          />
          <TextField
            label="userId (for DB-backed bits)"
            value={value.userId as string}
            onChange={(v) => set({ userId: v })}
          />
        </div>
        {idx < 0 && (
          <p className="text-xs text-amber-600">
            No week #{targetWeek} in roadmap.weeklyFocuses — add it via JSON or
            change the target week.
          </p>
        )}
      </Section>

      {idx >= 0 && (
        <>
          <WeekFocusSection wf={wf} setWF={setWeek} />
          <MistakesSection
            items={asArr<Mistake>(wf.mistakes)}
            onChange={(v) => setWeek({ mistakes: v })}
          />
        </>
      )}

      <Section title="simContext — competency override" defaultOpen={false}>
        <SelectField
          label="Current CEFR level"
          value={comp.currentCEFRLevel as string}
          options={CEFR_OPTS}
          onChange={(v) =>
            set({
              simContext: {
                ...sim,
                user: {
                  ...simUser,
                  competencyProfile: { ...comp, currentCEFRLevel: v },
                },
              },
            })
          }
        />
        <ArrayEditor<LowestSkill>
          title="Skill matrix"
          items={asArr<LowestSkill>(comp.skillMatrix)}
          addLabel="Add skill"
          makeNew={() => ({
            skill: '',
            currentAccuracy: 40,
            proficiency: 'weak',
          })}
          onChange={(v) =>
            set({
              simContext: {
                ...sim,
                user: {
                  ...simUser,
                  competencyProfile: { ...comp, skillMatrix: v },
                },
              },
            })
          }
          render={(s, update) => (
            <div className="grid grid-cols-3 gap-1.5 pr-4">
              <TextField
                label="Skill"
                value={s.skill}
                onChange={(v) => update({ skill: v })}
              />
              <NumberField
                label="Accuracy %"
                value={s.currentAccuracy}
                onChange={(v) => update({ currentAccuracy: v })}
              />
              <SelectField
                label="Proficiency"
                value={s.proficiency}
                options={PROFICIENCY_OPTS}
                onChange={(v) => update({ proficiency: v })}
              />
            </div>
          )}
        />
        <Field hint="availableResources & skippedContent overrides are best edited in the JSON tab (internal shapes)." />
      </Section>
    </div>
  );
}
