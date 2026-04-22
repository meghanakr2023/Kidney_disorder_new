import os
<<<<<<< HEAD

MEDICAL_KB = {
    "Tumor": {
        "doctor": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis (Triphasic Protocol)",
            "findings": (
                "A well-defined heterogeneous solid mass is identified in the upper pole of the right kidney, "
                "measuring approximately 4.2 x 3.8 x 3.5 cm. The lesion demonstrates irregular margins with "
                "internal areas of necrosis and hemorrhage. Significant enhancement is noted in the arterial phase "
                "with washout in the delayed phase, a pattern characteristic of clear cell renal cell carcinoma. "
                "No evidence of renal vein or inferior vena cava thrombosis. No ipsilateral adrenal gland involvement. "
                "Regional lymph nodes appear within normal size limits. Contralateral kidney is normal in size, "
                "shape, and parenchymal enhancement. No hydronephrosis or perinephric fat stranding identified. "
                "Liver, spleen, and pancreas appear unremarkable."
            ),
            "impression": (
                "1. Solid renal mass in the upper pole of the right kidney measuring 4.2 x 3.8 cm with "
                "enhancement pattern highly suspicious for renal cell carcinoma (RCC). Bosniak Category IV lesion.\n"
                "2. No evidence of local invasion, lymphadenopathy, or distant metastasis on this study.\n"
                "3. Clinical and urological correlation strongly advised. Tissue sampling or surgical intervention recommended."
            ),
            "recommendation": (
                "1. Urgent urology referral within 1-2 weeks.\n"
                "2. MRI abdomen with and without contrast for further lesion characterization.\n"
                "3. CT chest for metastatic workup.\n"
                "4. Laboratory investigations: CBC, CMP, LFTs, serum creatinine, urine cytology.\n"
                "5. Nuclear medicine bone scan if clinically indicated.\n"
                "6. Multidisciplinary tumor board discussion recommended.\n"
                "7. Do not delay surgical consultation."
            )
        },
        "patient": {
            "what_found": (
                "The CT scan has detected an abnormal growth (mass) on your right kidney measuring about 4 cm. "
                "This mass has features that need urgent medical attention."
            ),
            "what_it_means": (
                "A solid mass on the kidney can sometimes be a type of kidney cancer called Renal Cell Carcinoma. "
                "However, only a specialist doctor can confirm this after further tests. "
                "The good news is that it appears to be limited to the kidney with no spread detected at this time."
            ),
            "is_it_serious": (
                "This finding is considered serious and requires prompt medical attention. "
                "Please do not panic — many kidney masses are treated successfully when caught early. "
                "You should see a urologist within the next 1-2 weeks."
            ),
            "what_to_do": (
                "1. Book an appointment with a urologist as soon as possible.\n"
                "2. Your doctor will likely order more tests such as an MRI or blood tests.\n"
                "3. Do not ignore this finding — early treatment gives the best outcome.\n"
                "4. Bring this report to your doctor appointment.\n"
                "5. Avoid strenuous physical activity until cleared by your doctor."
            ),
            "reassurance": (
                "Finding something on a scan can feel scary, but remember — this AI report is just a starting point. "
                "Your doctor will review everything carefully and guide you through the next steps. "
                "You are not alone in this process."
            )
        }
    },
    "Cyst": {
        "doctor": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis",
            "findings": (
                "A well-circumscribed, homogeneous, water-density lesion is identified in the lower pole of the "
                "left kidney measuring approximately 3.1 x 2.8 cm. The lesion demonstrates near-water attenuation "
                "on non-contrast imaging (HU: 8-12). No internal septations, calcifications, solid components, or "
                "mural nodularity identified. No enhancement noted on post-contrast sequences. "
                "The cyst wall is thin, smooth, and regular with no perceptible thickening. "
                "The remainder of the left renal parenchyma appears normal. "
                "The right kidney is normal in size and morphology with no focal lesions. "
                "No hydronephrosis, urolithiasis, or perinephric abnormality bilaterally. "
                "Visualized abdominal and pelvic structures are unremarkable."
            ),
            "impression": (
                "1. Simple renal cyst in the lower pole of the left kidney measuring 3.1 x 2.8 cm — Bosniak Category I.\n"
                "2. No features to suggest malignancy or complex cystic lesion.\n"
                "3. No intervention required at this time. Routine surveillance recommended."
            ),
            "recommendation": (
                "1. No immediate surgical or interventional treatment required.\n"
                "2. Renal ultrasound surveillance in 12 months to confirm stability.\n"
                "3. Return earlier if symptoms develop: hematuria, flank pain, fever, or hypertension.\n"
                "4. Nephrology or urology referral only if cyst enlarges or becomes symptomatic.\n"
                "5. Maintain adequate hydration and routine annual health checkups."
            )
        },
        "patient": {
            "what_found": (
                "The CT scan found a simple fluid-filled sac called a cyst on your left kidney. "
                "It measures about 3 cm and has smooth, clean edges."
            ),
            "what_it_means": (
                "Simple kidney cysts are very common and are almost always harmless. "
                "They are not cancer and do not usually cause any problems. "
                "Many people have kidney cysts and never even know about them."
            ),
            "is_it_serious": (
                "This is a low severity finding. Simple cysts rarely cause problems and do not require surgery. "
                "Your doctor will likely just monitor it with a yearly ultrasound scan."
            ),
            "what_to_do": (
                "1. Share this report with your regular doctor at your next visit.\n"
                "2. Get a kidney ultrasound check in about 12 months.\n"
                "3. See a doctor sooner if you experience pain in your side or blood in urine.\n"
                "4. Drink plenty of water daily.\n"
                "5. No change to diet or activity level is needed."
            ),
            "reassurance": (
                "This is a very common and benign finding. The vast majority of simple kidney cysts "
                "never cause any health issues. Continue with your normal life and routine checkups."
            )
        }
    },
    "Stone": {
        "doctor": {
            "scan_type": "Non-Contrast CT Scan of Kidneys, Ureters and Bladder (CT KUB)",
            "findings": (
                "A hyperdense calculus measuring approximately 7 x 5 mm is identified at the right "
                "ureterovesical junction (UVJ). The calculus demonstrates Hounsfield units of 950-1100, "
                "consistent with calcium oxalate composition. Mild to moderate right-sided hydroureteronephrosis "
                "is noted proximal to the calculus, with the right renal pelvis measuring 14 mm AP diameter. "
                "Mild perinephric and periureteric fat stranding is present along the right ureter, "
                "consistent with recent or active ureteral colic. No secondary signs of perforation or abscess. "
                "The left kidney, ureter, and bladder appear normal. No additional calculi identified bilaterally. "
                "Bladder is adequately distended with no intraluminal filling defects."
            ),
            "impression": (
                "1. Obstructing calculus at the right ureterovesical junction measuring 7 mm with associated "
                "mild to moderate right hydroureteronephrosis.\n"
                "2. Periureteric fat stranding consistent with active ureteral colic.\n"
                "3. Urgent urological evaluation recommended given degree of obstruction."
            ),
            "recommendation": (
                "1. Urgent urology consultation within 24-48 hours.\n"
                "2. Adequate analgesia: NSAIDs (Diclofenac 75mg IM) and/or opioids as needed.\n"
                "3. Alpha-blocker therapy (Tamsulosin 0.4mg OD) to facilitate stone passage.\n"
                "4. High fluid intake: minimum 2.5-3 litres per day.\n"
                "5. Strain all urine and save stone for chemical analysis.\n"
                "6. Monitor renal function: serum creatinine, eGFR, urinalysis and culture.\n"
                "7. Repeat CT KUB in 4-6 weeks if conservative management pursued.\n"
                "8. Consider ureteroscopy or shock wave lithotripsy if stone does not pass spontaneously."
            )
        },
        "patient": {
            "what_found": (
                "The CT scan found a kidney stone measuring about 7 mm stuck near the bottom of your right ureter, "
                "which is the tube connecting your kidney to your bladder. "
                "This is causing a mild blockage in your right kidney."
            ),
            "what_it_means": (
                "Kidney stones are hard deposits that form inside the kidneys. "
                "When a stone moves through the ureter it can cause severe pain in your side or back. "
                "The blockage means urine is not draining properly from your right kidney."
            ),
            "is_it_serious": (
                "This is a moderate severity finding that needs medical attention within 1-2 days. "
                "A 7mm stone may not pass on its own and might need a procedure to remove it. "
                "Left untreated, a blockage can damage the kidney over time."
            ),
            "what_to_do": (
                "1. See a urologist within the next 1-2 days.\n"
                "2. Drink at least 2.5 to 3 litres of water every day.\n"
                "3. Take prescribed pain medication as directed by your doctor.\n"
                "4. Collect your urine through a strainer to catch the stone if it passes.\n"
                "5. Go to the emergency room immediately if you develop fever, chills, or severe pain."
            ),
            "reassurance": (
                "Kidney stones are one of the most common urological conditions and are very treatable. "
                "With proper treatment and increased fluid intake, most stones are managed successfully. "
                "Follow your doctor's advice and you should recover well."
            )
        }
    },
    "Normal": {
        "doctor": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis",
            "findings": (
                "Both kidneys are normal in size, shape, and position. The right kidney measures 11.2 x 5.1 cm "
                "and the left kidney measures 11.5 x 5.3 cm, within normal limits. "
                "Renal parenchymal thickness is preserved bilaterally with normal corticomedullary differentiation. "
                "Enhancement is symmetric and homogeneous in all phases. "
                "No focal cortical lesion, cyst, calculus, or mass identified in either kidney. "
                "The collecting systems are not dilated. No hydroureteronephrosis. "
                "No perinephric fat stranding or fluid collection. "
                "Renal vasculature appears patent. Both adrenal glands are normal. "
                "Visualized abdominal structures including liver, spleen, gallbladder, and pancreas are unremarkable."
            ),
            "impression": (
                "1. Normal CT appearance of both kidneys with no focal renal pathology identified.\n"
                "2. No evidence of urolithiasis, hydronephrosis, renal mass, or cystic lesion.\n"
                "3. No acute abdominal pathology detected on this study."
            ),
            "recommendation": (
                "1. No renal intervention required at this time.\n"
                "2. Continue routine annual health maintenance and screening.\n"
                "3. Maintain adequate hydration: minimum 2 litres of water daily.\n"
                "4. Follow up with referring physician for clinical correlation with presenting symptoms.\n"
                "5. Repeat imaging only if new symptoms develop."
            )
        },
        "patient": {
            "what_found": (
                "Great news! The CT scan did not find any problems with your kidneys. "
                "Both kidneys appear completely normal in size, shape, and structure."
            ),
            "what_it_means": (
                "A normal CT scan means there are no signs of kidney stones, cysts, tumors, or blockages. "
                "Your kidneys appear to be healthy and functioning normally based on this scan."
            ),
            "is_it_serious": (
                "This is not a serious finding at all. Your kidneys look healthy. "
                "No urgent action is required."
            ),
            "what_to_do": (
                "1. Share this report with your doctor for final confirmation.\n"
                "2. Continue drinking plenty of water every day.\n"
                "3. Maintain a healthy diet and regular exercise.\n"
                "4. Attend routine annual health checkups.\n"
                "5. Return to your doctor if you develop any new symptoms."
            ),
            "reassurance": (
                "A normal scan is great news. Continue taking care of your health with "
                "regular checkups and a healthy lifestyle."
            )
        }
