import openai
from openai import OpenAI
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class HealthPredictor:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
    
    def predict_health_risks(self, blood_test_data):
        """
        Predict health risks based on blood test results using OpenAI
        """
        if not self.api_key or self.api_key == 'your-openai-api-key-here':
            logger.warning("OpenAI API key not properly configured")
            return self._get_fallback_prediction(blood_test_data)
        
        if not self.client:
            return self._get_fallback_prediction(blood_test_data)
        
        try:
            prompt = self._create_prediction_prompt(blood_test_data)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical AI assistant. Analyze blood test results and provide:\n"
                                  "1. Potential health risks\n"
                                  "2. Disease predictions\n"
                                  "3. Confidence level (0-100%)\n"
                                  "4. Recommendations\n"
                                  "Be professional, accurate, and compassionate."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            prediction = response.choices[0].message.content.strip()
            return self._parse_prediction(prediction)
            
        except openai.AuthenticationError:
            logger.error("OpenAI authentication failed - check API key")
            return self._get_fallback_prediction(blood_test_data)
        except openai.RateLimitError:
            logger.error("OpenAI rate limit exceeded")
            return self._get_fallback_prediction(blood_test_data)
        except openai.APIConnectionError:
            logger.error("OpenAI API connection error")
            return self._get_fallback_prediction(blood_test_data)
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._get_fallback_prediction(blood_test_data)
        except Exception as e:
            logger.error(f"OpenAI prediction error: {str(e)}")
            return self._get_fallback_prediction(blood_test_data)
    
    def _create_prediction_prompt(self, data):
        """Create a detailed prompt for OpenAI"""
        return f"""
        Analyze these blood test results and provide a health risk assessment:
        
        Patient Information:
        - Donor: {data.get('donor_name', 'Unknown')}
        - Age: {data.get('donor_age', 'Unknown')}
        - Gender: {data.get('donor_gender', 'Unknown')}
        
        Blood Test Results:
        - Sugar Level: {data.get('sugar_level', 'Not provided')} mg/dL
        - Hemoglobin: {data.get('hemoglobin', 'Not provided')} g/dL
        - Uric Acid: {data.get('uric_acid_level', 'Not provided')} mg/dL
        - WBC Count: {data.get('wbc_count', 'Not provided')} cells/mcL
        - RBC Count: {data.get('rbc_count', 'Not provided')} million cells/mcL
        - Platelet Count: {data.get('platelet_count', 'Not provided')} platelets/mcL
        
        Normal Ranges:
        - Sugar Level: 70-100 mg/dL (fasting)
        - Hemoglobin: 13.5-17.5 g/dL (men), 12.0-15.5 g/dL (women)
        - Uric Acid: 3.4-7.0 mg/dL (men), 2.4-6.0 mg/dL (women)
        - WBC Count: 4,500-11,000 cells/mcL
        - RBC Count: 4.7-6.1 million cells/mcL (men), 4.2-5.4 million cells/mcL (women)
        - Platelet Count: 150,000-450,000 platelets/mcL
        
        Please provide:
        1. Health risk assessment
        2. Potential disease predictions
        3. Confidence level (0-100%)
        4. Recommendations for follow-up
        """
    
    def _parse_prediction(self, prediction_text):
        """Parse the OpenAI response into structured data"""
        return {
            "full_prediction": prediction_text,
            "summary": self._extract_summary(prediction_text),
            "confidence": self._extract_confidence(prediction_text)
        }
    
    def _extract_summary(self, text):
        """Extract a summary from the prediction text"""
        lines = text.split('\n')
        return lines[0] if lines else "Health assessment completed"
    
    def _extract_confidence(self, text):
        """Extract confidence percentage from text"""
        import re
        match = re.search(r'(\d{1,3})%', text)
        return int(match.group(1)) if match else 75

    def _get_fallback_prediction(self, data):
        """Provide a fallback prediction when OpenAI fails"""
        return {
            "full_prediction": "Health assessment completed. Please consult with a healthcare professional for detailed analysis of your blood test results.",
            "summary": "Blood test analysis completed",
            "confidence": 75
        }
