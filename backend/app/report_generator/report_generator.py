import os
import json
import base64
import urllib.request
import urllib.error
from datetime import date


def _image_to_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def generate_report_with_llm(prediction, confidence, probabilities, patient_info,
                              mode='doctor', api_key=None, image_path=None,
                              measurements=None):
    gemini_key = api_key or os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    print(f"Image path: {image_path}")
    print(f"Image exists: {os.path.exists(image_path) if image_path else False}")
    print(f"Measurements available: {measurements.get('available', False) if measurements else False}")

    # 1. Try Gemini first
    if gemini_key and image_path and os.path.exists(image_path):
        try:
            print("Trying Gemini Vision...")
            result = _generate_with_gemini(
                prediction, confidence, probabilities,
                patient_info, mode, gemini_key, image_path,
                measurements=measurements or {},
            )
            print("Gemini Vision success!")
            return result
        except Exception as e:
            print(f"Gemini failed: {e}")

    # 2. Try OpenAI second — reliable vision
    if openai_key and image_path and os.path.exists(image_path):
        try:
            print("Trying OpenAI GPT-4o Vision...")
            result = _generate_with_openai(
                prediction, confidence, probabilities,
                patient_info, mode, image_path,
                measurements=measurements or {},
            )
            print("OpenAI success!")
            return result
        except Exception as e:
            print(f"OpenAI failed: {e}")

    # 3. Try OpenRouter third
    if openrouter_key and image_path and os.path.exists(image_path):
        try:
            print("Trying OpenRouter Vision...")
            result = _generate_with_openrouter(
                prediction, confidence, probabilities,
                patient_info, mode, image_path,
                measurements=measurements or {},
            )
            print("OpenRouter success!")
            return result
        except Exception as e:
            print(f"OpenRouter failed: {e}")

    # 4. Try Groq fourth — text only
    if groq_key:
        try:
            print("Trying Groq...")
            result = _generate_with_groq(
                prediction, confidence, probabilities,
                patient_info, mode, groq_key,
                measurements=measurements or {},
            )
            print("Groq success!")
            return result
        except Exception as e:
            print(f"Groq failed: {e}")

    # 5. Final fallback
    print("Using template fallback")
    return _generate_from_template(
        prediction, confidence, probabilities, patient_info, mode
    )


def _build_prompts(prediction, confidence, probabilities,
                   patient_info, mode, measurements=None):
    name = patient_info.get("name", "Unknown")
    age = patient_info.get("age", "N/A")
    gender = patient_info.get("gender", "N/A")
    scan_date = patient_info.get("scanDate", str(date.today()))
    ref_doc = patient_info.get("referringDoctor", "N/A")
    history = patient_info.get("clinicalHistory", "Not provided")

    if measurements and measurements.get('available'):
        meas_text = f"""
Calibrated Measurements from DICOM (USE THESE EXACT VALUES):
- Lesion size: {measurements['width_mm']} x {measurements['height_mm']} mm
- Lesion area: {measurements['area_cm2']} cm²
- Mean HU value: {measurements['hu_mean']} HU
- HU range: {measurements['hu_min']} to {measurements['hu_max']} HU
"""
    else:
        meas_text = "Note: JPG input — estimate measurements visually. State these are visual estimates."

    if mode == "doctor":
        prompt = f"""You are an expert radiologist generating a CT kidney scan report.

Patient Details:
- Name: {name}
- Age: {age} years
- Gender: {gender}
- Scan Date: {scan_date}
- Referring Doctor: Dr. {ref_doc}
- Clinical History: {history}

AI Pre-Analysis: {prediction} detected with {confidence}% confidence.

{meas_text}

Generate a detailed patient-specific radiology report.
Be specific. Do NOT use generic template sentences.

Return ONLY a valid JSON object with these exact keys:
{{
  "scan_type": "type of CT scan performed",
  "technique": "detailed technique description",
  "indication": "clinical indication based on history",
  "findings_liver": "liver and biliary tract findings",
  "findings_gallbladder": "gallbladder findings",
  "findings_pancreas": "pancreas findings",
  "findings_spleen": "spleen findings",
  "findings_right_kidney": "specific right kidney findings with measurements",
  "findings_left_kidney": "specific left kidney findings with measurements",
  "findings_collecting_system": "collecting system findings",
  "findings_urinary_bladder": "urinary bladder findings",
  "findings_adrenals": "adrenal gland findings",
  "findings_vessels": "vascular and lymph node findings",
  "findings_others": "other abdominal findings",
  "impression": "numbered impression points specific to this patient",
  "recommendation": "numbered recommendations for this patient",
  "ai_confidence": "{confidence}% confidence — {prediction} detected"
}}

Return ONLY the JSON. No markdown. No extra text."""

    else:
        prompt = f"""You are a medical communicator helping a patient understand their CT kidney scan.

Patient: {name}, Age: {age}, Gender: {gender}
AI detected: {prediction} with {confidence}% confidence
Clinical History: {history}

{meas_text}

Generate a simple friendly explanation in plain language.

Return ONLY a valid JSON object with these exact keys:
{{
  "what_found": "what was found in simple language",
  "what_it_means": "what this means for this patient",
  "is_it_serious": "how serious is this finding",
  "what_to_do": "numbered steps of what to do next",
  "reassurance": "a reassuring closing message"
}}

Return ONLY the JSON. No markdown. No extra text."""

    return prompt


