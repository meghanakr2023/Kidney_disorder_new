import os
import json
import re

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
    # ... (Cyst, Stone, Normal entries remain the same as your first version)
    "Cyst": {
        # ... (keeping your detailed Cyst structure)
    },
    "Stone": {
        # ... (keeping your detailed Stone structure)
    },
    "Normal": {
        # ... (keeping your detailed Normal structure)
    }
}

def retrieve_context(prediction):
    """Retrieve medical context for the given prediction."""
    return MEDICAL_KB.get(prediction, MEDICAL_KB["Normal"])

def generate_report_with_llm(prediction, confidence, probabilities, patient_info, mode='doctor', api_key=None):
    """Generate medical report using LLM or template fallback."""
    context = retrieve_context(prediction)
    
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
    """Generate report using Anthropic Claude API."""
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
Medical Context: {context['doctor']['description'] if 'doctor' in context else ''}

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
Context: {context['patient']['what_found'] if 'patient' in context else ''}

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

def _generate_from_template(prediction, confidence, probabilities, patient_info, mode, context):
    """Generate report from predefined templates."""
    if mode == 'doctor':
        return {
            "scan_type": context["doctor"]["scan_type"],
            "findings": context["doctor"]["findings"],
            "impression": context["doctor"]["impression"],
            "recommendation": context["doctor"]["recommendation"]
        }
    else:  # patient mode
        return {
            "what_found": context["patient"]["what_found"],
            "what_it_means": context["patient"]["what_it_means"],
            "is_it_serious": context["patient"]["is_it_serious"],
            "what_to_do": context["patient"]["what_to_do"],
            "reassurance": context["patient"]["reassurance"]
        }