=======
import json
import re

MEDICAL_KB = {
    "Tumor": {
        "description": "A renal tumor is a malignant growth originating from kidney parenchyma.",
        "findings_template": "CT demonstrates a heterogeneous solid mass in the kidney with irregular margins.",
        "impression": "Findings are consistent with a renal mass, suspicious for renal cell carcinoma.",
        "recommendation": "1. Urgent urology referral recommended.\n2. Multiphasic contrast CT or renal MRI for staging.\n3. Consider CT-guided biopsy if indicated.\n4. Labs: CBC, BMP, LFTs, serum creatinine.\n5. Follow-up within 2 weeks.",
        "patient_explanation": "The AI detected what appears to be an abnormal growth on your kidney. Please see a specialist promptly.",
        "severity": "HIGH",
        "urgency": "Urgent — schedule specialist appointment within 1-2 weeks"
    },
    "Cyst": {
        "description": "A simple renal cyst is a fluid-filled sac arising from the kidney.",
        "findings_template": "CT reveals a well-circumscribed homogeneous hypodense lesion in the kidney.",
        "impression": "Simple renal cyst, Bosniak Category I. No malignant features identified.",
        "recommendation": "1. No immediate intervention required.\n2. Annual renal ultrasound for surveillance.\n3. Re-evaluate if symptoms develop.",
        "patient_explanation": "The AI found a simple fluid-filled sac on your kidney. These are very common and almost always harmless.",
        "severity": "LOW",
        "urgency": "Routine — follow-up at next scheduled visit"
    },
    "Stone": {
        "description": "Urolithiasis — calcified deposits within the renal collecting system.",
        "findings_template": "Non-contrast CT demonstrates a hyperdense calculus in the kidney or ureter.",
        "impression": "Urolithiasis identified. Clinical correlation advised.",
        "recommendation": "1. Urology referral for stone management.\n2. High fluid intake (2-3L/day).\n3. Strain urine for stone analysis.\n4. Pain management as needed.\n5. Repeat imaging in 4-6 weeks.",
        "patient_explanation": "The AI detected a kidney stone. Small ones often pass on their own with plenty of water. Larger ones may need treatment.",
        "severity": "MODERATE",
        "urgency": "Semi-urgent — contact your doctor within 1-3 days"
    },
    "Normal": {
        "description": "Normal kidneys with no focal lesions or abnormalities.",
        "findings_template": "Both kidneys are normal in size, shape and position. No focal lesions, calculi or hydronephrosis identified.",
        "impression": "No significant renal pathology identified on this CT scan.",
        "recommendation": "1. No immediate renal intervention required.\n2. Continue routine health maintenance.\n3. Follow-up as clinically indicated.",
        "patient_explanation": "Good news! The AI did not find any kidney problems on your CT scan. Your kidneys appear normal.",
        "severity": "NONE",
        "urgency": "Routine — no urgent action required"
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
    }
}