def _generate_with_gemini(prediction, confidence, probabilities, patient_info,
                           mode, api_key, image_path, measurements=None):
    prompt = _build_prompts(
        prediction, confidence, probabilities,
        patient_info, mode, measurements
    )

    ext = image_path.split(".")[-1].lower()
    if ext == 'dcm':
        import pydicom
        import numpy as np
        from PIL import Image
        import io

        ds = pydicom.dcmread(image_path)
        raw_pixels = ds.pixel_array.astype(np.float32)
        slope = float(getattr(ds, 'RescaleSlope', 1.0))
        intercept = float(getattr(ds, 'RescaleIntercept', 0.0))
        hu = raw_pixels * slope + intercept

        wc = float(getattr(ds, 'WindowCenter', 40))
        ww = float(getattr(ds, 'WindowWidth', 400))
        if isinstance(wc, (list, tuple)): wc = wc[0]
        if isinstance(ww, (list, tuple)): ww = ww[0]

        lower = wc - ww / 2
        upper = wc + ww / 2
        windowed = np.clip(hu, lower, upper)
        normalized = ((windowed - lower) / (upper - lower) * 255).astype(np.uint8)

        pil_img = Image.fromarray(normalized).convert('RGB')
        buf = io.BytesIO()
        pil_img.save(buf, format='PNG')
        image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        mime = "image/png"
    else:
        image_b64 = _image_to_base64(image_path)
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"

    payload = json.dumps({
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime,
                            "data": image_b64
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2000
        }
    }).encode("utf-8")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={api_key}"

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Gemini API Error: {error_body}")
        raise

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def _generate_with_openrouter(prediction, confidence, probabilities,
                               patient_info, mode, image_path,
                               measurements=None):
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_key:
        raise Exception("No OpenRouter key found")

    prompt = _build_prompts(
        prediction, confidence, probabilities,
        patient_info, mode, measurements
    )

    ext = image_path.split(".")[-1].lower()
    if ext == 'dcm':
        import pydicom
        import numpy as np
        from PIL import Image
        import io as io_module

        ds = pydicom.dcmread(image_path)
        raw_pixels = ds.pixel_array.astype(np.float32)
        slope = float(getattr(ds, 'RescaleSlope', 1.0))
        intercept = float(getattr(ds, 'RescaleIntercept', 0.0))
        hu = raw_pixels * slope + intercept

        wc = float(getattr(ds, 'WindowCenter', 40))
        ww = float(getattr(ds, 'WindowWidth', 400))
        if isinstance(wc, (list, tuple)): wc = wc[0]
        if isinstance(ww, (list, tuple)): ww = ww[0]

        lower = wc - ww / 2
        upper = wc + ww / 2
        windowed = np.clip(hu, lower, upper)
        normalized = ((windowed - lower) / (upper - lower) * 255).astype(np.uint8)

        pil_img = Image.fromarray(normalized).convert('RGB')
        buf = io_module.BytesIO()
        pil_img.save(buf, format='PNG')
        image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        mime = "image/png"
    else:
        image_b64 = _image_to_base64(image_path)
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"

    payload = json.dumps({
        "model": "openrouter/free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{image_b64}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.2,
        "max_tokens": 2000,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openrouter_key}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Radiology Assistant"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"OpenRouter Error: {error_body}")
        raise

    text = data["choices"][0]["message"]["content"]
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)

