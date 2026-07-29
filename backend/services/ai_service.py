from google import genai
from google.genai import types
from core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential
import json

class AIService:
    def __init__(self):
        try:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self.model_name = "gemini-flash-latest"
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            self.client = None
            self.model_name = None

    def get_models_to_try(self):
        default_models = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ]
        try:
            if self.client:
                available = []
                for m in self.client.models.list():
                    name = m.name.replace("models/", "") if m.name.startswith("models/") else m.name
                    if any(x in name for x in ["flash", "pro", "gemini"]) and not any(k in name for k in ["image", "tts", "audio", "embedding", "robotics", "computer-use", "live"]):
                        available.append(name)
                if available:
                    flash_models = [m for m in available if "flash" in m]
                    other_models = [m for m in available if "flash" not in m]
                    return flash_models + other_models
        except Exception as e:
            print(f"Could not dynamically list models: {e}")
        return default_models

    @retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=2, min=4, max=20))
    def analyze_document(self, text_content: str):
        if not self.client:
            return {
                "summary": "AI summarization disabled (No API key).",
                "category": "Uncategorized",
                "medications": [],
                "important_terms": []
            }
            
        prompt = f"""
        Analyze the following medical document. You are an expert medical AI.
        
        CRITICAL: Your output MUST be EXACTLY in the following JSON format, with no markdown formatting, no code blocks, and no extra text. Do NOT wrap the output in ```json ... ```. Output raw JSON only.

        {{
            "ai_summary": "A 2-4 sentence summary of the document in plain English.",
            "category": "One of: Prescription, Lab Report, Discharge Summary, Scan, or Other",
            "medications": [
                {{
                    "medicine_name": "Name of medicine",
                    "dosage": "Dosage (e.g. 500mg)",
                    "frequency": "Frequency (e.g. Twice a day)",
                    "duration": "Duration (e.g. 5 days)"
                }}
            ],
            "important_terms": [
                {{
                    "term": "Medical term",
                    "explanation": "Simple explanation"
                }}
            ]
        }}

        Document Text:
        {text_content}
        """
        models_to_try = self.get_models_to_try()
        
        last_error = None
        
        for model in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                text = response.text
                if text.startswith('```json'):
                    text = text.replace('```json', '').replace('```', '')
                data = json.loads(text.strip())
                return data
            except Exception as e:
                print(f"Model {model} failed: {e}")
                last_error = e
                continue
                
        print(f"All AI models failed. Last error: {last_error}")
        return {
            "ai_summary": f"Failed to analyze document. Error: {str(last_error)}",
            "category": "Uncategorized",
            "medications": [],
            "important_terms": []
        }

    async def compare_documents(self, doc1_text: str, doc2_text: str, doc1_title: str = "Document 1", doc2_title: str = "Document 2") -> str:
        prompt = f"""
        You are an expert medical AI. You have been provided with two medical documents to compare. 
        Note that these documents may be entirely unrelated (e.g., different patients, different conditions) or they could be a chronological progression for the same patient. Evaluate them objectively based on their contents.
        
        {doc1_title}:
        {doc1_text}
        
        {doc2_title}:
        {doc2_text}
        
        Compare the two documents and provide a highly organized, professional summary of the differences or changes. 
        
        You MUST structure your response as a GitHub-flavored Markdown Table containing exactly these four columns:
        | Metric / Finding | {doc1_title} | {doc2_title} | Comparison / Trend |
        
        Focus on:
        1. Key metrics, biomarkers, or clinical findings that differ or have changed.
        2. A clear summary paragraph above or below the table comparing the overarching clinical pictures.
        3. Any differing medications or diagnoses.
        
        Do NOT output raw JSON. Only output beautiful, strictly formatted markdown.
        """
        
        models_to_try = self.get_models_to_try()

        for model_name in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Comparison failed for model {model_name}: {e}")
                continue
                
        raise Exception("All models failed to compare the documents. Please try again later.")

ai_service = AIService()
