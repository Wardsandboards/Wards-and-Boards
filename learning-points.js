// ============================================================
//  LEARNING POINTS - one distilled Anki card per question
//
//  Keyed by "caseId:questionId" (the same key serves the Learn
//  ms1 question and its board-question counterpart, because both
//  test the same concept). Each value is { front, back }: the
//  Anki Front is a self-contained recall cue, the Back is the
//  key learning point, not the original question and its options.
//
//  House style: no em-dashes, acronyms spelled out, ungendered,
//  no exaggeration. HTML <br> is allowed (Anki renders it).
// ============================================================

window.LEARNING_POINTS = {

  // ── Decompensated heart failure / Frank-Starling ──
  "chf-frank-starling:1A": {
    front: "In decompensated heart failure, what happens to preload (left ventricular end-diastolic volume), and why?",
    back: "It increases. Low cardiac output activates the renin-angiotensin-aldosterone system and the sympathetic nervous system, which retain sodium and water, raising venous return and ventricular filling. Jugular venous distension and peripheral edema are the signs.",
  },
  "chf-frank-starling:1B": {
    front: "A failing ventricle with a high end-diastolic volume sits where on the Frank-Starling curve?",
    back: "On the flat portion (plateau) of a depressed curve, where added filling yields little extra stroke volume: volume overloaded yet still low output. The intact heart has no true descending limb, so it is a plateau, not a downslope.",
  },
  "chf-frank-starling:1C": {
    front: "Why does a diuretic raise stroke volume in a volume-overloaded failing heart?",
    back: "Lowering preload moves the operating point off the flat plateau onto the ascending portion of the Frank-Starling curve, so stroke volume and cardiac output rise. The curve itself does not move; only inotropes or sympathetic tone shift it.<br><br>Pearl: pushing diuresis too far overshoots and drops output, so the creatinine rises from prerenal azotemia. Aim for optimal preload, not maximal diuresis.",
  },

  // ── Hemorrhagic shock ──
  "hemorrhagic-shock:1A": {
    front: "After major blood loss, what happens to left ventricular end-diastolic volume, and why?",
    back: "It falls. Lost circulating volume lowers venous return and ventricular filling, moving the patient leftward on a normal Frank-Starling curve, so stroke volume drops. Sympathetic venoconstriction helps a little but cannot replace a quarter of the blood volume.",
  },
  "hemorrhagic-shock:1B": {
    front: "What reflex drives the tachycardia in hemorrhagic shock?",
    back: "The baroreceptor reflex. Aortic arch and carotid sinus baroreceptors sense the fall in mean arterial pressure, reduce vagal tone, and raise sympathetic output to beta-1 receptors at the sinoatrial node. The Bainbridge reflex is the opposite, triggered by atrial stretch from volume loading.",
  },
  "hemorrhagic-shock:1C": {
    front: "Why does tachycardia fail to maintain blood pressure in hemorrhagic shock?",
    back: "Cardiac output = heart rate x stroke volume. The faster rate cannot compensate for the critically low stroke volume from preload depletion, so the product stays inadequate. Systemic vascular resistance is already high from vasoconstriction. Volume replacement is the definitive treatment.",
  },

  // ── Aortic stenosis ──
  "aortic-stenosis:1A": {
    front: "How does the left ventricle adapt to the chronic pressure overload of aortic stenosis?",
    back: "Concentric hypertrophy: sarcomeres are added in parallel, thickening the wall without enlarging the chamber. By the Laplace relationship the thicker wall brings wall stress back toward normal. Volume overload instead causes eccentric hypertrophy, with sarcomeres in series and chamber enlargement.",
  },
  "aortic-stenosis:1B": {
    front: "Why does severe aortic stenosis cause syncope on exertion rather than at rest?",
    back: "The stenosis is a fixed obstruction, so output cannot rise on demand. Exercise lowers systemic vascular resistance, and since mean arterial pressure = cardiac output x systemic vascular resistance, with output fixed the pressure falls, cerebral perfusion drops, and the patient faints.",
  },
  "aortic-stenosis:1C": {
    front: "Why is there breathlessness in aortic stenosis even when the ejection fraction is normal?",
    back: "The thick, stiff ventricle fills poorly, so it needs high filling pressures, and those transmit back to the left atrium and pulmonary veins, causing congestion. This is heart failure with preserved ejection fraction: systolic function is intact, diastolic function is impaired.",
  },

  // ── Oxygen-hemoglobin dissociation ──
  "oxyhemoglobin-dissociation:1A": {
    front: "Which way does the oxygen-hemoglobin dissociation curve shift with fever, acidosis, and a high carbon dioxide level, and why?",
    back: "To the right (the Bohr effect). Fever, low pH, high partial pressure of carbon dioxide, and high 2,3-bisphosphoglycerate (2,3-BPG) all lower hemoglobin's affinity for oxygen, so it unloads more oxygen to the tissues.",
  },
  "oxyhemoglobin-dissociation:1B": {
    front: "What does a right-shifted oxygen-hemoglobin curve do at the tissues?",
    back: "It lowers affinity, so at the tissue oxygen tension hemoglobin releases more oxygen. The shift is greatest in the warm, acidic, carbon-dioxide-rich beds that need oxygen most, so delivery improves where demand is highest.",
  },
  "oxyhemoglobin-dissociation:1C": {
    front: "Why does arterial oxygen saturation stay near normal in the lungs despite a right-shifted curve?",
    back: "The lungs work on the flat upper plateau of the curve: above an oxygen tension of about 60 mmHg hemoglobin loads almost fully regardless of the shift. The shift matters on the steep part of the curve, at the tissues, where it aids unloading.",
  },

  // ── Baroreceptor reflex ──
  "cardio-baroreceptor:1A": {
    front: "On standing, blood pressure falls. What restores it, and how?",
    back: "The baroreceptor reflex. Carotid baroreceptors fire less, so sympathetic outflow rises and parasympathetic (vagal) outflow falls. Heart rate climbs and arterioles constrict, raising cardiac output and systemic vascular resistance back toward normal. This reflex fails in orthostatic hypotension.",
  },

  // ── Coronary perfusion in diastole ──
  "cardio-coronary-diastole:1A": {
    front: "Why does a faster heart rate reduce myocardial oxygen supply?",
    back: "The left ventricle is perfused mainly during diastole. As heart rate rises, diastole shortens far more than systole, so coronary filling time falls just as oxygen demand climbs. With a fixed coronary narrowing, supply cannot meet demand and angina results.",
  },

  // ── Hyperkalemia and membrane potential ──
  "cardio-hyperkalemia:1A": {
    front: "How does a high extracellular potassium level change the cardiac resting membrane potential, and what does that do?",
    back: "It makes the resting potential less negative. A high extracellular potassium shrinks the potassium gradient, so less potassium leaves at rest and the cell sits partly depolarized. That inactivates fast sodium channels and slows conduction. The earliest electrocardiogram sign is tall, peaked T waves.",
  },

  // ── Iron-deficiency anemia ──
  "heme-iron-deficiency:1A": {
    front: "Why are red blood cells small and pale in iron-deficiency anemia?",
    back: "Precursors keep dividing until they reach a target hemoglobin concentration. With limited iron, hemoglobin accumulates slowly, so the precursors undergo extra divisions before reaching that target. The result is microcytic, hypochromic cells and a low mean corpuscular volume.",
  },

  // ── Megaloblastic (B12) anemia ──
  "heme-b12-macrocytic:1A": {
    front: "Why are red blood cells enlarged in vitamin B12 deficiency?",
    back: "Vitamin B12 is required for DNA synthesis. Without it, nuclear maturation lags while the cytoplasm keeps growing (nuclear-cytoplasmic asynchrony), so the precursor divides fewer times and is released as an oversized macrocyte with a high mean corpuscular volume. The same defect produces hypersegmented neutrophils.",
  },

  // ── Erythropoietin / anemia of chronic kidney disease ──
  "heme-epo-ckd:1A": {
    front: "Why does chronic kidney disease cause anemia?",
    back: "The kidney's interstitial cells produce erythropoietin through the hypoxia-inducible factor pathway. As kidney tissue is lost, erythropoietin falls and the marrow loses its main signal to make red cells. The result is a normocytic anemia with a low reticulocyte count despite adequate iron, vitamin B12, and folate.",
  },

  // ── Surfactant and Laplace's law ──
  "pulm-surfactant:1A": {
    front: "Why do alveoli collapse when surfactant is deficient?",
    back: "By the Law of Laplace, collapsing pressure = 2 x tension / radius, so tension matters most in the smallest alveoli. Surfactant from type II pneumocytes lowers surface tension, especially in small alveoli. Without it the tension stays high and small alveoli collapse, the mechanism of neonatal respiratory distress syndrome.",
  },

  // ── Ventilation-perfusion mismatch ──
  "pulm-vq-mismatch:1A": {
    front: "Why is arterial oxygen low when pneumonia fills alveoli with fluid?",
    back: "Ventilation falls while perfusion continues, so the ventilation-perfusion (V/Q) ratio drops toward zero and blood returns to the body poorly oxygenated. A low V/Q region still has some ventilation and responds to supplemental oxygen, whereas a region with none is a true shunt and responds only partly.",
  },

  // ── Hypoventilation ──
  "pulm-hypoventilation:1A": {
    front: "Why are carbon dioxide high and oxygen low after an opioid overdose when the lungs look normal?",
    back: "Opioids blunt the brainstem drive to breathe, so alveolar ventilation falls and carbon dioxide accumulates, causing a respiratory acidosis. By the alveolar gas equation, the rising carbon dioxide displaces alveolar oxygen, so oxygen falls too. Because the lung is healthy, the alveolar-arterial oxygen gradient stays normal, pointing to hypoventilation.",
  },

  // ========================================================
  //  Ward-moment free-response prompts (keyed caseId:promptId)
  //  The "concept" / "co" / "afterload" / "curve" prompts are
  //  definitions; the "reason" prompts summarize the mechanism.
  // ========================================================

  // ── Decompensated heart failure / Frank-Starling ──
  "chf-frank-starling:co": {
    front: "What is cardiac output, and what two factors set it?",
    back: "Cardiac output is the volume of blood the heart pumps each minute. Cardiac output = heart rate x stroke volume.",
  },
  "chf-frank-starling:reason": {
    front: "Why does removing fluid improve cardiac output in decompensated heart failure?",
    back: "The overfilled ventricle sits on the flat portion of a depressed Frank-Starling curve, where extra preload adds congestion rather than output. A diuretic lowers end-diastolic volume and moves the operating point onto the ascending portion, so stroke volume and cardiac output rise.",
  },

  // ── Hemorrhagic shock ──
  "hemorrhagic-shock:co": {
    front: "What is cardiac output, and what two factors set it?",
    back: "Cardiac output is the volume of blood the heart pumps each minute. Cardiac output = heart rate x stroke volume.",
  },
  "hemorrhagic-shock:reason": {
    front: "How does the body compensate for acute blood loss, and why can it fall short?",
    back: "Blood loss lowers venous return and preload. Baroreceptors sense the falling pressure and trigger a sympathetic surge: tachycardia and vasoconstriction that raises systemic vascular resistance. It falls short because stroke volume stays critically low until the lost volume is replaced.",
  },

  // ── Aortic stenosis ──
  "aortic-stenosis:afterload": {
    front: "What is afterload?",
    back: "Afterload is the load the ventricle must eject against, set largely by arterial pressure and by any outflow obstruction such as a stenotic aortic valve. Higher afterload means more work for the ventricle to open the valve and eject.",
  },
  "aortic-stenosis:reason": {
    front: "In aortic stenosis, why is there exertional syncope and breathlessness despite a normal ejection fraction?",
    back: "The stenosis is a fixed obstruction, so output cannot rise on exertion. Exercise lowers systemic vascular resistance, mean arterial pressure falls, and cerebral perfusion drops, causing syncope. Concentric hypertrophy also stiffens the ventricle, so high filling pressures back up into the lungs (heart failure with preserved ejection fraction), causing breathlessness.",
  },

  // ── Oxygen-hemoglobin dissociation ──
  "oxyhemoglobin-dissociation:curve": {
    front: "What does the oxygen-hemoglobin dissociation curve show?",
    back: "It plots hemoglobin's oxygen saturation against the oxygen tension. Its sigmoid shape comes from cooperative binding: hemoglobin loads oxygen in the lungs where the oxygen tension is high and unloads it in the tissues where the oxygen tension is low.",
  },
  "oxyhemoglobin-dissociation:reason": {
    front: "What do fever and acidosis do to the oxygen-hemoglobin curve, and does it help oxygen delivery?",
    back: "They shift the curve to the right (the Bohr effect: low pH, high carbon dioxide, fever, and high 2,3-bisphosphoglycerate). Lower affinity means hemoglobin unloads more oxygen at the tissue oxygen tension, so delivery to the tissues improves.",
  },

  // ── Baroreceptor reflex ──
  "cardio-baroreceptor:concept": {
    front: "What do the arterial baroreceptors do?",
    back: "They sense stretch (pressure) in the carotid sinus and aortic arch and signal the brainstem to adjust autonomic tone. They are the body's moment-to-moment regulator of blood pressure.",
  },
  "cardio-baroreceptor:reason": {
    front: "How does the baroreceptor reflex restore blood pressure after standing?",
    back: "Standing lowers venous return and pressure, so the baroreceptors fire less. Sympathetic outflow rises and parasympathetic outflow falls, raising heart rate and constricting arterioles. Cardiac output and systemic vascular resistance rise, restoring the pressure.",
  },

  // ── Coronary perfusion in diastole ──
  "cardio-coronary-diastole:concept": {
    front: "When in the cardiac cycle is the left ventricle mainly perfused, and why?",
    back: "Mainly during diastole. Systole compresses the intramural coronary vessels, so left ventricular coronary flow is greatest when the muscle relaxes.",
  },
  "cardio-coronary-diastole:reason": {
    front: "Why can a faster heart rate reduce myocardial oxygen supply?",
    back: "As heart rate rises, diastole shortens far more than systole, leaving less time for coronary filling just as oxygen demand climbs. A fixed coronary narrowing cannot make up the difference, so angina results.",
  },

  // ── Hyperkalemia and membrane potential ──
  "cardio-hyperkalemia:concept": {
    front: "What mainly sets the resting membrane potential of a cardiac cell?",
    back: "The potassium concentration gradient across the cell membrane. Potassium leaking out of the cell keeps the inside negative at rest.",
  },
  "cardio-hyperkalemia:reason": {
    front: "What does a high extracellular potassium do to the cardiac resting membrane potential, and why does it matter?",
    back: "It shrinks the potassium gradient, so less potassium leaves and the resting potential becomes less negative (partly depolarized). That inactivates fast sodium channels and slows conduction, which raises the risk of arrhythmia.",
  },

  // ── Iron-deficiency anemia ──
  "heme-iron-deficiency:concept": {
    front: "What is iron needed for in a red blood cell?",
    back: "Building hemoglobin. Iron sits in heme and binds oxygen, so without enough iron the cell makes less hemoglobin.",
  },
  "heme-iron-deficiency:reason": {
    front: "Why does iron deficiency make red cells both small and pale?",
    back: "Without iron, hemoglobin accumulates slowly. Precursors keep dividing until they reach a target hemoglobin concentration, so they undergo extra divisions and end up small (microcytic), and each cell carries less hemoglobin (hypochromic, pale).",
  },

  // ── Megaloblastic (B12) anemia ──
  "heme-b12-macrocytic:concept": {
    front: "What is vitamin B12 needed for in a dividing cell?",
    back: "DNA synthesis, which a cell needs in order to divide. Folate serves the same role, which is why a deficiency of either produces the same megaloblastic picture.",
  },
  "heme-b12-macrocytic:reason": {
    front: "Why does vitamin B12 deficiency make red cells larger than normal?",
    back: "DNA synthesis slows while the cytoplasm keeps growing, so the nucleus cannot keep pace (nuclear-cytoplasmic asynchrony). The precursor enlarges before it can divide and is released as a macrocyte. The same defect produces hypersegmented neutrophils.",
  },

  // ── Erythropoietin / anemia of chronic kidney disease ──
  "heme-epo-ckd:concept": {
    front: "What does erythropoietin do, and where is it made?",
    back: "It stimulates red blood cell production in the bone marrow. It is made mainly by the kidney, which releases it when oxygen delivery falls.",
  },
  "heme-epo-ckd:reason": {
    front: "Why does chronic kidney disease cause anemia even when iron, vitamin B12, and folate are normal?",
    back: "Kidney damage lowers erythropoietin production, so the marrow loses its main signal to make red cells. Few are produced (low reticulocyte count) even though the building blocks are present, giving a normocytic anemia.",
  },

  // ── Surfactant and Laplace's law ──
  "pulm-surfactant:concept": {
    front: "What does pulmonary surfactant do?",
    back: "It lowers surface tension inside the alveoli, which keeps small alveoli from collapsing and reduces the effort needed to inflate the lung.",
  },
  "pulm-surfactant:reason": {
    front: "Why does a premature newborn without enough surfactant develop collapsing alveoli?",
    back: "Surfactant is made late in gestation, so without it surface tension stays high. By the Law of Laplace (collapsing pressure = 2 x tension / radius), the smallest alveoli feel the most collapsing pressure, collapse, and empty into larger ones, and reopening them takes high effort. This is neonatal respiratory distress syndrome.",
  },

  // ── Ventilation-perfusion mismatch ──
  "pulm-vq-mismatch:concept": {
    front: "What does the ventilation-perfusion ratio describe?",
    back: "The match between airflow (ventilation) and blood flow (perfusion) in a region of lung. The two must be matched for efficient gas exchange.",
  },
  "pulm-vq-mismatch:reason": {
    front: "Why does fluid-filled alveoli with continued blood flow lower the arterial oxygen level?",
    back: "Ventilation falls while perfusion continues, so the ventilation-perfusion ratio drops toward zero. Blood passes those alveoli without being oxygenated, mixes into the arterial blood, and lowers the arterial oxygen. This component corrects only partly with supplemental oxygen.",
  },

  // ── Hypoventilation ──
  "pulm-hypoventilation:concept": {
    front: "What is alveolar ventilation, and what controls it?",
    back: "The volume of fresh air reaching the alveoli each minute. It is driven by the brainstem respiratory centers and sets how much carbon dioxide the body clears.",
  },
  "pulm-hypoventilation:reason": {
    front: "Why does slow, shallow breathing raise carbon dioxide and lower oxygen when the lungs are healthy?",
    back: "Reduced respiratory drive lowers alveolar ventilation, so carbon dioxide builds up. By the alveolar gas equation, the rising alveolar carbon dioxide displaces oxygen, so both alveolar and arterial oxygen fall. Because the lung itself is healthy, the alveolar-arterial oxygen gradient stays normal, pointing to hypoventilation.",
  },

};