def _generate_with_openai(prediction, confidence, probabilities,
                           patient_info, mode, image_path,
                           measurements=None):
    """
    Generate report using OpenAI GPT-4o Vision.
    Reads actual CT image. Very reliable. ~$0.005 per request.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise Exception("No OpenAI key found")

    prompt = _build_prompts(
        prediction, confidence, probabilities,
        patient_info, mode, measurements
    )

    # Encode image
    ext = image_path.split(".")[-1].lower()
    if ext == 'dcm':
        import pydicom
        import numpy as np
        from PIL import Image
        import io as io_module

        ds = pydicom.dcmread(image_path)
        raw_pixels = ds.pixel_array.astype(np.float32)
        slope = float(getattr(ds, 'RescaleSlope', 1.0))
        intercept = float(getattr(ds, 'RescaleIntercept', 0.0))
        hu = raw_pixels * slope + intercept

        wc = float(getattr(ds, 'WindowCenter', 40))
        ww = float(getattr(ds, 'WindowWidth', 400))
        if isinstance(wc, (list, tuple)): wc = wc[0]
        if isinstance(ww, (list, tuple)): ww = ww[0]

        lower = wc - ww / 2
        upper = wc + ww / 2
        windowed = np.clip(hu, lower, upper)
        normalized = ((windowed - lower) / (upper - lower) * 255).astype(np.uint8)

        pil_img = Image.fromarray(normalized).convert('RGB')
        buf = io_module.BytesIO()
        pil_img.save(buf, format='PNG')
        image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        mime = "image/png"
    else:
        image_b64 = _image_to_base64(image_path)
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"

    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert radiologist. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{image_b64}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.2,
        "max_tokens": 2000,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_key}",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"OpenAI Error: {error_body}")
        raise

    text = data["choices"][0]["message"]["content"]
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)

def _generate_with_groq(prediction, confidence, probabilities, patient_info,
                         mode, api_key, measurements=None):
    from groq import Groq

    prompt = _build_prompts(
        prediction, confidence, probabilities,
        patient_info, mode, measurements
    )

    client = Groq(api_key=api_key)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert radiologist. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=2000,
    )

    text = chat_completion.choices[0].message.content
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def _generate_from_template(prediction, confidence, probabilities, patient_info, mode):
    name = patient_info.get("name", "Unknown")
    age = patient_info.get("age", "N/A")
    gender = patient_info.get("gender", "N/A")
    history = patient_info.get("clinicalHistory", "Not provided")

    FINDINGS = {
        "Tumor": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis (Triphasic Protocol)",
            "technique": "Plain and contrast-enhanced spiral CT scan of the abdomen and pelvis was performed employing 5 mm sections. 100 cc of non-ionic intravenous contrast was administered intravenously.",
            "indication": history if history != "Not provided" else "Evaluation of renal mass / hematuria / flank pain",
            "findings_liver": "Liver is normal in size and attenuation. No focal lesion. CBD and portal vein are normal.",
            "findings_gallbladder": "Gallbladder is normal. No calculi or wall thickening.",
            "findings_pancreas": "Pancreas is normal in size, shape, and density. No ductal dilatation.",
            "findings_spleen": "Spleen is normal in size and architecture.",
            "findings_right_kidney": "A heterogeneous solid mass is identified in the right kidney with irregular margins. Significant arterial phase enhancement with washout on delayed phase — pattern suspicious for renal cell carcinoma.",
            "findings_left_kidney": "Left kidney is normal in size, shape, and parenchymal enhancement. No focal lesion.",
            "findings_collecting_system": "Mild pelvicalyceal prominence on affected side. Contralateral collecting system not dilated.",
            "findings_urinary_bladder": "Urinary bladder is adequately distended with smooth walls. No intraluminal filling defect.",
            "findings_adrenals": "Both adrenal glands are normal.",
            "findings_vessels": "Aorta and IVC are normal. No significant lymphadenopathy.",
            "findings_others": "No free fluid or free air. Visualized bowel loops are unremarkable.",
            "impression": "1. Solid renal mass with enhancement pattern suspicious for Renal Cell Carcinoma (RCC). Bosniak Category IV.\n2. No evidence of distant metastasis on this study.\n3. Urgent urology referral recommended.",
            "recommendation": "1. Urgent urology referral within 1-2 weeks.\n2. MRI abdomen for further characterization.\n3. CT chest for metastatic workup.\n4. Laboratory: CBC, CMP, serum creatinine.\n5. Multidisciplinary tumor board discussion recommended.",
            "ai_confidence": f"{confidence}% — Tumor detected"
        },
        "Cyst": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis",
            "technique": "Plain and contrast-enhanced spiral CT scan performed employing 5 mm sections. 100 cc of non-ionic intravenous contrast administered.",
            "indication": history if history != "Not provided" else "Evaluation of incidentally detected renal lesion",
            "findings_liver": "Liver is normal in size and echotexture. No focal lesion.",
            "findings_gallbladder": "Gallbladder is normal. No calculi.",
            "findings_pancreas": "Pancreas is normal.",
            "findings_spleen": "Spleen is normal.",
            "findings_right_kidney": "Right kidney is normal in size, shape, and parenchymal density. No focal lesion or hydronephrosis.",
            "findings_left_kidney": "A well-circumscribed hypodense lesion noted with near-water attenuation. No internal septations, calcifications, or solid components. No post-contrast enhancement.",
            "findings_collecting_system": "Bilateral collecting systems are not dilated. No hydroureteronephrosis.",
            "findings_urinary_bladder": "Urinary bladder is normal with smooth walls.",
            "findings_adrenals": "Both adrenal glands are normal.",
            "findings_vessels": "Aorta and IVC are within normal limits. No lymphadenopathy.",
            "findings_others": "No free fluid or free air.",
            "impression": "1. Simple renal cyst — Bosniak Category I.\n2. No features to suggest malignancy.\n3. No intervention required. Annual surveillance recommended.",
            "recommendation": "1. No immediate intervention required.\n2. Annual renal ultrasound for surveillance.\n3. Return if symptoms develop.",
            "ai_confidence": f"{confidence}% — Cyst detected"
        },
        "Stone": {
            "scan_type": "CT Scan — Kidneys, Ureters and Bladder (CT KUB) — Non-Contrast Protocol",
            "technique": "Non-contrast spiral CT scan performed employing 3 mm sections from dome of diaphragm to pubic symphysis.",
            "indication": history if history != "Not provided" else "Evaluation of renal colic / flank pain / hematuria",
            "findings_liver": "Liver is normal in size and attenuation.",
            "findings_gallbladder": "Gallbladder is normal. No calculi.",
            "findings_pancreas": "Pancreas is normal.",
            "findings_spleen": "Spleen is normal.",
            "findings_right_kidney": "A hyperdense calculus identified with high Hounsfield units consistent with calcium oxalate composition. Mild hydroureteronephrosis noted proximal to the calculus. Mild perinephric fat stranding consistent with active ureteral colic.",
            "findings_left_kidney": "Left kidney is normal in size, outline, and echopattern. No calculus or hydronephrosis.",
            "findings_collecting_system": "Hydroureteronephrosis on affected side secondary to obstructing calculus. Contralateral collecting system is not dilated.",
            "findings_urinary_bladder": "Urinary bladder is partially distended with normal walls.",
            "findings_adrenals": "Both adrenal glands are normal.",
            "findings_vessels": "Aorta and IVC are normal. No lymphadenopathy.",
            "findings_others": "No free fluid or free air.",
            "impression": "1. Obstructing renal calculus with associated hydroureteronephrosis.\n2. Perinephric fat stranding consistent with active ureteral colic.\n3. Urgent urological evaluation recommended.",
            "recommendation": "1. Urgent urology consultation within 24-48 hours.\n2. Adequate analgesia as needed.\n3. High fluid intake: minimum 2.5-3 litres per day.\n4. Repeat CT KUB in 4-6 weeks if conservative management pursued.",
            "ai_confidence": f"{confidence}% — Stone detected"
        },
        "Normal": {
            "scan_type": "Contrast-Enhanced CT Scan of Abdomen and Pelvis",
            "technique": "Plain and contrast-enhanced spiral CT scan performed employing 5 mm sections. 100 cc of non-ionic intravenous contrast administered.",
            "indication": history if history != "Not provided" else "Evaluation of abdominal pain / routine screening",
            "findings_liver": "Liver is normal in size, shape, and architecture. No mass lesion or calcification. No intrahepatic biliary dilatation. CBD and portal vein are normal.",
            "findings_gallbladder": "Gallbladder reveals normal lumen and walls. No calculus or wall thickening.",
            "findings_pancreas": "Pancreas is normal in size and density. Uniform enhancement on post-contrast images. No calcification or ductal dilatation.",
            "findings_spleen": "Spleen is normal in size and architecture.",
            "findings_right_kidney": "Right kidney is normal in size, shape, and position. Normal corticomedullary differentiation. Symmetric homogeneous enhancement. No focal cortical lesion, calculus, or mass.",
            "findings_left_kidney": "Left kidney is normal in size, shape, and position. Normal corticomedullary differentiation. No focal lesion, cyst, calculus, or hydronephrosis.",
            "findings_collecting_system": "Bilateral collecting systems are not dilated. No hydroureteronephrosis.",
            "findings_urinary_bladder": "Urinary bladder is adequately distended with smooth walls. No intraluminal filling defect.",
            "findings_adrenals": "Both adrenal glands are normal in size and attenuation.",
            "findings_vessels": "Aorta and IVC are normal in position and caliber. No significant lymphadenopathy.",
            "findings_others": "Stomach and bowel loops show normal caliber. No ascites or free air.",
            "impression": "1. No significant renal pathology identified.\n2. Both kidneys are normal in size, morphology, and enhancement.\n3. No urolithiasis, hydronephrosis, renal mass, or cystic lesion.",
            "recommendation": "1. No renal intervention required.\n2. Continue routine annual health maintenance.\n3. Repeat imaging only if new symptoms develop.",
            "ai_confidence": f"{confidence}% — Normal detected"
        }
    }

    data = FINDINGS.get(prediction, FINDINGS["Normal"])

    if mode == "doctor":
        return {k: v for k, v in data.items()}
    else:
        PATIENT = {
            "Tumor": {
                "what_found": "The CT scan has detected an abnormal solid growth on your kidney. This requires urgent medical attention.",
                "what_it_means": "A solid mass on the kidney can sometimes indicate kidney cancer. Only a specialist can confirm this after further tests.",
                "is_it_serious": "This finding is serious and requires prompt attention. Many kidney masses are treated successfully when found early.",
                "what_to_do": "1. Book an appointment with a urologist immediately.\n2. Your doctor will order MRI or blood tests.\n3. Bring this report to your appointment.",
                "reassurance": "Your doctor will guide you through every step. You are not alone in this process."
            },
            "Cyst": {
                "what_found": "The CT scan found a simple fluid-filled sac called a cyst on your kidney.",
                "what_it_means": "Simple kidney cysts are very common and almost always harmless. They are not cancer.",
                "is_it_serious": "This is a low severity finding. Simple cysts rarely cause problems.",
                "what_to_do": "1. Share this report with your doctor.\n2. Get a kidney ultrasound in about 12 months.\n3. Drink plenty of water daily.",
                "reassurance": "This is a very common and harmless finding. Continue your normal life."
            },
            "Stone": {
                "what_found": "The CT scan found a kidney stone causing a mild blockage.",
                "what_it_means": "Kidney stones are hard deposits that can cause severe pain. The blockage means urine is not draining properly.",
                "is_it_serious": "This needs medical attention within 1-2 days.",
                "what_to_do": "1. See a urologist within 1-2 days.\n2. Drink 2.5-3 litres of water daily.\n3. Go to emergency if you develop fever or severe pain.",
                "reassurance": "Kidney stones are very common and highly treatable."
            },
            "Normal": {
                "what_found": "Great news! The CT scan did not find any problems with your kidneys.",
                "what_it_means": "Your kidneys appear healthy and functioning normally.",
                "is_it_serious": "This is not a serious finding. No urgent action required.",
                "what_to_do": "1. Share with your doctor for final confirmation.\n2. Continue drinking plenty of water.\n3. Attend routine annual checkups.",
                "reassurance": "A normal scan is great news. Continue taking care of your health."
            }
        }
        return PATIENT.get(prediction, PATIENT["Normal"])