def retrieve_context(prediction):
    return MEDICAL_KB.get(prediction, MEDICAL_KB["Normal"])


def generate_report_with_llm(prediction, confidence, probabilities, patient_info, mode='doctor', api_key=None):
    context = retrieve_context(prediction)
<<<<<<< HEAD
    return _generate_from_template(prediction, confidence, probabilities, patient_info, mode, context)
=======

    if api_key and api_key.startswith("sk-"):
        try:
            return _generate_with_anthropic(
                prediction, confidence, probabilities,
                patient_info, mode, context, api_key
            )
        except Exception as e:
            print(f"LLM generation failed: {e}, falling back to templates")

    return _generate_from_template(
        prediction, confidence, probabilities,
        patient_info, mode, context
    )


def _generate_with_anthropic(prediction, confidence, probabilities, patient_info, mode, context, api_key):
    import urllib.request

    name = patient_info.get("name", "Unknown")
    age = patient_info.get("age", "N/A")
    gender = patient_info.get("gender", "N/A")
    scan_date = patient_info.get("scanDate", "N/A")
    referring_doc = patient_info.get("referringDoctor", "N/A")
    history = patient_info.get("clinicalHistory", "Not provided")
    prob_str = ", ".join([f"{k}: {v}%" for k, v in probabilities.items()])

    if mode == 'doctor':
        prompt = f"""You are an expert radiologist. Generate a concise professional radiology report.

Patient: {name}, {age}y, {gender}
Scan Date: {scan_date} | Referring: Dr. {referring_doc}
Clinical History: {history}
AI Analysis: {prediction} (Confidence: {confidence}%)
Class Probabilities: {prob_str}
Medical Context: {context['description']}

Return ONLY a JSON object with these keys:
- findings
- impression
- recommendation
- scan_type

No markdown, no extra text."""
    else:
        prompt = f"""You are helping a patient understand their CT scan results.

Patient: {name}, Age: {age}
AI Detected: {prediction} (Confidence: {confidence}%)
Context: {context['patient_explanation']}

Return ONLY a JSON object with these keys:
- what_found
- what_it_means
- is_it_serious
- what_to_do
- reassurance

No markdown, no extra text."""

    payload = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1000,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())

    text = data["content"][0]["text"]
    text = re.sub(r"```json\s*|\s*```", "", text).strip()
    return json.loads(text)
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171


