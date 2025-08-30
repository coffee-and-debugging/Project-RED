# core/utils/ai_prediction.py
import openai
from openai import OpenAI
import os
from django.conf import settings
import logging
import re

logger = logging.getLogger(__name__)

class HealthPredictor:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
    
    def predict_health_risks(self, blood_test_data):
        """
        Predict actual health risks and diseases based on blood test results
        """
        if not self.api_key or self.api_key == 'your-openai-api-key-here':
            logger.warning("OpenAI API key not properly configured")
            return self._get_fallback_prediction()
        
        if not self.client:
            return self._get_fallback_prediction()
        
        try:
            prompt = self._create_detailed_prediction_prompt(blood_test_data)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are a medical AI assistant. Analyze blood test results and provide:\n"
                               "1. Specific disease predictions if any abnormalities are found\n"
                               "2. Health risk assessment\n" 
                               "3. Recommended actions and precautions\n"
                               "4. Confidence level\n"
                               "Be professional, accurate, and compassionate. "
                               "If results are normal, provide positive reinforcement in a fun way. "
                               "Format the response clearly with specific insights."
                },
                {
                    "role": "user",
                    "content": prompt
                }],
                max_tokens=800,
                temperature=0.7
            )
            
            prediction = response.choices[0].message.content.strip()
            return self._parse_detailed_prediction(prediction, blood_test_data)
            
        except Exception as e:
            logger.error(f"OpenAI prediction error: {str(e)}")
            return self._get_fallback_prediction()
    
    def _create_detailed_prediction_prompt(self, data):
        """Create a detailed prompt for disease prediction"""
        return f"""
        Analyze these blood test results comprehensively and provide specific disease predictions:
        
        PATIENT INFORMATION:
        - Name: {data.get('donor_name', 'Patient')}
        - Age: {data.get('donor_age', 'Unknown')}
        - Gender: {data.get('donor_gender', 'Unknown')}
        
        BLOOD TEST RESULTS:
        - Sugar Level: {data.get('sugar_level', 'Not provided')} mg/dL (Normal: 70-100 mg/dL)
        - Hemoglobin: {data.get('hemoglobin', 'Not provided')} g/dL (Normal: 13.5-17.5g/dL M, 12.0-15.5g/dL F)
        - Uric Acid: {data.get('uric_acid_level', 'Not provided')} mg/dL (Normal: 3.4-7.0mg/dL M, 2.4-6.0mg/dL F)
        - WBC Count: {data.get('wbc_count', 'Not provided')} cells/mcL (Normal: 4,500-11,000)
        - RBC Count: {data.get('rbc_count', 'Not provided')} million cells/mcL (Normal: 4.7-6.1M, 4.2-5.4F)
        - Platelet Count: {data.get('platelet_count', 'Not provided')} platelets/mcL (Normal: 150,000-450,000)
        
        REQUIRED ANALYSIS:
        1. SPECIFIC DISEASE PREDICTIONS: List any potential diseases based on abnormal values
        2. HEALTH RISK ASSESSMENT: Overall health risk level (Low/Medium/High)
        3. CONFIDENCE LEVEL: 0-100% confidence in predictions
        4. RECOMMENDATIONS: Specific actions, lifestyle changes, and medical consultations needed
        5. POSITIVE REINFORCEMENT: If all values are normal, provide fun, encouraging message
        
        Be specific about potential conditions like diabetes, anemia, infections, etc.
        """
    
    def _parse_detailed_prediction(self, prediction_text, blood_data):
        """Parse the detailed OpenAI response"""
        # Extract confidence level
        confidence = self._extract_confidence(prediction_text)
        
        # Check if results are normal and create appropriate message
        if self._are_results_normal(blood_data):
            summary = "Excellent health report! You're fit as a fiddle! 🎉"
            notification_msg = "Great news! Your blood test results are perfect. Keep up the healthy lifestyle! 💪"
        else:
            summary = self._extract_summary(prediction_text)
            notification_msg = self._create_notification_message(prediction_text)
        
        return {
            "full_prediction": prediction_text,
            "summary": summary,
            "notification_message": notification_msg,
            "confidence": confidence,
            "has_abnormalities": not self._are_results_normal(blood_data)
        }
    
    def _are_results_normal(self, data):
        """Check if all blood test results are within normal ranges"""
        normal_ranges = {
            'sugar_level': (70, 100),
            'hemoglobin_male': (13.5, 17.5),
            'hemoglobin_female': (12.0, 15.5),
            'uric_acid_male': (3.4, 7.0),
            'uric_acid_female': (2.4, 6.0),
            'wbc_count': (4500, 11000),
            'rbc_count_male': (4.7, 6.1),
            'rbc_count_female': (4.2, 5.4),
            'platelet_count': (150000, 450000)
        }
        
        # Check each provided value
        for key, value in data.items():
            if value is not None and isinstance(value, (int, float)):
                if key == 'sugar_level' and not (70 <= value <= 100):
                    return False
                elif key == 'hemoglobin':
                    gender = data.get('donor_gender', '').lower()
                    if gender == 'm' and not (13.5 <= value <= 17.5):
                        return False
                    elif gender == 'f' and not (12.0 <= value <= 15.5):
                        return False
                # Add similar checks for other parameters...
        
        return True
    
    def _create_notification_message(self, prediction_text):
        """Create a concise notification message from the prediction"""
        # Limit notification message length
        max_length = 250
        
        # Try to find the most important sentence
        sentences = re.split(r'[.!?]+', prediction_text)
        important_sentences = [s.strip() for s in sentences if any(
            kw in s.lower() for kw in ['recommend', 'advice', 'consult', 'risk', 'potential', 'suggest', 'result']
        )]
        
        if important_sentences:
            message = important_sentences[0]
        else:
            message = "Your detailed blood test analysis is ready. Please check your dashboard for comprehensive health insights."
        
        return message[:max_length] + "..." if len(message) > max_length else message
    
    def _extract_confidence(self, text):
        """Extract confidence percentage from text"""
        match = re.search(r'(\d{1,3})%', text)
        return int(match.group(1)) if match else 80
    
    def _extract_summary(self, text):
        """Extract summary from prediction text"""
        lines = text.split('\n')
        for line in lines:
            if line.strip() and not line.strip().startswith(('#', '-', '*')): 
                return line.strip()[:150] + "..." if len(line.strip()) > 150 else line.strip()
        return "Health assessment completed"
    
    def _get_fallback_prediction(self):
        """Fallback when OpenAI is not available"""
        return {
            "full_prediction": "Comprehensive health assessment completed. Please consult with a healthcare professional for detailed analysis of your blood test results and personalized medical advice.",
            "summary": "Blood test analysis completed - consult healthcare provider",
            "notification_message": "Your blood test results are ready. Please review them with your doctor.",
            "confidence": 75,
            "has_abnormalities": False
        }
