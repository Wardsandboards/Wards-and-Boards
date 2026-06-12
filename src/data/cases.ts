import type { Case } from '../types'
// ============================================================
//  CASES DATA FILE - all content lives here, no UI edits needed
//
//  Each active case has:
//    wardMoment   - rotation, scenario, why, modelAnswer, prompts[]
//    vignette     - the patient presentation
//    ms1          - three foundations questions
//    mechanism    - quickFlow + quickPts, chain (each step has pt),
//                   graphic (curve config), starlingText, clinicalPearl
//
//  Graphic coordinate space matches the SVG viewBox 0..380 x, 0..250 y
//  (plot area roughly x 50..350, y 200..30). Each step's pt = [x, y].
//
//  Only MS1 is live in the UI; harder tiers show "in progress".
// ============================================================

const _CASES = [

  // ── CASE 1: Decompensated Heart Failure / Frank-Starling ──
  {
    id: "chf-frank-starling",
    active: true,
    title: "Dyspnea on Exertion",
    system: "Cardiovascular",
    topic: "Frank-Starling / Cardiac Output",

    wardMoment: {
      rotation: "Internal Medicine, Cardiology service",
      scenario: `You're a third-year student on your medicine rotation. The team stops outside room 412.
        The attending turns to you before entering: "We gave this patient with decompensated heart failure
        furosemide (a diuretic) 80mg IV this morning and the creatinine bumped. But the patient's dyspnea
        improved and the oxygen requirement dropped."`,
      why: `This is the Frank-Starling curve. You learned it in first-year physiology, and it comes up often
        on medicine and cardiology rotations, so it helps to have the reasoning ready.`,
      modelAnswer: `In decompensated heart failure the heart operates on a depressed, flattened Frank-Starling
        curve, and chronic neurohormonal activation has left the patient volume overloaded, sitting out on the
        flat portion where extra filling adds very little stroke volume and mostly worsens congestion.
        Furosemide removes that excess volume, lowering the end-diastolic volume and moving the operating point
        back onto the ascending portion of the Frank-Starling curve, where each unit of preload generates more
        stroke volume. Forward output improves while the congestion, meaning the dyspnea and oxygen
        requirement, resolves. The rise in creatinine is pre-renal and tells you the patient is approaching an
        optimal filling pressure rather than being harmed.`,
      prompts: [
        {
          id: "co",
          question: `First, in your own words: what is cardiac output?`,
          hint: `Think of the two factors and what they combine to give.`,
          rubric: [
            { concept: "Stroke volume", keywords: ["stroke volume", "sv"] },
            { concept: "Heart rate", keywords: ["heart rate", "hr", "beats per minute", "bpm"] },
            { concept: "Cardiac output = heart rate × stroke volume (the blood pumped per minute)", keywords: ["times stroke volume", "hr x sv", "hr×sv", "per minute", "in a minute", "pumped", "volume of blood", "amount of blood", "liters per minute", "l/min"] },
          ],
        },
        {
          id: "reason",
          question: `Now walk me through why removing fluid from a patient whose heart is already struggling would make the cardiac output better, not worse.`,
          hint: `Think about where the patient sits on the Frank-Starling curve before and after diuresis.`,
          rubric: [
            { concept: "Frank-Starling curve",       keywords: ["starling", "frank-starling", "frank starling", "curve", "shift left", "shifts left", "shift to the left", "move left", "moving left", "leftward", "left on the curve"] },
            { concept: "Preload / end-diastolic volume is elevated",  keywords: ["preload", "edv", "end-diastolic", "overfilled", "fluid overload", "volume overload", "filling"] },
            { concept: "Flat portion of the curve (plateau)", keywords: ["flat", "plateau", "overstretched", "flat portion", "flat part"] },
            { concept: "Furosemide reduces preload", keywords: ["furosemide", "diuresis", "diuretic", "diurese", "reduce preload", "reduces preload", "lower preload", "less preload", "decrease preload", "decreased preload", "drop preload", "take fluid off", "taking fluid off", "remove fluid", "less fluid", "less filling", "lower filling"] },
            { concept: "Stroke volume or output improves", keywords: ["stroke volume", "cardiac output", "output improves", "better output", "improves", "increases", "shift left", "shifts left", "leftward", "ascending"] },
          ],
        },
      ],
    },

    vignette: `A 68-year-old patient with ischemic cardiomyopathy presents with worsening dyspnea on
      exertion, 2+ pitting edema to the knees, elevated jugular venous distension, and bilateral basilar
      crackles. Ejection fraction is 30% (reduced) and NT-proBNP is 5,800 pg/mL (elevated).`,

    ms1: {
      intro: "Work through the physiology one step at a time.",
      questions: [
        {
          id: "1A",
          stem: "What is happening to this patient's preload (end-diastolic volume)?",
          choices: [
            "Unchanged. A faster heart rate keeps ventricular filling steady despite the low ejection fraction.",
            "Unchanged. Sodium balance is preserved. Circulating volume and filling stay the same.",
            "Increased. Neurohormonal sodium and water retention raises venous return and filling.",
            "Increased. High jugular venous pressure adds further volume to the left ventricle each beat.",
          ],
          correct: 2,
          feedback: `In decompensated heart failure, reduced cardiac output activates the renin-angiotensin-aldosterone system and the sympathetic nervous system, and that drives sodium and water retention. Venous return and end-diastolic volume rise, so the ventricle is overfilled. Jugular venous distension and peripheral edema are the clinical signs of this volume overload.`,
        },
        {
          id: "1B",
          stem: "Given the elevated end-diastolic volume, where is this patient on the Frank-Starling curve?",
          curve: {
            pre:  { curves: "normal", phase: "none" },
            post: { curves: "both",   phase: "before" },
          },
          choices: [
            "On the ascending portion. The stretched ventricle keeps converting added filling into more stroke volume.",
            "On the ascending portion. Greater sarcomere stretch continues to raise stroke volume.",
            "On the flat portion (plateau). Reduced contractility keeps stroke volume low at every filling pressure.",
            "On the flat portion (plateau). More filling now yields little additional stroke volume.",
          ],
          correct: 3,
          feedback: `In decompensated heart failure the ventricle operates on a depressed, flattened Frank-Starling curve. At a high end-diastolic volume, more filling produces little additional stroke volume, so the patient is sitting on the flat portion (plateau): volume overloaded yet still low output. One point worth knowing: a true descending limb, where more filling actually lowers output, is not seen in the intact heart, so this is a plateau rather than a downslope. The ascending portion still exists, just at lower end-diastolic volumes.`,
        },
        {
          id: "1C",
          stem: "You give furosemide (a diuretic) 80mg IV. What happens to stroke volume, and why?",
          curve: {
            pre:  { curves: "normal", phase: "none" },
            post: { curves: "both",   phase: "animate" },
          },
          choices: [
            "Stroke volume increases. Furosemide raises contractility and lifts the entire Frank-Starling curve.",
            "Stroke volume increases. Lower filling moves the patient onto the ascending portion of the curve.",
            "Stroke volume decreases. Lowering preload reduces output even on a depressed curve.",
            "Stroke volume decreases. The fall in circulating volume cuts venous return faster than the heart adjusts.",
          ],
          correct: 1,
          feedback: `When the ventricle is volume overloaded it sits on the flat portion of the Frank-Starling curve, where extra preload mainly adds congestion. Furosemide lowers the end-diastolic volume and moves the patient onto the ascending portion, so the same ventricle ejects more and both stroke volume and cardiac output rise. The curve itself does not move; only inotropes or sympathetic tone do that.`,
        },
      ],
    },

    mechanism: {
      title: "Why Furosemide Improves Output in Decompensated Heart Failure",
      quickFlow: [
        "↓ Contractility",
        "↑ RAAS + sympathetic drive",
        "↑ End-diastolic volume",
        "On the flat portion of the Frank-Starling curve",
        "Diuretic → ↓ end-diastolic volume",
        "↑ Stroke volume & cardiac output",
      ],
      quickPts: [[120, 140], [320, 138], [320, 138], [320, 138], [220, 128], [150, 121]],
      graphic: {
        title: "Frank-Starling curve",
        xLabel: "End-diastolic volume (preload) →",
        yLabel: "Stroke volume →",
        paths: [
          { d: "M50,196 C 85,150 100,80 140,62 C 200,40 280,40 350,40", label: "Normal contractility", lx: 250, ly: 34, muted: true },
          { d: "M50,198 C 90,176 122,134 150,121 C 210,106 290,128 350,140", label: "Heart failure", lx: 262, ly: 160, muted: false },
        ],
      },
      chain: [
        { label: "Ischemic cardiomyopathy", detail: "Reduced contractility produces a depressed Frank-Starling curve, so stroke volume is lower at any given preload.", type: "normal", pt: [120, 140] },
        { label: "Neurohormonal activation", detail: "Low cardiac output activates the renin-angiotensin-aldosterone system and the sympathetic nervous system, causing sodium and water retention, so preload climbs.", type: "normal", pt: [320, 138] },
        { label: "On the flat portion of the Frank-Starling curve", detail: "Preload is very high but stroke volume stays low, so more filling mainly worsens congestion (jugular venous distension, crackles, edema).", type: "highlight", pt: [320, 138] },
        { label: "Furosemide reduces preload", detail: "It blocks sodium reabsorption in the loop of Henle; water follows, so circulating volume and end-diastolic volume fall.", type: "normal", pt: [240, 131] },
        { label: "Operating point moves back down the curve", detail: "Lower end-diastolic volume shifts the patient onto the ascending portion of the Frank-Starling curve.", type: "highlight", pt: [185, 124] },
        { label: "Stroke volume and cardiac output rise", detail: "On the ascending portion, each unit of preload generates more stroke volume, so cardiac output rises.", type: "outcome", pt: [150, 121] },
      ],
      starlingText: `A normal heart sits on a steep ascending Frank-Starling curve. In decompensated heart
        failure the curve is depressed and flatter. This patient's high preload places the operating point on
        the flat plateau, where additional filling produces almost no additional stroke volume. Furosemide
        brings the operating point back toward the steeper ascending portion, where stroke volume and cardiac
        output rise.`,
      clinicalPearl: `A creatinine rise after aggressive diuresis usually reflects pre-renal azotemia.
        Over-diuresis moves the patient too far down the ascending portion of the Frank-Starling curve and
        drops cardiac output below what the kidneys need to stay perfused. This is distinct from cardiorenal
        syndrome. Aim for an optimal preload, not maximal diuresis.`,
      source: `StatPearls, Physiology, Frank Starling Law`,
    },
  },

  // ── CASE 2: Hemorrhagic Shock ─────────────────────────────
  {
    id: "hemorrhagic-shock",
    active: true,
    title: "Trauma Bay: Hemorrhagic Shock",
    system: "Cardiovascular",
    topic: "Compensatory Responses / Cardiac Output",

    wardMoment: {
      rotation: "Surgery or Emergency Medicine",
      scenario: `You're on your surgery rotation. A trauma patient arrives by ambulance after a high-speed
        motor vehicle collision with an estimated 1.5 liters of blood loss. Heart rate is 128, blood pressure
        84/52. The senior resident hands you the chart and the attending looks at you.`,
      why: `The compensatory response to hemorrhage is first-year physiology, and it comes up often on surgery
        and emergency rotations. It is worth being comfortable with, and the reasoning matters more than the
        numbers.`,
      modelAnswer: `The patient has lost roughly a third of the blood volume, so venous return and
        end-diastolic volume fall, which drops stroke volume on a normal Frank-Starling curve. Baroreceptors in
        the carotid sinus and aortic arch sense the falling pressure and trigger a sympathetic surge: a faster,
        stronger heartbeat through beta-1 receptors, arteriolar vasoconstriction through alpha-1 receptors, and
        venoconstriction that returns reservoir blood to the heart. Cardiac output is heart rate times stroke
        volume, and with so little volume left the stroke volume is too low for tachycardia to compensate, and
        mean arterial pressure still falls. The definitive fix is volume: restore preload and the same
        Frank-Starling mechanism restores output.`,
      prompts: [
        {
          id: "co",
          question: `First, in your own words: what is cardiac output?`,
          hint: `Think of the two factors and what they combine to give.`,
          rubric: [
            { concept: "Stroke volume", keywords: ["stroke volume", "sv"] },
            { concept: "Heart rate", keywords: ["heart rate", "hr", "beats per minute", "bpm"] },
            { concept: "Cardiac output = heart rate × stroke volume (the blood pumped per minute)", keywords: ["times stroke volume", "hr x sv", "hr×sv", "per minute", "in a minute", "pumped", "volume of blood", "amount of blood", "liters per minute", "l/min"] },
          ],
        },
        {
          id: "reason",
          question: `Now walk me through what the body is doing to compensate for the blood loss, and why it is not enough.`,
          hint: `Trace preload, the baroreceptor reflex, and what is missing.`,
          rubric: [
            { concept: "Blood loss lowers preload / venous return", keywords: ["preload", "venous return", "edv", "end-diastolic", "blood loss", "volume", "hypovolemia", "filling"] },
            { concept: "Baroreceptors sense the falling pressure", keywords: ["baroreceptor", "baro receptor", "aortic arch", "carotid", "pressure drop", "pressure falls", "sense"] },
            { concept: "Sympathetic surge / tachycardia", keywords: ["sympathetic", "tachycardia", "heart rate", "beta-1", "beta 1", "catecholamine", "epinephrine", "norepinephrine"] },
            { concept: "Vasoconstriction raises resistance", keywords: ["vasoconstriction", "resistance", "alpha", "squeeze", "constrict", "venoconstriction"] },
            { concept: "Why it fails: stroke volume still low, needs volume", keywords: ["not enough", "insufficient", "still low", "stroke volume low", "tank is empty", "volume replacement", "fluid", "resuscitation", "transfusion", "blood"] },
          ],
        },
      ],
    },

    vignette: `A 24-year-old patient arrives by ambulance after a high-speed motor vehicle collision. Heart
      rate 128, blood pressure 84/52, respiratory rate 24, and confused. The abdomen is rigid. Estimated blood
      loss is 1.5 liters.`,

    ms1: {
      intro: "Trace the compensatory physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "What is the immediate effect of the blood loss on preload (end-diastolic volume)?",
          choices: [
            "Increased. Sympathetic venoconstriction shifts reservoir blood to the heart and overfills it.",
            "Increased. Rapid fluid movement from the tissues refills the circulation within seconds.",
            "Decreased. The lost circulating volume lowers venous return and end-diastolic volume.",
            "Decreased. Antidiuretic hormone is released, which directly lowers ventricular filling.",
          ],
          correct: 2,
          feedback: `Blood loss directly lowers circulating volume, which reduces venous return and end-diastolic volume and moves the patient leftward on a normal Frank-Starling curve, lowering stroke volume. Sympathetic venoconstriction helps a little but cannot replace 1.5 liters, which is more than a quarter of the blood volume.`,
        },
        {
          id: "1B",
          stem: "The heart rate is 128. Which mechanism is mainly responsible?",
          choices: [
            "Baroreceptors sense the fall in pressure and raise sympathetic output to the sinoatrial node.",
            "Peripheral chemoreceptors detect reduced oxygen delivery and directly accelerate the sinoatrial node each beat.",
            "Atrial stretch receptors sense reduced filling and speed the heart through the Bainbridge reflex.",
            "Carotid bodies sense the rising lactate level and drive the sinoatrial node through beta-1 receptors.",
          ],
          correct: 0,
          feedback: `Baroreceptors in the aortic arch and carotid sinus sense the fall in mean arterial pressure, reduce vagal tone, and increase sympathetic output, which drives beta-1 receptors at the sinoatrial node and raises the heart rate. The Bainbridge reflex works in the opposite direction, when volume loading stretches the atria.`,
        },
        {
          id: "1C",
          stem: "Despite a heart rate of 128, the blood pressure is still 84/52. Why is tachycardia not enough?",
          choices: [
            "Tachycardia has already restored cardiac output. The low pressure must come from acidosis relaxing the vessels.",
            "The faster heart rate shortens diastolic filling time so much that the end-diastolic volume drops below a safe threshold each beat.",
            "Catecholamine stores are exhausted by the ongoing bleeding, which limits the sympathetic response.",
            "Cardiac output is heart rate times stroke volume. The very low stroke volume keeps the product inadequate.",
          ],
          correct: 3,
          feedback: `Cardiac output is heart rate times stroke volume. Tachycardia raises the rate, but preload is so depleted that stroke volume is critically low, so the product still cannot maintain pressure. Systemic vascular resistance is actually high from vasoconstriction. Volume replacement is the definitive treatment because the underlying problem is the loss of circulating volume.`,
        },
      ],
    },

    mechanism: {
      title: "Hemorrhage, Compensation, and Why It Fails",
      quickFlow: [
        "↓ Blood volume",
        "↓ Venous return → ↓ preload",
        "↓ Stroke volume",
        "Baroreceptor → sympathetic surge",
        "Tachycardia + vasoconstriction",
        "Output still low → give volume",
      ],
      quickPts: [[90, 168], [90, 168], [90, 168], [120, 112], [120, 112], [185, 52]],
      graphic: {
        title: "Frank-Starling curve",
        xLabel: "End-diastolic volume (preload) →",
        yLabel: "Stroke volume →",
        paths: [
          { d: "M50,196 C 85,150 100,80 140,62 C 200,40 280,40 350,40", label: "Normal heart", lx: 250, ly: 34, muted: false },
        ],
      },
      chain: [
        { label: "1.5 liters of blood loss", detail: "About a third of the circulating volume. Venous return drops at once, lowering end-diastolic volume and therefore stroke volume on the Frank-Starling curve.", type: "normal", pt: [90, 168] },
        { label: "Falling pressure sensed by baroreceptors", detail: "Aortic arch and carotid sinus baroreceptors detect the drop within seconds and signal the brainstem, producing parasympathetic withdrawal and a sympathetic surge.", type: "normal", pt: [90, 168] },
        { label: "Three-pronged sympathetic response", detail: "Beta-1 receptors raise heart rate and contractility, alpha-1 receptors drive vasoconstriction and raise systemic vascular resistance, and venoconstriction returns reservoir blood to partially restore preload.", type: "branch", pt: [120, 112] },
        { label: "Why compensation is only partial", detail: "Tachycardia raises the rate, but stroke volume is still too low, so cardiac output stays inadequate. Vasoconstriction defends pressure briefly but shunts blood away from the gut, kidneys, and skin.", type: "highlight", pt: [105, 138] },
        { label: "Slower hormonal backup", detail: "Over minutes to hours, renin leads to angiotensin and aldosterone, and antidiuretic hormone drives water retention. These restore volume but are far too slow for acute bleeding.", type: "normal", pt: [120, 112] },
        { label: "Treatment: volume first", detail: "Restore preload, restore end-diastolic volume, and the same Frank-Starling mechanism restores stroke volume and cardiac output. Vasopressors without volume only constrict vessels around an inadequate circulating volume.", type: "outcome", pt: [185, 52] },
      ],
      starlingText: `Unlike heart failure, contractility here is normal, so the patient sits on a normal
        Frank-Starling curve, just far to the left at a low end-diastolic volume. Sympathetic tone nudges the
        operating point up a little, but only volume moves it back to the right, where stroke volume is
        adequate. It is the mirror image of the heart failure case.`,
      clinicalPearl: `Mild hemorrhage can show a normal blood pressure with only a raised heart rate. Pressure
        often falls only after about 30 percent of the blood volume is lost, so tachycardia is the early
        warning. A patient on a beta-blocker may not mount that tachycardia, so judge perfusion and mental
        status, not heart rate alone.`,
      source: `StatPearls, Hemorrhagic Shock`,
    },
  },

  // ── CASE 3: Aortic Stenosis ───────────────────────────────
  {
    id: "aortic-stenosis",
    active: true,
    video: "",
    title: "Syncope on Exertion",
    system: "Cardiovascular",
    topic: "Afterload / Pressure Overload",

    wardMoment: {
      rotation: "Internal Medicine or Cardiology",
      scenario: `Morning rounds. The team is outside the room of a 74-year-old patient admitted for fainting
        while walking. The fellow mentions the echocardiogram showed a normal ejection fraction of 55% and a
        valve area of 0.7 cm².`,
      why: `Aortic stenosis is a common valve lesion, and the question of how someone can be breathless with a
        normal ejection fraction comes up often on medicine rotations. The logic is worth being comfortable
        with.`,
      modelAnswer: `Severe aortic stenosis is a fixed obstruction, so cardiac output cannot rise on demand.
        During exertion the skeletal muscles vasodilate and systemic vascular resistance falls; normally output
        would climb to defend the pressure, but the narrowed valve prevents that, so mean arterial pressure
        drops and the brain is briefly underperfused, which is the faint. Separately, the chronic pressure load
        drove concentric hypertrophy, which thickened and stiffened the ventricle. The stiff ventricle needs
        high filling pressures, and those pressures back up into the left atrium and lungs, so the patient is
        breathless even though the ejection fraction is normal, which is heart failure with preserved ejection
        fraction.`,
      prompts: [
        {
          id: "afterload",
          question: `First, in your own words: what is afterload?`,
          hint: `Think about what the ventricle has to work against to eject blood.`,
          rubric: [
            { concept: "The load / resistance the ventricle ejects against", keywords: ["resistance", "load", "ejects against", "pump against", "push against", "oppose", "wall stress"] },
            { concept: "Related to pressure (and the aortic valve / vessels)", keywords: ["pressure", "aortic", "valve", "arterial", "vascular"] },
            { concept: "High afterload means more work for the ventricle", keywords: ["harder", "more work", "increased", "higher", "greater effort"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why this patient faints on exertion even though the ejection fraction is normal, and why there is also breathlessness.`,
          hint: `Use MAP = cardiac output × systemic vascular resistance, and think about how a stiff ventricle fills.`,
          rubric: [
            { concept: "Fixed obstruction / output cannot rise", keywords: ["fixed", "obstruction", "cannot increase", "can't increase", "fixed output", "cannot rise"] },
            { concept: "Exercise lowers systemic vascular resistance", keywords: ["vasodilation", "resistance falls", "resistance drops", "svr", "exercise", "exertion", "skeletal muscle"] },
            { concept: "Pressure falls → cerebral hypoperfusion → syncope", keywords: ["pressure falls", "pressure drops", "map falls", "cerebral", "brain", "hypoperfusion", "syncope", "faint"] },
            { concept: "Concentric hypertrophy / stiff ventricle", keywords: ["concentric", "hypertrophy", "stiff", "thick", "wall thickness", "compliance"] },
            { concept: "Diastolic dysfunction → pulmonary congestion (HFpEF)", keywords: ["diastolic", "filling pressure", "pulmonary", "congestion", "breathless", "dyspnea", "preserved"] },
          ],
        },
      ],
    },

    vignette: `A 74-year-old patient reports fainting during a morning walk and three months of breathlessness
      and chest pressure on exertion. On exam there is a harsh crescendo-decrescendo systolic murmur at the
      right upper sternal border that radiates to the carotids, with a slow-rising, weak carotid pulse.
      Echocardiogram: valve area 0.7 cm², mean gradient 52 mmHg, ejection fraction 55%.`,

    ms1: {
      intro: "Work through the pressure-overload physiology.",
      questions: [
        {
          id: "1A",
          stem: "Aortic stenosis raises afterload. How does the left ventricle adapt over time?",
          choices: [
            "Eccentric hypertrophy, adding sarcomeres in series so the chamber enlarges to hold more volume each beat.",
            "Chamber dilation, stretching the ventricle to recruit more force on each beat.",
            "A faster resting heart rate that keeps output up as each stroke volume falls.",
            "Concentric hypertrophy, adding sarcomeres in parallel to thicken the wall and normalize wall stress.",
          ],
          correct: 3,
          feedback: `Pressure overload drives concentric hypertrophy: sarcomeres are added in parallel, the wall thickens without the chamber enlarging, and by the Laplace relationship the thicker wall brings wall stress back toward normal despite the high pressure. Eccentric hypertrophy, with sarcomeres in series and an enlarged chamber, is the response to volume overload such as aortic regurgitation.`,
        },
        {
          id: "1B",
          stem: "Why does this patient faint on exertion but not at rest?",
          choices: [
            "Exertion causes demand ischemia in the hypertrophied muscle, which triggers a brief self-limited arrhythmia and a faint.",
            "The faster heart rate during exercise shortens diastolic filling time so much that the end-diastolic volume drops below a safe threshold each beat.",
            "Output is fixed by the valve. When exercise drops systemic vascular resistance, the pressure falls and the brain is underperfused.",
            "Exercise provokes a strong reflex vagal surge from overstretched mechanoreceptors in the thick ventricular wall.",
          ],
          correct: 2,
          feedback: `Severe aortic stenosis is a fixed obstruction, so at rest output is adequate but it cannot rise on demand. During exercise the skeletal muscle beds vasodilate and systemic vascular resistance falls. Mean arterial pressure equals cardiac output times systemic vascular resistance, so with output fixed and resistance falling the pressure drops, cerebral perfusion falls, and the patient faints.`,
        },
        {
          id: "1C",
          stem: "The ejection fraction is 55%, which is normal. Why is the patient breathless?",
          choices: [
            "The thick, stiff ventricle resists filling. High filling pressures back up into the lungs with a normal ejection fraction.",
            "An ejection fraction of 55% is actually below normal for this patient's age. The breathlessness reflects hidden systolic failure.",
            "The high afterload reduces forward stroke volume despite a normal ejection fraction. That fall in output drives the pulmonary congestion.",
            "The thick ventricle displaces the mitral valve and causes regurgitation that raises pulmonary venous pressure.",
          ],
          correct: 0,
          feedback: `Concentric hypertrophy stiffens the ventricle, so it relaxes and fills poorly. To fill adequately it needs high pressures, and those pressures transmit back to the left atrium and pulmonary veins, causing congestion and breathlessness even though the ejection fraction is normal. This is heart failure with preserved ejection fraction: systolic function is fine, diastolic function is impaired.`,
        },
      ],
    },

    mechanism: {
      title: "Aortic Stenosis: Two Problems at Once",
      quickFlow: [
        "Narrowed valve = fixed obstruction",
        "Chronic pressure load",
        "Concentric hypertrophy → stiff ventricle",
        "At rest, pressure is fine",
        "Exertion: resistance falls, output can't rise",
        "Pressure falls → syncope",
      ],
      quickPts: [[60, 95], [60, 95], [60, 95], [60, 95], [210, 140], [330, 182]],
      graphic: {
        title: "Mean arterial pressure on exertion",
        xLabel: "Exertion →",
        yLabel: "Mean arterial pressure →",
        paths: [
          { d: "M50,95 C 150,90 250,86 350,84", label: "Normal", lx: 250, ly: 76, muted: true },
          { d: "M50,95 C 150,120 250,158 345,186", label: "Severe AS", lx: 250, ly: 174, muted: false },
        ],
      },
      chain: [
        { label: "Stenotic aortic valve (0.7 cm²)", detail: "Normal valve area is 3 to 4 cm² and severe stenosis is under 1.0 cm². This is a fixed obstruction to outflow, so cardiac output cannot rise on demand.", type: "normal", pt: [60, 95] },
        { label: "Chronic pressure overload, then concentric hypertrophy", detail: "The ventricle must generate high pressure to cross the 52 mmHg gradient. The wall thickens to normalize wall stress, and the ejection fraction stays normal because the muscle is thick and strong.", type: "normal", pt: [60, 95] },
        { label: "Problem 1: diastolic dysfunction", detail: "The thick, stiff muscle needs high filling pressures, which back up to the left atrium and lungs and cause breathlessness with a preserved ejection fraction.", type: "highlight", pt: [60, 95] },
        { label: "Problem 2: fixed cardiac output", detail: "The narrowed valve caps flow no matter how hard the ventricle contracts, so output cannot increase when the body demands more.", type: "highlight", pt: [60, 95] },
        { label: "Exertion lowers resistance", detail: "Exercise dilates the muscle beds and systemic vascular resistance falls. Normally output would rise to hold the pressure, but here it is fixed.", type: "normal", pt: [210, 140] },
        { label: "Pressure falls → syncope", detail: "Mean arterial pressure equals cardiac output times resistance. With output fixed and resistance falling, the pressure drops, the brain is underperfused, and the patient faints.", type: "outcome", pt: [330, 182] },
      ],
      starlingText: `At rest the narrowed valve still lets through enough flow, so the pressure is normal. The
        moment the patient exerts, the muscle beds open up and resistance falls, but the fixed valve cannot
        raise output to compensate, so the pressure drops and the brain is briefly underperfused. That is the
        exertional faint.`,
      clinicalPearl: `Nitroglycerin is risky in severe aortic stenosis. The stiff ventricle depends on a high
        filling pressure, and the venodilation from nitrates drops that filling sharply, so stroke volume falls
        against the fixed valve and the blood pressure can fall sharply. Be cautious before giving nitrates to
        a chest-pain patient with a harsh systolic murmur.`,
      source: `StatPearls, Aortic Stenosis`,
    },
  },

  // ── CASE 4: Oxygen-Hemoglobin Dissociation ────────────────
  {
    id: "oxyhemoglobin-dissociation",
    active: true,
    title: "Oxygen Delivery in Sepsis",
    system: "Respiratory / Transport",
    topic: "Oxygen-Hemoglobin Dissociation",

    wardMoment: {
      rotation: "Internal Medicine or Critical Care",
      scenario: `You're on the wards with a patient who has severe sepsis from pneumonia: temperature 39.5 °C,
        a lactic acidosis, and a rising carbon dioxide. The attending points at the monitor and turns to you.`,
      why: `The oxygen-hemoglobin dissociation curve and the Bohr effect are first-year physiology, and they
        help explain oxygen delivery at the bedside on medicine and critical care rotations.`,
      modelAnswer: `Fever, a low pH, a high carbon dioxide, and a high 2,3-BPG all lower hemoglobin's affinity
        for oxygen and shift the dissociation curve to the right, an effect called the Bohr effect. At any given
        tissue oxygen tension the hemoglobin holds a little less oxygen, so it releases more of it to the
        tissues. In a septic, hypermetabolic patient this shift is useful, because the tissues with the highest
        oxygen demand are warm, acidic, and carbon-dioxide rich, which is exactly where the curve shifts and
        extra unloading helps. The trade-off is slightly less loading in the lungs, but that matters little
        because the top of the curve is flat.`,
      prompts: [
        {
          id: "curve",
          question: `First, in your own words: what does the oxygen-hemoglobin dissociation curve show?`,
          hint: `Think about what is on each axis, and where loading and unloading happen.`,
          rubric: [
            { concept: "Saturation versus oxygen tension (PO₂)", keywords: ["saturation", "po2", "partial pressure", "oxygen tension", "oxygen level"] },
            { concept: "Sigmoid shape from cooperative binding", keywords: ["sigmoid", "s-shape", "s shape", "cooperative", "cooperativity"] },
            { concept: "Loading in the lungs, unloading in the tissues", keywords: ["loading", "unloading", "lungs", "tissue", "release", "pick up"] },
          ],
        },
        {
          id: "reason",
          question: `Now, this patient is febrile and acidotic. What does that do to the curve, and does it help or hurt oxygen delivery to the tissues?`,
          hint: `Name the shift, the effect on affinity, and what it does at the tissues.`,
          rubric: [
            { concept: "The curve shifts right", keywords: ["right shift", "shifts right", "shift to the right", "rightward", "shifted right"] },
            { concept: "Bohr effect: low pH, high CO₂, fever, 2,3-BPG", keywords: ["bohr", "low ph", "acidosis", "acidic", "carbon dioxide", "co2", "fever", "temperature", "2,3", "bpg", "dpg"] },
            { concept: "Lower oxygen affinity", keywords: ["affinity", "lower affinity", "decreased affinity", "less tightly", "binds less"] },
            { concept: "More oxygen unloaded / released to tissues", keywords: ["unload", "release", "gives up", "delivers more", "more oxygen to tissue", "more to the tissue"] },
            { concept: "It helps tissue oxygen delivery", keywords: ["helps", "beneficial", "improves delivery", "good", "favorable", "advantage"] },
          ],
        },
      ],
    },

    vignette: `A 64-year-old patient with severe sepsis from pneumonia: temperature 39.5 °C, heart rate 118,
      blood pressure 92/54, arterial pH 7.28 (acidotic), and lactate 5 mmol/L (elevated). Arterial oxygen
      saturation is 95% on supplemental oxygen.`,

    ms1: {
      intro: "Work through oxygen transport one step at a time.",
      questions: [
        {
          id: "1A",
          stem: "Fever, acidosis, and a high carbon dioxide do what to the oxygen-hemoglobin dissociation curve?",
          choices: [
            "Shift it left, raising hemoglobin's affinity so it holds oxygen more tightly.",
            "Shift it right, lowering hemoglobin's affinity so it releases oxygen more readily.",
            "Shift it left, because a higher temperature strengthens oxygen binding to hemoglobin.",
            "Shift it right, because a lower carbon dioxide level raises hemoglobin's affinity for oxygen.",
          ],
          correct: 1,
          feedback: `Fever, a low pH, a high carbon dioxide, and a high 2,3-BPG all lower hemoglobin's affinity for oxygen and shift the curve to the right. This is the Bohr effect. A right shift means that at the same oxygen tension hemoglobin carries a little less oxygen, so it unloads more to the tissues.`,
        },
        {
          id: "1B",
          stem: "What does this rightward shift mean for the tissues?",
          choices: [
            "Hemoglobin releases more oxygen at the tissue oxygen level, improving delivery where needed.",
            "Hemoglobin binds oxygen more tightly. Less of it reaches the tissues.",
            "Oxygen delivery is unchanged, because the saturation in the lungs is what sets tissue delivery.",
            "The tissues receive less oxygen, because a right shift lowers the saturation everywhere by the same amount.",
          ],
          correct: 0,
          feedback: `A right shift lowers oxygen affinity, so at the tissue oxygen tension hemoglobin gives up more oxygen. In a hypermetabolic, febrile, acidotic patient this is useful, because the tissues with the highest oxygen demand are exactly the warm, acidic, carbon-dioxide-rich beds where the curve shifts most and extra unloading helps.`,
        },
        {
          id: "1C",
          stem: "Why does the arterial saturation stay near normal in the lungs despite the right shift?",
          choices: [
            "Because the rightward shift somehow does not reach the pulmonary capillaries, only the peripheral tissues.",
            "Because the supplemental oxygen the patient is receiving completely reverses the rightward shift inside the pulmonary capillaries.",
            "Because the lungs work on the flat top of the curve, where a high oxygen tension still loads hemoglobin nearly fully.",
            "Because the heart pushes blood through the lungs too quickly for the rightward shift to have any effect.",
          ],
          correct: 2,
          feedback: `The upper part of the dissociation curve is flat: above an oxygen tension of about 60 mmHg, hemoglobin is almost fully saturated, so even with a right shift the lungs still load oxygen well. The shift matters on the steep part of the curve, at the tissues, where it helps unloading. So arterial saturation can look nearly normal while delivery to the tissues actually improves.`,
        },
      ],
    },

    mechanism: {
      title: "The Bohr Effect: Unloading Where It Counts",
      quickFlow: [
        "Fever, acidosis, ↑CO₂, ↑2,3-BPG",
        "↓ Hemoglobin oxygen affinity",
        "Curve shifts right",
        "At tissue PO₂, less oxygen held",
        "More oxygen released to tissues",
        "Better tissue oxygenation",
      ],
      quickPts: [[140, 68], [150, 92], [140, 118], [140, 118], [140, 122], [140, 122]],
      graphic: {
        title: "Oxygen-hemoglobin dissociation",
        xLabel: "Oxygen tension (PO₂) →",
        yLabel: "O₂ saturation →",
        paths: [
          { d: "M50,193 C 95,185 115,95 150,62 C 205,40 285,36 350,35", label: "Normal", lx: 288, ly: 30, muted: true },
          { d: "M50,196 C 110,190 142,128 182,92 C 240,54 300,42 350,39", label: "Right shift", lx: 250, ly: 80, muted: false },
        ],
      },
      chain: [
        { label: "Hypermetabolic, acidotic state", detail: "Fever, a low pH, a high carbon dioxide, and a high 2,3-BPG all accumulate in the septic patient.", type: "normal", pt: [140, 68] },
        { label: "Lower oxygen affinity (Bohr effect)", detail: "These conditions stabilize the deoxygenated form of hemoglobin, lowering its affinity for oxygen.", type: "normal", pt: [150, 92] },
        { label: "Curve shifts right", detail: "Lower affinity moves the whole dissociation curve to the right.", type: "highlight", pt: [140, 118] },
        { label: "Less oxygen held at the tissue level", detail: "At the tissue oxygen tension, the right-shifted hemoglobin carries less oxygen than it would normally.", type: "highlight", pt: [140, 118] },
        { label: "More oxygen released", detail: "The oxygen hemoglobin lets go of is delivered to the tissues that need it.", type: "normal", pt: [140, 122] },
        { label: "Better tissue oxygenation", detail: "The warm, acidic, carbon-dioxide-rich tissues are exactly where unloading is greatest, so delivery improves where it counts.", type: "outcome", pt: [140, 122] },
      ],
      starlingText: `On the steep middle of the curve a right shift has a substantial effect: at the tissue
        oxygen tension the hemoglobin gives up noticeably more oxygen. On the flat top, where the lungs load
        oxygen, the same shift barely changes saturation. A febrile, acidotic patient therefore unloads more
        oxygen to the tissues while the arterial saturation still looks nearly normal.`,
      clinicalPearl: `Carbon monoxide does the opposite and is dangerous: it shifts the curve left and lowers
        oxygen content, so hemoglobin holds oxygen too tightly and releases little to the tissues, while a
        standard pulse oximeter can still read falsely normal. Stored 2,3-BPG also falls in banked blood, which
        left-shifts transfused cells until it regenerates.`,
      source: `StatPearls, Physiology, Oxyhemoglobin Dissociation Curve`,
    },
  },

  // ════════════════════════════════════════════════════════════
  //  SINGLE-CONCEPT CASES (one NBME-style question each)
  //  Each carries its own vignette; the closing section is a
  //  concise key-takeaways summary (no graph).
  // ════════════════════════════════════════════════════════════

  // ── CARDIOLOGY 1: Baroreceptor reflex ─────────────────────
  {
    id: "cardio-baroreceptor",
    active: true,
    title: "Lightheaded on Standing",
    system: "Cardiovascular",
    topic: "Baroreceptor Reflex",

    wardMoment: {
      rotation: "Internal Medicine or Neurology",
      scenario: `Morning rounds. The team is seeing a 19-year-old patient whose vision grays out for a few
        seconds each time they stand up. Lying down, the blood pressure and pulse are normal. A minute after
        standing, the pressure has dropped a little and the pulse has climbed. The attending asks you what the
        body is doing in those first seconds to bring the pressure back up.`,
      why: `The baroreceptor reflex is the body's fastest blood pressure control, working within a heartbeat or
        two, and you will reason through it any time a patient feels faint on standing. It is worth being
        comfortable with, because the logic carries you further than memorizing the steps.`,
      modelAnswer: `Standing lets blood pool in the legs, and venous return and blood pressure dip for a moment.
        The carotid sinus and aortic arch baroreceptors are stretch sensors that fire less when the pressure
        falls. Those signals travel by the glossopharyngeal and vagus nerves to the nucleus tractus solitarius
        in the medulla, which reads the reduced firing as a signal to act. Sympathetic outflow rises and
        parasympathetic (vagal) tone falls, so the heart rate and contractility increase and the arterioles
        constrict. Cardiac output and systemic vascular resistance both climb, and the blood pressure is
        restored within seconds. A small, brief rise in pulse on standing, often ten to twenty beats per
        minute, is this reflex working normally.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what do the baroreceptors do?`,
          hint: `Think about what they sense and where they sit.`,
          rubric: [
            { concept: "They sense pressure (stretch) in the arteries", keywords: ["stretch", "pressure", "sensor", "detect", "sense", "receptor"] },
            { concept: "Located in the carotid sinus and aortic arch", keywords: ["carotid", "aortic arch", "aorta", "carotid sinus"] },
            { concept: "They signal the brainstem to adjust autonomic tone", keywords: ["brainstem", "autonomic", "sympathetic", "parasympathetic", "vagal", "reflex"] },
          ],
        },
        {
          id: "reason",
          question: `Now walk me through how the reflex brings the blood pressure back up after this patient stands.`,
          hint: `Trace the falling pressure, the receptors, and what changes in the heart and vessels.`,
          rubric: [
            { concept: "Standing lowers venous return and pressure", keywords: ["standing", "venous return", "pool", "pools", "pooling", "pressure falls", "pressure drops", "blood pressure"] },
            { concept: "Baroreceptors fire less", keywords: ["fire less", "less firing", "reduced firing", "fewer", "decrease firing", "less stretch"] },
            { concept: "Sympathetic up, parasympathetic down", keywords: ["sympathetic", "parasympathetic", "vagal", "less vagal", "autonomic"] },
            { concept: "Heart rate rises and arterioles constrict", keywords: ["heart rate", "tachycardia", "vasoconstriction", "constrict", "contractility"] },
            { concept: "Cardiac output and resistance rise, restoring pressure", keywords: ["cardiac output", "resistance", "svr", "restore", "raises pressure", "back up", "restored"] },
          ],
        },
      ],
    },

    vignette: `A 19-year-old patient comes to the physician because of recurrent lightheadedness for 2 weeks.
      The episodes last several seconds and occur immediately on standing. There is no chest pain,
      palpitations, or loss of consciousness. While lying down, blood pressure is 118/74 mmHg and pulse is
      70/min. One minute after standing, blood pressure is 102/66 mmHg and pulse is 92/min.`,

    ms1: {
      intro: "Work through the reflex one step at a time.",
      questions: [
        {
          id: "1A",
          stem: "The carotid baroreceptors sense the drop in pressure on standing. Which of the following is the most likely mechanism restoring this patient's blood pressure?",
          choices: [
            "Increased heart rate from greater sympathetic outflow and arteriolar constriction.",
            "Increased heart rate from greater parasympathetic outflow and arteriolar dilation.",
            "Decreased heart rate from greater parasympathetic outflow and arteriolar constriction.",
            "Decreased heart rate from reduced sympathetic outflow and arteriolar dilation.",
          ],
          correct: 0,
          feedback: `When blood pressure falls on standing, the carotid sinus baroreceptors fire less, and that reduced firing reaches the brainstem and releases its restraint on the sympathetic nervous system. Sympathetic outflow rises while parasympathetic (vagal) outflow drops, so the heart rate and contractility climb and the arterioles constrict. Together that raises cardiac output and systemic vascular resistance and brings the blood pressure back up. This is the same reflex that fails in orthostatic hypotension.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: how the same reflex works in the opposite direction when blood pressure suddenly rises, and why the heart rate then slows.` },
        { id: "1C", placeholder: true, topic: `Coming next: why this reflex can fall short in older adults or with certain medications, producing orthostatic hypotension.` },
      ],
    },

    mechanism: {
      title: "The Baroreceptor Reflex on Standing",
      quickFlow: [
        "Stand up → blood pools in the legs",
        "↓ Venous return → ↓ blood pressure",
        "Baroreceptors fire less",
        "↑ Sympathetic, ↓ parasympathetic",
        "↑ Heart rate + vasoconstriction",
        "Blood pressure restored",
      ],
      chain: [
        { label: "Standing shifts blood to the legs", detail: "Gravity pools roughly half a liter of blood in the legs and abdomen on standing. Venous return falls, so the heart fills less and the blood pressure dips for a moment." },
        { label: "Baroreceptors sense the dip", detail: "Stretch sensors in the carotid sinus and aortic arch fire in proportion to pressure. When the pressure falls they fire less, which the brainstem reads as a signal to act." },
        { label: "Autonomic balance shifts", detail: "Less baroreceptor firing releases the brake on the sympathetic nervous system and lowers parasympathetic (vagal) tone, so sympathetic outflow rises." },
        { label: "Pressure is restored", detail: "The heart rate and contractility rise and the arterioles constrict, so cardiac output and systemic vascular resistance both increase and the pressure comes back up within seconds." },
      ],
      summaryLabel: "What this means",
      starlingText: `Blood pressure equals cardiac output times systemic vascular resistance, and the
        baroreceptor reflex defends that product second by second. Carotid sinus and aortic arch stretch
        receptors feed the nucleus tractus solitarius in the medulla, which sets the balance of sympathetic and
        parasympathetic outflow. When standing drops the pressure, the receptors fire less, sympathetic tone
        rises, and both the heart rate and vessel tone climb to bring it back. A small, brief pulse rise on
        standing is this reflex working as it should.`,
      clinicalPearl: `When the reflex is too slow or too weak, the patient feels lightheaded on standing, and a
        sustained fall in pressure defines orthostatic hypotension. At the bedside it is a drop of at least 20
        mmHg systolic or 10 mmHg diastolic within three minutes of standing, measured after the patient has
        been lying down. Common contributors are low fluid volume, several blood pressure medicines, and
        autonomic neuropathy from conditions such as diabetes. Check the blood pressure and pulse lying and
        then standing, and watch whether the pulse rises: a flat heart rate alongside the falling pressure
        points toward an autonomic cause rather than simple volume loss.`,
      source: `StatPearls, Physiology, Baroreceptors`,
    },
  },

  // ── CARDIOLOGY 2: Coronary perfusion in diastole ──────────
  {
    id: "cardio-coronary-diastole",
    active: true,
    title: "Chest Pressure on the Stairs",
    system: "Cardiovascular",
    topic: "Coronary Perfusion",

    wardMoment: {
      rotation: "Internal Medicine or Cardiology",
      scenario: `On rounds you meet a 61-year-old patient with months of chest pressure that comes on climbing
        stairs and eases with rest. During a treadmill test the pressure returns as the heart rate reaches
        140 beats per minute. The attending asks what happens to the blood supply of the heart muscle itself
        as the heart speeds up.`,
      why: `Coronary blood flow quietly explains a great deal of cardiology, from stable angina to the reason
        we slow the heart rate in ischemia. You learned the cardiac cycle in first-year physiology, and this is
        one of its most useful clinical applications, so it helps to have the reasoning ready.`,
      modelAnswer: `The left ventricle is perfused mainly during diastole, because in systole the contracting
        muscle compresses its own coronary arteries and shuts off their flow. As the heart rate rises with
        exercise, diastole shortens far more than systole, and the window for coronary filling narrows just as
        the muscle demands more oxygen. A coronary artery narrowed by atherosclerosis is already near its flow
        limit and cannot make up the difference, so supply falls behind demand and the muscle becomes ischemic.
        The subendocardium of the left ventricle, its innermost layer, is exposed to the greatest compressive
        force and is affected first. Rest slows the heart, lengthens diastole, and the chest pressure resolves.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: when during the cardiac cycle does the left ventricle get most of its own blood supply?`,
          hint: `Think about what the muscle is doing to its own vessels when it contracts.`,
          rubric: [
            { concept: "Mainly during diastole (relaxation)", keywords: ["diastole", "relax", "relaxation", "resting phase", "when relaxed"] },
            { concept: "Because systole squeezes the coronary vessels shut", keywords: ["systole", "squeeze", "compress", "contract", "compresses", "squeezes"] },
            { concept: "Coronary flow is greatest when the muscle relaxes", keywords: ["coronary flow", "perfusion", "filling", "blood flow", "greatest"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why a faster heart rate can reduce the heart muscle's oxygen supply during exercise.`,
          hint: `Think about what happens to diastole as the rate climbs.`,
          rubric: [
            { concept: "Heart rate rises with exercise", keywords: ["heart rate", "faster", "tachycardia", "speeds up", "rises"] },
            { concept: "Diastole shortens more than systole", keywords: ["diastole shortens", "diastole", "shorten", "less time", "filling time"] },
            { concept: "Less time for coronary filling", keywords: ["coronary", "perfusion", "filling", "supply falls", "less flow"] },
            { concept: "Demand rises at the same time", keywords: ["demand", "oxygen demand", "working harder", "needs more"] },
            { concept: "A fixed narrowing cannot compensate (angina)", keywords: ["fixed", "narrowing", "stenosis", "atherosclerosis", "blockage", "ischemia", "angina"] },
          ],
        },
      ],
    },

    vignette: `A 61-year-old patient comes to the physician because of substernal chest pressure for 3 months.
      The pressure occurs with exertion, such as climbing two flights of stairs, and resolves with rest within
      several minutes. The patient has high blood pressure and high cholesterol. A resting electrocardiogram
      shows no abnormalities. During exercise stress testing, the chest pressure recurs as the heart rate
      reaches 140/min.`,

    ms1: {
      intro: "Work through the coronary physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "The left ventricular muscle is perfused mainly during diastole, when it is relaxed. Which of the following best explains the decrease in myocardial oxygen supply during exercise?",
          choices: [
            "Increased coronary blood flow because systole lengthens and forces more blood through.",
            "Increased coronary blood flow because diastole lengthens and filling time rises.",
            "Decreased coronary blood flow because diastole shortens and filling time falls.",
            "Decreased coronary blood flow because systole shortens and the arteries collapse.",
          ],
          correct: 2,
          feedback: `As the heart rate rises, diastole shortens far more than systole does. Because the left ventricular muscle is perfused mainly during diastole, that shorter window reduces coronary blood flow just as the working muscle needs more oxygen. A fixed narrowing from coronary artery disease cannot make up the difference, so demand outstrips supply and angina results.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: how beta-blockers and nitroglycerin relieve angina by acting on the supply and demand sides of this balance.` },
        { id: "1C", placeholder: true, topic: `Coming next: why a low diastolic blood pressure can provoke ischemia even without a tight coronary narrowing.` },
      ],
    },

    mechanism: {
      title: "Why a Fast Heart Rate Can Starve the Heart",
      quickFlow: [
        "Heart rate rises with exercise",
        "Diastole shortens more than systole",
        "Less time for coronary filling",
        "↓ Oxygen supply to the muscle",
        "Fixed narrowing can't keep up",
        "Demand outstrips supply → angina",
      ],
      chain: [
        { label: "The left ventricle is perfused in diastole", detail: "During systole the contracting muscle squeezes its own coronary arteries shut, so the left ventricle receives most of its blood flow while it relaxes in diastole." },
        { label: "Exercise speeds the heart", detail: "On exertion the heart rate climbs, and as it rises diastole shortens far more than systole. The window for coronary filling gets shorter just as the muscle works harder." },
        { label: "Supply cannot rise to meet demand", detail: "A coronary artery narrowed by atherosclerosis is already near its flow limit. With less filling time and a fixed narrowing, supply cannot keep pace with the rising oxygen demand." },
        { label: "Demand outstrips supply", detail: "When demand exceeds what the narrowed artery can deliver, the muscle becomes ischemic and the patient feels chest pressure. Rest slows the heart, lengthens diastole, and the pressure resolves." },
      ],
      summaryLabel: "What this means",
      starlingText: `The heart feeds itself mainly during its resting phase, so anything that shortens diastole,
        such as a fast heart rate, cuts into coronary supply. The driving pressure for that flow is the
        coronary perfusion pressure, the aortic diastolic pressure minus the left ventricular end-diastolic
        pressure (LVEDP), which is why both a fast rate and a high filling pressure work against the left
        ventricle. Slowing the heart rate with a beta-blocker (a drug that blunts sympathetic drive) lengthens
        diastole and gives the coronary arteries more time to fill.`,
      clinicalPearl: `A very fast heart rate or a low diastolic blood pressure can provoke ischemia even without
        a tight blockage, because both lower the coronary perfusion pressure that drives diastolic filling. The
        subendocardium of the left ventricle is the most vulnerable, since it sits farthest from the epicardial
        arteries and bears the greatest compressive force during systole. When you treat stable angina by
        lowering the heart rate, you are buying back diastolic filling time for the coronary arteries.`,
      source: `StatPearls, Physiology, Coronary Circulation`,
    },
  },

  // ── CARDIOLOGY 3: Potassium and resting membrane potential ─
  {
    id: "cardio-hyperkalemia",
    active: true,
    title: "Weakness After Missed Dialysis",
    system: "Cardiovascular",
    topic: "Potassium and Membrane Potential",

    wardMoment: {
      rotation: "Internal Medicine, Nephrology, or Emergency Medicine",
      scenario: `A 55-year-old patient with end-stage kidney disease who missed two dialysis sessions is on the
        monitor with tall, peaked T waves and a potassium of 7.0. Before you reach for treatment, the attending
        asks what the high potassium is doing to the heart cells at the level of the membrane.`,
      why: `Potassium and the resting membrane potential is a piece of physiology you can carry straight to the
        bedside, because it explains the electrocardiogram (ECG) changes you act on in hyperkalemia. The
        reasoning is shorter than it looks once you start from the potassium gradient.`,
      modelAnswer: `At rest the cardiac cell membrane is most permeable to potassium, and potassium leaks
        outward down its concentration gradient. That outward flow leaves the inside of the cell negative, so
        the resting membrane potential sits close to the potassium equilibrium potential set by the gradient.
        Raising potassium outside the cell shrinks that gradient. Less potassium leaves, and the resting
        potential drifts less negative, which means the cell sits partly depolarized rather than at its usual
        resting level. Holding the membrane depolarized inactivates fast sodium channels and lengthens the time
        before they can reopen, and conduction slows. On the electrocardiogram (ECG) this appears first as
        tall, peaked T waves, then as loss of the P wave and widening of the QRS complex as potassium climbs.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what mainly sets the resting membrane potential of a cardiac cell?`,
          hint: `Think about which ion leaks across the membrane at rest.`,
          rubric: [
            { concept: "Potassium", keywords: ["potassium", "k+", "k "] },
            { concept: "The potassium concentration gradient across the membrane", keywords: ["gradient", "concentration", "more inside", "high inside"] },
            { concept: "Potassium leaking out keeps the inside negative", keywords: ["leak", "leaks out", "leaves", "outward", "negative", "resting"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain what raising the potassium outside the cell does to the resting membrane potential, and why that matters.`,
          hint: `Think about the gradient first, then what a less negative resting potential does to sodium channels.`,
          rubric: [
            { concept: "The potassium gradient shrinks", keywords: ["gradient", "smaller", "shrink", "less gradient", "reduced gradient"] },
            { concept: "Less potassium leaves the cell", keywords: ["less potassium", "less leaves", "less leak", "less outward"] },
            { concept: "Resting potential becomes less negative (depolarized)", keywords: ["less negative", "depolarize", "depolarized", "drifts", "toward zero", "partly depolarized"] },
            { concept: "Sodium channels inactivate", keywords: ["sodium", "na channel", "inactivate", "inactivation", "channels close"] },
            { concept: "Conduction slows, raising arrhythmia risk", keywords: ["conduction", "slows", "slow", "arrhythmia", "peaked t", "widen"] },
          ],
        },
      ],
    },

    vignette: `A 55-year-old patient with end-stage kidney disease who missed two hemodialysis sessions comes to
      the emergency department because of generalized muscle weakness. Pulse is 58/min and irregular. Serum
      studies show a potassium concentration of 7.0 mEq/L (elevated). An electrocardiogram shows tall, peaked
      T waves.`,

    ms1: {
      intro: "Work through the membrane physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "The resting membrane potential of cardiac cells is set mainly by the potassium gradient across the membrane. Which of the following best describes the effect of the increased extracellular potassium on the resting membrane potential?",
          choices: [
            "More negative (hyperpolarized), because potassium leaves the cell more rapidly.",
            "More negative (hyperpolarized), because the transmembrane potassium gradient rises.",
            "Less negative (depolarized), because sodium enters the cell faster at rest.",
            "Less negative (depolarized), because the transmembrane potassium gradient falls.",
          ],
          correct: 3,
          feedback: `Raising potassium outside the cell shrinks the chemical gradient that drives potassium out at rest. With less potassium leaving, the resting membrane potential drifts less negative, and the cell sits partly depolarized. That sustained depolarization inactivates fast sodium channels and lengthens their recovery, which slows conduction. On the electrocardiogram (ECG) this shows up first as tall, peaked T waves and, if potassium keeps climbing, as loss of the P wave and a widening QRS complex that can progress to a sine-wave pattern.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: why intravenous calcium is given first in hyperkalemia, and what it does to the cell membrane without lowering the potassium.` },
        { id: "1C", placeholder: true, topic: `Coming next: how insulin with glucose, and other measures, actually lower the potassium, and how quickly each one works.` },
      ],
    },

    mechanism: {
      title: "How High Potassium Changes the Heart Cell",
      quickFlow: [
        "Missed dialysis → potassium builds up",
        "Smaller potassium gradient",
        "Less potassium leaves the cell",
        "Resting potential less negative",
        "Sodium channels inactivate",
        "Conduction slows → peaked T waves",
      ],
      chain: [
        { label: "Potassium sets the resting potential", detail: "At rest, cardiac cells leak potassium outward down its concentration gradient, and that outward flow holds the inside of the cell negative. The size of the gradient sets how negative the resting potential is." },
        { label: "High outside potassium shrinks the gradient", detail: "When potassium accumulates outside the cell, the gradient driving potassium out gets smaller, so less potassium leaves the cell at rest." },
        { label: "The cell partly depolarizes", detail: "With less potassium leaving, the resting potential drifts less negative. The cell sits partly depolarized rather than at its usual resting level." },
        { label: "Conduction slows", detail: "Sustained depolarization inactivates fast sodium channels, so the cells depolarize and conduct more slowly. On the electrocardiogram this shows up first as peaked T waves and, as potassium climbs, as widening of the complexes." },
      ],
      summaryLabel: "What this means",
      starlingText: `The resting membrane potential tracks the potassium gradient. Raise potassium outside the
        cell and the resting potential climbs toward zero. That sounds like it should make cells fire more
        easily, but a membrane held depolarized inactivates the fast sodium channels the cell needs to fire and
        conduct normally. As the potassium rises the electrocardiogram (ECG) changes in a recognizable order:
        peaked T waves first, then loss of the P wave and a widening QRS complex, and finally a sine-wave
        pattern that signals impending cardiac arrest.`,
      clinicalPearl: `Intravenous calcium does not lower the potassium. It raises the threshold potential and
        restores the gap between the resting and threshold potentials, which stabilizes the myocyte membrane
        against the depolarizing effect of the high potassium. That is why it is given first when the
        electrocardiogram (ECG) shows hyperkalemic changes, while insulin with glucose and other measures shift
        or remove the potassium over the following minutes to hours. The electrocardiogram is your fastest read
        on how much the high potassium is affecting the heart, so treat the tracing, not only the number.`,
      source: `StatPearls, Hyperkalemia`,
    },
  },

  // ── HEMATOLOGY 1: Iron-deficiency anemia ──────────────────
  {
    id: "heme-iron-deficiency",
    active: true,
    title: "Fatigue and Heavy Periods",
    system: "Hematology",
    topic: "Iron-Deficiency Anemia",

    wardMoment: {
      rotation: "Internal Medicine or Family Medicine",
      scenario: `A 34-year-old patient comes to clinic tired, with a year of heavy menstrual bleeding. The blood
        count shows a low hemoglobin, and the smear shows small, pale red cells. The attending asks why running
        low on iron makes the red cells come out small and pale.`,
      why: `Iron-deficiency anemia is among the most common diagnoses in clinic. Understanding why the red
        cells come out small and pale also explains the laboratory indices and the smear. The reasoning is
        worth working through once.`,
      modelAnswer: `A red cell precursor in the marrow keeps dividing until it reaches a target hemoglobin
        concentration, then stops and matures. Hemoglobin content, not cell size, is the signal that ends
        division. When iron is scarce, hemoglobin accumulates slowly and that target is reached late. The
        precursor then divides one or more extra times, and the finished cell is smaller than normal. That is
        the microcytosis, reported as a low mean corpuscular volume. The same cells carry less hemoglobin and
        appear pale, which is the hypochromia. Small and pale, microcytic and hypochromic, is the
        characteristic picture of iron-deficiency anemia.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what is iron needed for in a red blood cell?`,
          hint: `Think about the molecule that carries oxygen.`,
          rubric: [
            { concept: "Building hemoglobin", keywords: ["hemoglobin", "haemoglobin", "hgb", "hb"] },
            { concept: "Iron sits in heme and binds oxygen", keywords: ["heme", "oxygen", "binds oxygen", "carry oxygen", "oxygen carrying"] },
            { concept: "Without iron, less hemoglobin is made", keywords: ["less hemoglobin", "can't make", "cannot make", "reduced hemoglobin", "synthesis"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why too little iron makes the red cells both small and pale.`,
          hint: `Think about what tells a developing red cell to stop dividing.`,
          rubric: [
            { concept: "Hemoglobin is made slowly without iron", keywords: ["slow", "slowly", "less hemoglobin", "low hemoglobin", "hemoglobin production"] },
            { concept: "Precursors divide until a hemoglobin target is reached", keywords: ["divide", "division", "target", "stop dividing", "signal to stop", "threshold"] },
            { concept: "Extra divisions make the cells small (microcytic)", keywords: ["extra division", "more division", "smaller", "small", "microcytic", "microcytosis", "low mcv"] },
            { concept: "Less hemoglobin per cell makes them pale (hypochromic)", keywords: ["pale", "hypochromic", "less hemoglobin per cell", "low hemoglobin content"] },
          ],
        },
      ],
    },

    vignette: `A 34-year-old patient comes to the physician because of fatigue for 3 months and a 1-year history
      of heavy menstrual bleeding. Examination shows pale conjunctivae. Laboratory studies show a hemoglobin
      concentration of 9.1 g/dL (low) and a mean corpuscular volume of 71 fL (low); the peripheral blood smear
      shows small, pale red blood cells.`,

    ms1: {
      intro: "Work through the red cell physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "Iron is a required building block for hemoglobin. Which of the following best explains the small, pale appearance of this patient's red blood cells?",
          choices: [
            "Hemoglobin production falls. Developing cells divide extra times and stay small.",
            "Hemoglobin production falls. Cells retain their nucleus and appear large.",
            "Hemoglobin production rises. Cells fill early and appear small and dark.",
            "Hemoglobin production rises. Iron accumulates within the enlarged cells.",
          ],
          correct: 0,
          feedback: `Developing red cells stop dividing once they reach a target hemoglobin concentration. When iron is limited, hemoglobin accumulates slowly, and the precursors undergo one or more extra divisions before that target is reached. The result is cells that are both smaller than normal (microcytic) and low in hemoglobin (hypochromic). This is the characteristic picture of iron-deficiency anemia, and it explains the low mean corpuscular volume.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: how to read iron studies (ferritin, serum iron, and transferrin saturation) to confirm iron deficiency.` },
        { id: "1C", placeholder: true, topic: `Coming next: why finding the source of blood loss matters as much as replacing the iron in an adult.` },
      ],
    },

    mechanism: {
      title: "Why Iron Deficiency Makes Small, Pale Cells",
      quickFlow: [
        "Heavy menstrual loss → iron runs low",
        "Less iron → hemoglobin made slowly",
        "Precursors keep dividing",
        "Extra divisions → smaller cells",
        "Less hemoglobin per cell → pale",
        "Microcytic, hypochromic anemia",
      ],
      chain: [
        { label: "Precursors divide toward a hemoglobin target", detail: "A developing red cell keeps dividing until it reaches a set hemoglobin concentration, then it stops and matures. Hemoglobin level, not size, is the signal to stop." },
        { label: "Low iron slows hemoglobin production", detail: "Iron sits at the center of each heme group and is required to build hemoglobin. When iron is scarce, hemoglobin accumulates slowly inside the precursor." },
        { label: "The cell divides extra times", detail: "Because the hemoglobin target is reached late, the precursor goes through additional divisions before it stops, ending up smaller than normal. This is the microcytosis seen as a low mean corpuscular volume." },
        { label: "Each cell is short on hemoglobin", detail: "The finished cells also carry less hemoglobin and look pale on the smear. Small and pale, microcytic and hypochromic, is the characteristic picture of iron-deficiency anemia." },
      ],
      summaryLabel: "What this means",
      starlingText: `Red cell size is set by how quickly the precursor reaches its target hemoglobin
        concentration. When iron is limited, hemoglobin accumulates slowly, the precursor divides extra times,
        and the cell is released small and pale. The same principle in reverse explains the next case: when the
        rate-limiting step is DNA synthesis rather than hemoglobin, the cell is released large.`,
      clinicalPearl: `In an adult, iron deficiency is a clue, not a final diagnosis, because it points to where
        the iron is being lost, most often menstrual or gastrointestinal bleeding. Confirm it with iron studies
        rather than the blood count alone: ferritin is the most useful single test, and a value below about 45
        nanograms per milliliter supports the diagnosis. Because ferritin is an acute-phase reactant, a normal
        value does not exclude iron deficiency in an acutely ill or inflamed patient.`,
      source: `StatPearls, Iron Deficiency Anemia`,
    },
  },

  // ── HEMATOLOGY 2: Megaloblastic (B12) anemia ──────────────
  {
    id: "heme-b12-macrocytic",
    active: true,
    title: "Fatigue and Tingling Feet",
    system: "Hematology",
    topic: "Megaloblastic Anemia",

    wardMoment: {
      rotation: "Internal Medicine or Neurology",
      scenario: `A 70-year-old patient has months of fatigue and tingling in both feet. The blood count shows a
        low hemoglobin with large red cells, and the smear shows neutrophils with extra nuclear segments. The
        attending asks why the red cells are coming out larger than normal here.`,
      why: `Macrocytic anemia from vitamin B12 deficiency pairs a hematologic finding with a neurologic one,
        which is why it is worth recognizing early. The increase in cell size follows directly from which step
        in cell division becomes rate-limiting.`,
      modelAnswer: `A dividing cell must copy its deoxyribonucleic acid (DNA) before it splits, and vitamin
        B12 and folate are required to make that DNA. Red cell precursors divide many times and are among the
        first cells to reveal a shortage. When vitamin B12 is low, DNA synthesis slows while the cytoplasm
        continues to build ribonucleic acid (RNA) and protein on schedule. The nucleus cannot keep pace with
        the maturing cytoplasm, a state called nuclear-cytoplasmic asynchrony. Because division waits on DNA,
        the precursor divides fewer times and enlarges between divisions, and it is released as an oversized
        red cell, a macrocyte, reflected in a high mean corpuscular volume. The same defect in granulocyte
        precursors produces neutrophils with extra nuclear lobes, the hypersegmented neutrophils of
        megaloblastic anemia.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what is vitamin B12 needed for in a dividing cell?`,
          hint: `Think about what a cell must copy before it can divide.`,
          rubric: [
            { concept: "DNA synthesis / replication", keywords: ["dna", "dna synthesis", "replication", "copy dna", "make dna"] },
            { concept: "Needed for cells to divide", keywords: ["divide", "division", "cell division", "mitosis", "proliferate"] },
            { concept: "Folate plays the same role", keywords: ["folate", "folic acid", "b9"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why a shortage of vitamin B12 makes red cells come out larger than normal.`,
          hint: `Think about what happens to the nucleus versus the cytoplasm when DNA is the slow step.`,
          rubric: [
            { concept: "DNA synthesis slows", keywords: ["dna", "slows", "slow", "lags", "behind", "delayed"] },
            { concept: "Cytoplasm keeps growing", keywords: ["cytoplasm", "rna", "protein", "keeps growing", "grows"] },
            { concept: "The nucleus cannot keep pace", keywords: ["nucleus", "immature nucleus", "out of sync", "asynchrony", "mismatch"] },
            { concept: "The cell enlarges before it can divide (macrocyte)", keywords: ["enlarge", "large", "larger", "macrocyte", "macrocytic", "big cell", "high mcv"] },
            { concept: "Hypersegmented neutrophils appear too", keywords: ["hypersegmented", "neutrophil", "extra lobes", "segments", "megaloblastic"] },
          ],
        },
      ],
    },

    vignette: `A 70-year-old patient comes to the physician because of fatigue and tingling of both feet for
      4 months. Laboratory studies show a hemoglobin concentration of 10.0 g/dL (low) and a mean corpuscular
      volume of 112 fL (high); the peripheral blood smear shows hypersegmented neutrophils (extra nuclear
      lobes).`,

    ms1: {
      intro: "Work through the red cell physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "Vitamin B12 (cobalamin) is required for DNA synthesis in dividing cells. Which of the following imbalances best explains the increased size of this patient's red blood cells?",
          choices: [
            "DNA synthesis outpaces cytoplasm growth. The nucleus matures before each division.",
            "DNA synthesis outpaces hemoglobin formation. The cells are released early.",
            "DNA synthesis lags behind cytoplasm growth. The cells enlarge before dividing.",
            "DNA synthesis lags behind iron uptake. The cells store extra hemoglobin.",
          ],
          correct: 2,
          feedback: `Vitamin B12 deficiency slows DNA synthesis, and nuclear maturation stalls while the cytoplasm continues to accumulate RNA and protein. This nuclear-cytoplasmic asynchrony means the precursor divides fewer times and enlarges, and it is released as an oversized red cell (macrocyte) with a high mean corpuscular volume. The same defect in granulocyte precursors produces hypersegmented neutrophils, a hallmark of megaloblastic anemia.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: why treating with folate alone can correct the blood count while nerve damage from vitamin B12 deficiency quietly continues.` },
        { id: "1C", placeholder: true, topic: `Coming next: how pernicious anemia and other absorption problems lead to vitamin B12 deficiency.` },
      ],
    },

    mechanism: {
      title: "Why B12 Deficiency Makes Large Cells",
      quickFlow: [
        "Low vitamin B12",
        "DNA synthesis slows",
        "Nucleus matures slowly",
        "Cytoplasm keeps growing",
        "Cell enlarges before dividing",
        "Large cells + hypersegmented neutrophils",
      ],
      chain: [
        { label: "Vitamin B12 supports DNA synthesis", detail: "Dividing cells need vitamin B12 and folate to make the building blocks for new DNA. Red cell precursors divide many times and are among the first to show a shortage." },
        { label: "DNA falls behind the cytoplasm", detail: "When B12 is low, DNA replication slows, but the cytoplasm keeps building RNA and protein on schedule. The nucleus cannot keep pace with the growing cell." },
        { label: "Cells grow before they divide", detail: "Because division waits on DNA, the precursor enlarges between divisions and is released as an oversized red cell, a macrocyte. This is the high mean corpuscular volume." },
        { label: "Other dividing cells show it too", detail: "The same DNA-cytoplasm mismatch in white cell precursors produces neutrophils with extra nuclear lobes, the hypersegmented neutrophils that are a hallmark of megaloblastic anemia." },
      ],
      summaryLabel: "What this means",
      starlingText: `Iron deficiency makes small cells by limiting hemoglobin; vitamin B12 or folate deficiency
        does the opposite by limiting DNA synthesis. When DNA is the rate-limiting step, the cell keeps growing
        while it waits to divide and is released large. Identifying which step is limited, hemoglobin or DNA,
        predicts which way the cell size moves.`,
      clinicalPearl: `Vitamin B12 deficiency can also injure the spinal cord, a syndrome called subacute
        combined degeneration that explains this patient's tingling feet. Folate alone can correct the blood
        count while this neurologic injury continues and may even worsen. Confirm and replace vitamin B12
        itself. When the cause is unclear, methylmalonic acid and homocysteine are both elevated in vitamin B12
        deficiency, whereas folate deficiency raises homocysteine but leaves methylmalonic acid normal.`,
      source: `StatPearls, Vitamin B12 Deficiency`,
    },
  },

  // ── HEMATOLOGY 3: Erythropoietin in kidney disease ────────
  {
    id: "heme-epo-ckd",
    active: true,
    title: "Anemia in Kidney Disease",
    system: "Hematology",
    topic: "Erythropoietin",

    wardMoment: {
      rotation: "Internal Medicine or Nephrology",
      scenario: `A 60-year-old patient with diabetes and chronic kidney disease has slowly worsening fatigue.
        The blood count shows a normal-sized red cell anemia with a low reticulocyte count, and iron, vitamin
        B12, and folate are all normal. The attending asks why this patient is anemic if the building blocks
        are all there.`,
      why: `Anemia is common in chronic kidney disease, and its cause is easy to overlook. Once you know where
        erythropoietin is produced and what triggers its release, both the diagnosis and the treatment follow.`,
      modelAnswer: `Erythropoietin is the hormone that signals the bone marrow to make red cells, and most of it
        is produced by specialized interstitial cells in the kidney. These cells sense oxygen: when oxygen
        delivery falls, a sensor called hypoxia-inducible factor is stabilized and switches on erythropoietin
        production. As functioning kidney tissue is lost in chronic kidney disease, the kidney makes too little
        erythropoietin even when the body needs more red cells, and the marrow loses its main signal to produce
        them. The reticulocyte count stays low because the problem is underproduction, not destruction. Because
        iron, vitamin B12, and folate are adequate, the cells that are made are normal in size, which makes
        this a normocytic anemia of underproduction. Reduced erythropoietin is the main driver, with chronic
        inflammation and a shortened red cell lifespan contributing.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what does erythropoietin do, and where does it come from?`,
          hint: `Think about which organ senses oxygen and what it tells the marrow.`,
          rubric: [
            { concept: "It stimulates red blood cell production in the marrow", keywords: ["red cell", "red blood cell", "marrow", "bone marrow", "erythropoiesis", "make red cells", "stimulate"] },
            { concept: "It is made mainly by the kidney", keywords: ["kidney", "renal", "kidneys"] },
            { concept: "Released when oxygen delivery is low", keywords: ["low oxygen", "hypoxia", "oxygen delivery", "senses oxygen", "oxygen level"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why chronic kidney disease causes anemia even when iron, vitamin B12, and folate are normal.`,
          hint: `Think about which step in red cell production the kidney is responsible for.`,
          rubric: [
            { concept: "Kidney damage lowers erythropoietin production", keywords: ["kidney", "damage", "less erythropoietin", "low erythropoietin", "epo falls", "less epo"] },
            { concept: "The marrow loses its main signal", keywords: ["marrow", "signal", "drive", "stimulus", "no signal", "loses"] },
            { concept: "Few red cells are made (low reticulocytes)", keywords: ["few red cells", "low reticulocyte", "reticulocyte", "underproduction", "production"] },
            { concept: "Building blocks are present, and cells are normal-sized", keywords: ["normocytic", "normal size", "iron normal", "b12 normal", "folate normal", "building blocks"] },
          ],
        },
      ],
    },

    vignette: `A 60-year-old patient with type 2 diabetes and chronic kidney disease comes to the physician
      because of fatigue that has worsened gradually over 1 year. Laboratory studies show a hemoglobin
      concentration of 9.5 g/dL (low), a normal mean corpuscular volume, and a low reticulocyte count. Serum
      iron, vitamin B12, and folate concentrations are within the normal range.`,

    ms1: {
      intro: "Work through the cause of the anemia step by step.",
      questions: [
        {
          id: "1A",
          stem: "The kidney is the main source of the hormone that signals the bone marrow to make red blood cells. Which of the following is the most likely cause of this patient's anemia?",
          choices: [
            "Erythropoietin falls. Red cells survive longer while the marrow makes very few.",
            "Erythropoietin falls. The marrow loses its main signal to make red cells.",
            "Erythropoietin rises. Iron is diverted away from developing red cells.",
            "Erythropoietin rises. The marrow makes fragile cells that break apart.",
          ],
          correct: 1,
          feedback: `Most erythropoietin is produced by specialized interstitial cells in the kidney, which release it through the hypoxia-inducible factor pathway when oxygen delivery falls. As kidney tissue is lost, erythropoietin production falls and the marrow loses its main signal to make red blood cells. The result is a normocytic anemia with a low reticulocyte count even though iron and vitamins are adequate, which is why erythropoiesis-stimulating agents treat the anemia of chronic kidney disease.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: how erythropoiesis-stimulating agents treat this anemia, and why iron stores still need to be adequate for them to work.` },
        { id: "1C", placeholder: true, topic: `Coming next: why the anemia of chronic kidney disease is normocytic rather than small-celled or large-celled.` },
      ],
    },

    mechanism: {
      title: "Why Kidney Disease Causes Anemia",
      quickFlow: [
        "Kidney senses oxygen delivery",
        "Normally makes erythropoietin",
        "Kidney disease → less made",
        "Marrow loses its main signal",
        "Few red cells made (low reticulocytes)",
        "Normocytic anemia",
      ],
      chain: [
        { label: "The kidney is the oxygen sensor", detail: "Specialized cells in the kidney sense how much oxygen the blood is delivering. When delivery falls, they release erythropoietin to tell the bone marrow to make more red cells." },
        { label: "Chronic kidney disease lowers erythropoietin", detail: "As kidney tissue is lost over time, the kidney produces less erythropoietin even when the body needs more red cells." },
        { label: "The marrow loses its drive", detail: "Without enough erythropoietin, the bone marrow makes few new red cells. The reticulocyte count stays low because production, not destruction, is the problem." },
        { label: "A normocytic anemia results", detail: "Because iron, vitamin B12, and folate are all adequate, the cells that are made are normal in size. The anemia comes from too few cells, not defective ones." },
      ],
      summaryLabel: "What this means",
      starlingText: `Most anemias come from a missing building block, a production problem, or increased loss.
        Here the building blocks are present and the marrow is capable, but the signal that drives red cell
        production is deficient. The kidney that normally releases erythropoietin in response to low oxygen no
        longer does, and few red cells are made.`,
      clinicalPearl: `This is why erythropoiesis-stimulating agents, laboratory-made erythropoietin, treat the
        anemia of chronic kidney disease. They work only when iron is available, and chronic kidney disease
        often causes a functional iron deficiency in which inflammation raises hepcidin and traps iron, which
        is why iron studies are checked and iron is repleted alongside. Serum erythropoietin itself is not
        measured, because the level does not change management.`,
      source: `StatPearls, Anemia of Chronic Kidney Disease`,
    },
  },

  // ── PULMONOLOGY 1: Surfactant and Laplace's Law ───────────
  {
    id: "pulm-surfactant",
    active: true,
    title: "The Premature Newborn",
    system: "Respiratory",
    topic: "Surfactant and Laplace's Law",

    wardMoment: {
      rotation: "Pediatrics or Obstetrics",
      scenario: `A baby born at 29 weeks is breathing fast and grunting within hours of birth, with low oxygen
        levels and hazy, low-volume lungs on the X-ray. The attending asks why this newborn's air sacs keep
        collapsing.`,
      why: `Surfactant and the Law of Laplace explain why a premature newborn struggles to keep the lungs open,
        and the same physics underlies a good deal of normal lung mechanics. It is a clean case of physics
        meeting physiology, and the reasoning is worth having ready for pediatrics and obstetrics rounds.`,
      modelAnswer: `Surfactant is a lipoprotein layer made by type II pneumocytes that lowers the surface
        tension pulling each alveolus closed, and it is produced late in gestation, so an infant born at 29
        weeks has very little. The Law of Laplace gives the collapsing pressure of a sphere as P = 2T/r, where
        T is surface tension and r is the radius, so for a fixed tension the pressure rises as the alveolus
        gets smaller. Surfactant lowers tension most in the smallest alveoli, which keeps them from emptying
        into larger neighbors. Without it the surface tension stays high, the smallest alveoli collapse, and
        their air shifts into larger ones, which is the hazy, low-volume picture on the radiograph. Reopening
        collapsed alveoli takes a large pressure, so every breath is effortful, and that is the distress.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what does pulmonary surfactant do?`,
          hint: `Think about the force that tries to pull an alveolus closed.`,
          rubric: [
            { concept: "Lowers surface tension in the alveoli", keywords: ["surface tension", "tension", "lowers", "reduces", "lower tension"] },
            { concept: "Keeps small alveoli from collapsing", keywords: ["collapse", "stay open", "keeps open", "prevent collapse", "stability"] },
            { concept: "Reduces the effort needed to inflate the lung", keywords: ["effort", "work of breathing", "compliance", "easier", "inflate"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why a premature newborn without enough surfactant tends to have collapsing air sacs.`,
          hint: `Use the Law of Laplace and think about which alveoli collapse first.`,
          rubric: [
            { concept: "Surfactant is made late in gestation", keywords: ["late", "gestation", "premature", "preterm", "not enough", "little surfactant", "immature"] },
            { concept: "Without it, surface tension stays high", keywords: ["surface tension", "high tension", "tension high", "stays high"] },
            { concept: "By Laplace, small alveoli feel more collapsing pressure", keywords: ["laplace", "radius", "small alveoli", "smaller", "pressure", "collapse pressure"] },
            { concept: "Small alveoli collapse and empty into larger ones", keywords: ["collapse", "empty", "into larger", "shut down", "atelectasis"] },
            { concept: "Reopening them takes high effort", keywords: ["reopen", "effort", "hard to open", "work", "high pressure", "stiff"] },
          ],
        },
      ],
    },

    vignette: `A newborn delivered at 29 weeks' gestation develops rapid breathing, grunting, and nasal flaring
      within hours of birth. Oxygen saturation is low. A chest radiograph shows diffuse, hazy lung fields with
      low lung volumes.`,

    ms1: {
      intro: "Work through the lung mechanics step by step.",
      questions: [
        {
          id: "1A",
          stem: "Pulmonary surfactant, which lowers the surface tension inside alveoli, is produced late in pregnancy. Which of the following best explains this newborn's tendency toward alveolar collapse?",
          choices: [
            "Surface tension rises. Small alveoli tend to collapse and are hard to reopen.",
            "Surface tension rises. The alveoli overexpand and trap air at end-expiration.",
            "Surface tension falls. The alveoli collapse and gas exchange drops.",
            "Surface tension falls. The alveoli stiffen and resist inflation.",
          ],
          correct: 0,
          feedback: `By the Law of Laplace, the collapsing pressure of a sphere is P = 2T/r, so for a fixed surface tension that pressure rises as the alveolus gets smaller. Surfactant, made by type II pneumocytes, lowers surface tension and does so most in the smallest alveoli, which keeps them from emptying into larger ones. Without enough surfactant the tension stays high, the small alveoli collapse, and each breath takes a large pressure to reopen them. That is the mechanism of neonatal respiratory distress syndrome (RDS).`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: how antenatal steroids and surfactant replacement work on the same piece of physiology.` },
        { id: "1C", placeholder: true, topic: `Coming next: why the smallest alveoli collapse first, worked through with the Law of Laplace.` },
      ],
    },

    mechanism: {
      title: "Surfactant, Laplace, and the Premature Lung",
      quickFlow: [
        "Born at 29 weeks → little surfactant",
        "Surface tension stays high",
        "Laplace: small alveoli collapse first",
        "Air empties into larger alveoli",
        "Collapsed alveoli are hard to reopen",
        "High effort to breathe → distress",
      ],
      chain: [
        { label: "Surfactant lowers surface tension", detail: "Surfactant is a lipoprotein layer made by type II pneumocytes that lowers the surface tension pulling each alveolus closed. It is produced late in gestation, so an infant born at 29 weeks has very little." },
        { label: "Laplace favors collapse of small alveoli", detail: "By the Law of Laplace, the pressure tending to collapse a sphere rises as its radius shrinks. Surfactant lowers tension most in the smallest alveoli, which keeps them from emptying into larger ones." },
        { label: "Without surfactant the small alveoli give way", detail: "When surface tension stays high, the smallest alveoli collapse and their air shifts into larger neighbors. Patches of lung shut down, which is the hazy, low-volume picture on the X-ray." },
        { label: "Each breath is hard work", detail: "Collapsed alveoli take a large pressure to reopen, so every breath is effortful. That is the grunting and fast breathing of neonatal respiratory distress syndrome." },
      ],
      summaryLabel: "What this means",
      starlingText: `Surface tension constantly pulls alveoli closed, and by the Law of Laplace (P = 2T/r) the
        smallest ones feel the most collapsing pressure for a given tension. Surfactant evens this out by
        lowering tension where alveoli are smallest, which holds the lung open at low volumes and stops small
        alveoli from emptying into large ones. Without it the physics wins: the smallest alveoli collapse, and
        the lung becomes stiff and hard to inflate.`,
      clinicalPearl: `When early delivery is expected, antenatal corticosteroids are given to the pregnant
        patient to speed the infant's surfactant production, and after birth surfactant can be instilled
        directly into the airway. Both act on the same piece of physiology. Maturity can be gauged before birth
        by the lecithin-to-sphingomyelin ratio in amniotic fluid, where a value of about 2 to 1 or higher
        signals that enough surfactant is being made. When that ratio is low and delivery cannot wait, give the
        steroids.`,
      source: `StatPearls, Physiology, Alveolar Tension`,
    },
  },

  // ── PULMONOLOGY 2: Ventilation-perfusion mismatch ─────────
  {
    id: "pulm-vq-mismatch",
    active: true,
    title: "Pneumonia and Low Oxygen",
    system: "Respiratory",
    topic: "Ventilation-Perfusion Mismatch",

    wardMoment: {
      rotation: "Internal Medicine or Critical Care",
      scenario: `A 72-year-old patient with three days of fever and a productive cough is breathing fast with an
        oxygen saturation of 86 percent on room air, and the X-ray shows the right lower lobe filled in. The
        attending asks why the oxygen level is so low.`,
      why: `Ventilation-perfusion (V/Q) matching is the central idea behind most causes of low arterial oxygen,
        and pneumonia is the everyday example you will see on the wards. It also explains why one patient's
        oxygen level climbs quickly on a nasal cannula while another's barely moves, which is worth being able
        to reason through at the bedside.`,
      modelAnswer: `Oxygen moves into the blood only where ventilated alveoli sit next to flowing capillaries,
        and the ventilation-perfusion (V/Q) ratio measures how well airflow and blood flow are matched in a
        region. In the consolidated lobe the alveoli are filled with inflammatory fluid, so air cannot reach
        them and ventilation falls toward zero while blood keeps flowing past. That blood leaves almost as
        deoxygenated as it arrived and then mixes with blood from healthy lung, pulling the arterial oxygen
        down. The lung limits the mismatch through hypoxic pulmonary vasoconstriction, tightening vessels in
        the poorly ventilated region to redirect blood toward better ventilated alveoli. When ventilation is
        merely reduced rather than absent, supplemental oxygen raises the alveolar oxygen in those units and
        the arterial oxygen improves. When a region is completely unventilated, a true shunt, the added oxygen
        never contacts that blood and the hypoxemia responds only partly.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what does the ventilation-perfusion ratio describe?`,
          hint: `Think about the two things that must meet for gas exchange.`,
          rubric: [
            { concept: "The match between airflow and blood flow in a lung region", keywords: ["ventilation", "perfusion", "airflow", "blood flow", "match", "ratio"] },
            { concept: "They must be matched for gas exchange", keywords: ["gas exchange", "matched", "oxygen", "exchange", "balance"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why filling alveoli with fluid, while blood keeps flowing past, lowers the arterial oxygen level.`,
          hint: `Trace what happens to ventilation, then to the blood that flows past.`,
          rubric: [
            { concept: "Ventilation drops while perfusion continues", keywords: ["ventilation drops", "no air", "fluid", "perfusion continues", "blood still flows", "blood flow continues"] },
            { concept: "The ventilation-perfusion ratio falls", keywords: ["ratio falls", "low v/q", "vq falls", "mismatch", "falls toward zero"] },
            { concept: "Blood passes without being oxygenated (shunt)", keywords: ["not oxygenated", "without oxygen", "shunt", "passes", "deoxygenated", "bypass"] },
            { concept: "It mixes into arterial blood and lowers oxygen", keywords: ["mix", "mixes", "arterial", "lowers oxygen", "drags down", "dilutes"] },
            { concept: "Only partly corrected by supplemental oxygen", keywords: ["partly", "oxygen", "not fully", "responds only", "supplemental"] },
          ],
        },
      ],
    },

    vignette: `A 72-year-old patient comes to the emergency department because of fever, productive cough, and
      shortness of breath for 3 days. Temperature is 38.9°C (102.0°F), respirations are 26/min, and oxygen
      saturation is 86% on room air (low). A chest radiograph shows filling-in (consolidation) of the right
      lower lobe.`,

    ms1: {
      intro: "Work through the gas exchange physiology step by step.",
      questions: [
        {
          id: "1A",
          stem: "In the affected lobe, the alveoli are filled with inflammatory fluid while blood continues to flow past them. Which of the following best explains this patient's low arterial oxygen level?",
          choices: [
            "The ventilation-perfusion ratio rises. Blood leaves that region overoxygenated.",
            "The ventilation-perfusion ratio rises. Dead space grows and oxygen falls.",
            "The ventilation-perfusion ratio falls. Blood passes without being oxygenated.",
            "The ventilation-perfusion ratio falls. Carbon dioxide alone is retained.",
          ],
          correct: 2,
          feedback: `Ventilation (airflow) and perfusion (blood flow) must be matched for gas exchange. When alveoli fill with fluid but blood still flows past, ventilation falls while perfusion continues, so the ventilation-perfusion (V/Q) ratio drops toward zero. That blood returns to the body still poorly oxygenated and lowers the arterial oxygen level. A useful distinction is that a low V/Q region still has some ventilation and responds to supplemental oxygen, while a region with no ventilation at all is a true shunt and responds only partly.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: why this low oxygen responds only partly to supplemental oxygen, the idea of shunt physiology.` },
        { id: "1C", placeholder: true, topic: `Coming next: how dead space differs from shunt, and what each one does to oxygen and carbon dioxide.` },
      ],
    },

    mechanism: {
      title: "Why Pneumonia Lowers the Oxygen Level",
      quickFlow: [
        "Pneumonia fills alveoli with fluid",
        "Air can't reach those alveoli",
        "Blood still flows past them",
        "Ventilation-perfusion ratio falls",
        "Blood returns poorly oxygenated",
        "Low arterial oxygen",
      ],
      chain: [
        { label: "Gas exchange needs matched air and blood", detail: "Oxygen moves into the blood only where ventilated alveoli sit next to flowing capillaries. The ventilation-perfusion ratio measures how well airflow and blood flow are matched in a region." },
        { label: "Pneumonia blocks the airflow side", detail: "In the consolidated lobe, alveoli are filled with inflammatory fluid, so air cannot reach them. Ventilation in that region drops toward zero while blood keeps flowing past." },
        { label: "Blood passes without being oxygenated", detail: "With perfusion continuing but ventilation gone, the ventilation-perfusion ratio falls. Blood leaves that region almost as deoxygenated as it arrived." },
        { label: "Mixed blood lowers arterial oxygen", detail: "This poorly oxygenated blood mixes with blood from healthy lung, dragging the arterial oxygen level down. Because the problem is mixed-in unoxygenated blood, extra oxygen helps only partly." },
      ],
      summaryLabel: "What this means",
      starlingText: `Low arterial oxygen usually comes down to a ventilation-perfusion (V/Q) mismatch. When
        alveoli are poorly ventilated but still perfused, as in pneumonia, blood slips past without fully
        picking up oxygen, and the wider the affected region the lower the arterial oxygen. Healthy lung cannot
        make up the difference, because hemoglobin in well ventilated units is already nearly saturated and
        sits on the flat upper part of the oxygen-hemoglobin dissociation curve, where extra alveolar oxygen
        adds very little oxygen content. The lung's own response, hypoxic pulmonary vasoconstriction, shifts
        blood away from the consolidated region toward better ventilated alveoli and limits how far the oxygen
        falls.`,
      clinicalPearl: `The practical question at the bedside is whether the affected region is a low V/Q unit or
        a true shunt. A low V/Q region keeps some airflow, so raising the inspired oxygen lifts its alveolar
        oxygen and the saturation climbs. A region with full perfusion and no ventilation is a shunt, and the
        supplemental oxygen never reaches that blood, which is why a consolidated pneumonia patient's oxygen may
        barely rise on a nasal cannula. That is also why we treat the lung itself, with antibiotics and
        sometimes positive pressure to reopen alveoli, rather than leaning on oxygen alone.`,
      source: `StatPearls, Physiology, Pulmonary Ventilation and Perfusion`,
    },
  },

  // ── PULMONOLOGY 3: Hypoventilation ────────────────────────
  {
    id: "pulm-hypoventilation",
    active: true,
    title: "Opioid Overdose",
    system: "Respiratory",
    topic: "Hypoventilation",

    wardMoment: {
      rotation: "Emergency Medicine or Critical Care",
      scenario: `A 28-year-old patient is brought in barely responsive after an opioid overdose, breathing only
        6 times a minute. The blood gas shows a high carbon dioxide and a low oxygen, but the chest X-ray is
        clear. The attending asks why the gases are off when the lungs look healthy.`,
      why: `Hypoventilation is the clean case where the lungs are healthy and the problem is the drive to
        breathe. You meet it in first-year physiology, and it returns often in critical care and on the wards,
        so it helps to have the reasoning ready. Recognizing that the lung itself is normal points straight to
        the fix.`,
      modelAnswer: `The respiratory centers in the brainstem set the rate and depth of breathing, which fixes
        the alveolar ventilation, the fresh air reaching the alveoli each minute. Opioids blunt those centers,
        and breathing becomes slow and shallow while the lung tissue itself stays normal. Carbon dioxide is
        cleared in proportion to ventilation, so as ventilation falls the partial pressure of carbon dioxide
        (PaCO2) climbs in the alveoli and the blood. The alveolar gas equation links the two gases: as alveolar
        carbon dioxide rises it takes up space that oxygen would occupy, and alveolar and arterial oxygen both
        fall. The rise in carbon dioxide also lowers the pH, giving an acute respiratory acidosis. Because the
        lung is healthy, oxygen still crosses normally and the alveolar-arterial (A-a) oxygen gradient stays
        normal, which points to hypoventilation rather than a lung problem.`,
      prompts: [
        {
          id: "concept",
          question: `First, in your own words: what is alveolar ventilation, and what controls how much we breathe?`,
          hint: `Think about the fresh air reaching the alveoli and where the signal to breathe comes from.`,
          rubric: [
            { concept: "The fresh air reaching the alveoli each minute", keywords: ["fresh air", "alveoli", "per minute", "air reaching", "ventilation"] },
            { concept: "Driven by the brainstem respiratory centers", keywords: ["brainstem", "respiratory center", "medulla", "drive", "controls breathing"] },
            { concept: "It sets how much carbon dioxide is cleared", keywords: ["carbon dioxide", "co2", "clears", "removes", "blows off"] },
          ],
        },
        {
          id: "reason",
          question: `Now explain why slow, shallow breathing raises the carbon dioxide and lowers the oxygen even though the lungs themselves are healthy.`,
          hint: `Start with the carbon dioxide, then think about what it does to alveolar oxygen.`,
          rubric: [
            { concept: "Opioids lower the drive, so ventilation falls", keywords: ["opioid", "drive", "brainstem", "ventilation falls", "slow breathing", "hypoventilation"] },
            { concept: "Carbon dioxide builds up", keywords: ["carbon dioxide", "co2", "builds up", "accumulates", "retained", "rises"] },
            { concept: "Rising alveolar CO2 displaces oxygen", keywords: ["displace", "crowds out", "takes the place", "takes up space", "pushes out", "alveolar"] },
            { concept: "Both alveolar and arterial oxygen fall", keywords: ["oxygen falls", "low oxygen", "po2 falls", "arterial oxygen", "hypoxemia"] },
            { concept: "Normal A-a gradient shows the lung is healthy", keywords: ["a-a gradient", "alveolar-arterial", "gradient normal", "normal gradient", "healthy lung", "lung is fine"] },
          ],
        },
      ],
    },

    vignette: `A 28-year-old patient is brought to the emergency department after an overdose of an opioid pain
      medicine. The patient is minimally responsive, with breathing that is slow (6/min) and shallow. Arterial
      blood gas analysis shows a high carbon dioxide level and a low oxygen level. A chest radiograph shows no
      abnormalities.`,

    ms1: {
      intro: "Work through the blood gas findings step by step.",
      questions: [
        {
          id: "1A",
          stem: "The lungs appear normal on imaging. Which of the following best explains this patient's arterial blood gas findings?",
          choices: [
            "Alveolar ventilation falls. Blood shunts past collapsed alveoli.",
            "Alveolar ventilation falls. Carbon dioxide builds up and crowds out alveolar oxygen.",
            "Alveolar ventilation rises. Carbon dioxide is blown off and oxygen falls.",
            "Alveolar ventilation rises. Oxygen is diluted within the alveoli.",
          ],
          correct: 1,
          feedback: `Opioids blunt the brainstem drive to breathe, and alveolar ventilation falls. Carbon dioxide is normally cleared in proportion to ventilation, so it accumulates in the alveoli and the blood, raising the partial pressure of carbon dioxide (PaCO2) and lowering the pH toward an acute respiratory acidosis. By the alveolar gas equation, rising alveolar carbon dioxide takes up space that oxygen would occupy, and the alveolar and arterial oxygen both fall. Because the lung itself is healthy, oxygen still crosses normally and the alveolar-arterial (A-a) oxygen gradient stays normal, which points to hypoventilation rather than a lung problem.`,
        },
        { id: "1B", placeholder: true, topic: `Coming next: why the alveolar-to-arterial oxygen gradient stays normal in pure hypoventilation, and how that points to the cause.` },
        { id: "1C", placeholder: true, topic: `Coming next: how naloxone reverses the picture, and why giving oxygen alone can be misleading.` },
      ],
    },

    mechanism: {
      title: "Why Hypoventilation Changes the Blood Gas",
      quickFlow: [
        "Opioid blunts the drive to breathe",
        "Slow, shallow breaths",
        "↓ Alveolar ventilation",
        "Carbon dioxide builds up",
        "CO₂ crowds out alveolar oxygen",
        "↑ CO₂ and ↓ O₂, clear lungs",
      ],
      chain: [
        { label: "The brainstem sets how much we breathe", detail: "Respiratory centers in the brainstem drive the rate and depth of breathing, which sets the alveolar ventilation, the fresh air reaching the alveoli each minute." },
        { label: "Opioids turn the drive down", detail: "Opioids blunt these centers, so breathing becomes slow and shallow and alveolar ventilation falls. The lung tissue itself is normal." },
        { label: "Carbon dioxide accumulates", detail: "Carbon dioxide is cleared in proportion to ventilation. With ventilation reduced, carbon dioxide builds up in the alveoli and the blood, raising the arterial carbon dioxide level." },
        { label: "Oxygen falls as carbon dioxide rises", detail: "The extra carbon dioxide in the alveoli takes up space that oxygen would occupy, so alveolar and arterial oxygen both fall. Because the lung is healthy, the alveolar-to-arterial oxygen gradient stays normal, which points to hypoventilation." },
      ],
      summaryLabel: "What this means",
      starlingText: `When breathing slows, the first gas to move is carbon dioxide, which builds up because it
        is cleared in proportion to ventilation. As alveolar carbon dioxide rises it crowds out oxygen, and
        arterial oxygen falls with it. The rising carbon dioxide also drops the pH, an acute respiratory
        acidosis. The tell that the lungs are healthy is a normal alveolar-arterial (A-a) oxygen gradient: the
        gases are off because so little air is moving, not because the lung cannot transfer oxygen.`,
      clinicalPearl: `The alveolar gas equation makes the link concrete. In a patient breathing room air at sea
        level, a rise in arterial carbon dioxide from 40 to 80 millimeters of mercury drops the alveolar oxygen
        from about 100 to about 60, and arterial oxygen follows. Because the problem is drive and not the lung,
        the treatment is to restore ventilation. Naloxone reverses the opioid and the breathing, the carbon
        dioxide clears, and the pH and oxygen correct. Giving oxygen alone can lift the saturation while the
        carbon dioxide keeps climbing, so support the breathing, not just the saturation.`,
      source: `StatPearls, Alveolar Gas Equation`,
    },
  },
];

export const CASES = _CASES as unknown as Case[]