def _generate_from_template(prediction, confidence, probabilities, patient_info, mode, context):
    if mode == 'doctor':
        return {
<<<<<<< HEAD
            "scan_type": context["doctor"]["scan_type"],
            "findings": context["doctor"]["findings"],
            "impression": context["doctor"]["impression"],
            "recommendation": context["doctor"]["recommendation"]
        }
    else:
        return {
            "what_found": context["patient"]["what_found"],
            "what_it_means": context["patient"]["what_it_means"],
            "is_it_serious": context["patient"]["is_it_serious"],
            "what_to_do": context["patient"]["what_to_do"],
            "reassurance": context["patient"]["reassurance"]
=======
            "findings": context["findings_template"],
            "impression": context["impression"],
            "recommendation": context["recommendation"],
            "scan_type": "CT Abdomen/Pelvis"
        }
    else:
        return {
            "what_found": f"The AI analysis detected findings consistent with a kidney {prediction.lower()}. Confidence level: {confidence}%.",
            "what_it_means": context["patient_explanation"],
            "is_it_serious": f"Severity: {context['severity']}. {context['urgency']}.",
            "what_to_do": context["recommendation"],
            "reassurance": "Remember this is an AI-assisted analysis. Your doctor will review these findings and provide a confirmed diagnosis."
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
        }