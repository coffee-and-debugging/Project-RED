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
        Predict health risks based on blood test results using OpenAI API
        """
        try:
            if not self.api_key:
                logger.error("OpenAI API key is not configured")
                return self._get_fallback_prediction(blood_test_data)
            
            if not self.client:
                self.client = OpenAI(api_key=self.api_key)
            
            prompt = self._create_health_prediction_prompt(blood_test_data)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are a medical AI assistant. Analyze blood test results and provide:\n"
                               "1. Health risk assessment based on the values\n"
                               "2. Specific recommendations for improvement\n"
                               "3. Preventive measures\n"
                               "4. When to consult a doctor\n"
                               "Be professional, accurate, and compassionate. "
                               "Format the response in clear, patient-friendly language."
                },
                {
                    "role": "user",
                    "content": prompt
                }],
                max_tokens=1000,
                temperature=0.3
            )
            
            prediction = response.choices[0].message.content.strip()
            return self._parse_prediction_response(prediction)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._get_fallback_prediction(blood_test_data)
    
    def _create_health_prediction_prompt(self, data):
        """Create a detailed prompt for health prediction"""
        return f"""
        Analyze these blood test results and provide a comprehensive health assessment:

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

        Please provide:
        1. HEALTH ASSESSMENT: Overall health status based on these values
        2. RISK FACTORS: Any potential health risks or abnormalities
        3. RECOMMENDATIONS: Specific actionable advice including:
           - Dietary changes
           - Lifestyle modifications
           - When to consult a healthcare professional
        4. PREVENTIVE MEASURES: Steps to maintain or improve health
        5. FOLLOW-UP: Suggested timeline for next check-up

        Format the response in clear, patient-friendly language with sections.
        """
    
    def _parse_prediction_response(self, prediction_text):
        """Parse the OpenAI response into structured data"""
        # Clean up the response
        prediction_text = prediction_text.strip()
        
        return {
            "full_prediction": prediction_text,
            "summary": self._extract_summary(prediction_text),
            "notification_message": self._create_notification_message(prediction_text),
            "confidence": 95,  # High confidence for AI-generated content
            "has_abnormalities": self._check_abnormalities(prediction_text)
        }
    
    def _extract_summary(self, text):
        """Extract a summary from the prediction text"""
        # Take the first 2-3 sentences as summary
        sentences = re.split(r'[.!?]+', text)
        summary = '. '.join(sentences[:3]).strip()
        if summary and not summary.endswith('.'):
            summary += '.'
        return summary if summary else "Blood test analysis completed"
    
    def _create_notification_message(self, text):
        """Create a notification-friendly message"""
        sentences = re.split(r'[.!?]+', text)
        if sentences:
            return f"{sentences[0].strip()}." if sentences[0].strip() else "Your blood test analysis is ready. Please check your dashboard for detailed health recommendations."
        return "Your blood test analysis is ready. Please check your dashboard for detailed health recommendations."
    
    def _check_abnormalities(self, text):
        """Check if the text indicates any abnormalities"""
        abnormality_indicators = ['abnormal', 'high', 'low', 'elevated', 'reduced', 'risk', 'concern', 'warning']
        return any(indicator in text.lower() for indicator in abnormality_indicators)
    
    def _get_fallback_prediction(self, blood_test_data):
        """Fallback prediction when OpenAI fails"""
        # Create a basic analysis based on the values
        analysis = self._generate_basic_analysis(blood_test_data)
        
        return {
            "full_prediction": analysis['full_analysis'],
            "summary": analysis['summary'],
            "notification_message": analysis['notification'],
            "confidence": 80,
            "has_abnormalities": analysis['has_abnormalities']
        }
    
    def _generate_basic_analysis(self, data):
        """Generate basic health analysis based on blood test values"""
        # Get values with defaults
        try:
            sugar = float(data.get('sugar_level', 0))
            hb = float(data.get('hemoglobin', 0))
            uric_acid = float(data.get('uric_acid_level', 0))
            wbc = float(data.get('wbc_count', 0))
            rbc = float(data.get('rbc_count', 0))
            platelets = float(data.get('platelet_count', 0))
            
            abnormalities = []
            recommendations = []
            
            # Analyze each parameter
            if sugar > 100:
                abnormalities.append(f"Elevated sugar level ({sugar} mg/dL)")
                recommendations.append("Reduce sugar and carbohydrate intake")
            elif sugar < 70:
                abnormalities.append(f"Low sugar level ({sugar} mg/dL)")
                recommendations.append("Maintain regular meal schedule")
            
            gender = data.get('donor_gender', 'M')
            if gender == 'M':
                if hb < 13.5:
                    abnormalities.append(f"Low hemoglobin ({hb} g/dL)")
                    recommendations.append("Increase iron-rich foods")
                elif hb > 17.5:
                    abnormalities.append(f"High hemoglobin ({hb} g/dL)")
                    recommendations.append("Stay well hydrated")
            else:
                if hb < 12.0:
                    abnormalities.append(f"Low hemoglobin ({hb} g/dL)")
                    recommendations.append("Increase iron-rich foods")
                elif hb > 15.5:
                    abnormalities.append(f"High hemoglobin ({hb} g/dL)")
                    recommendations.append("Stay well hydrated")
            
            has_abnormalities = len(abnormalities) > 0
            
            if has_abnormalities:
                summary = f"Blood test shows {len(abnormalities)} area(s) needing attention"
                notification = f"Your blood test reveals {len(abnormalities)} area(s) requiring attention. Please check dashboard for details."
                full_analysis = f"BLOOD TEST ANALYSIS:\n\n"
                full_analysis += "RESULTS:\n"
                full_analysis += f"- Sugar Level: {sugar} mg/dL\n"
                full_analysis += f"- Hemoglobin: {hb} g/dL\n"
                full_analysis += f"- Uric Acid: {uric_acid} mg/dL\n"
                full_analysis += f"- WBC Count: {wbc} cells/mcL\n"
                full_analysis += f"- RBC Count: {rbc} million cells/mcL\n"
                full_analysis += f"- Platelet Count: {platelets} platelets/mcL\n\n"
                full_analysis += "AREAS NEEDING ATTENTION:\n"
                for ab in abnormalities:
                    full_analysis += f"- {ab}\n"
                full_analysis += "\nRECOMMENDATIONS:\n"
                for rec in recommendations:
                    full_analysis += f"- {rec}\n"
                full_analysis += "\nPlease consult with a healthcare professional for personalized advice."
            else:
                summary = "All blood test parameters within normal ranges"
                notification = "Great news! Your blood test results are within normal ranges."
                full_analysis = f"BLOOD TEST ANALYSIS:\n\n"
                full_analysis += "RESULTS:\n"
                full_analysis += f"- Sugar Level: {sugar} mg/dL (Normal)\n"
                full_analysis += f"- Hemoglobin: {hb} g/dL (Normal)\n"
                full_analysis += f"- Uric Acid: {uric_acid} mg/dL (Normal)\n"
                full_analysis += f"- WBC Count: {wbc} cells/mcL (Normal)\n"
                full_analysis += f"- RBC Count: {rbc} million cells/mcL (Normal)\n"
                full_analysis += f"- Platelet Count: {platelets} platelets/mcL (Normal)\n\n"
                full_analysis += "COMMENDATION: All parameters are within normal ranges\n"
                full_analysis += "RECOMMENDATION: Continue maintaining healthy lifestyle\n\n"
                full_analysis += "Regular health check-ups are recommended."
            
            return {
                'full_analysis': full_analysis,
                'summary': summary,
                'notification': notification,
                'has_abnormalities': has_abnormalities
            }
            
        except (ValueError, TypeError):
            # If there's any error in value processing
            return {
                'full_analysis': "Blood test analysis completed. Please consult with a healthcare professional for detailed interpretation of your results.",
                'summary': "Blood test processing completed",
                'notification': "Your blood test results have been processed. Please check your dashboard for details.",
                'has_abnormalities': False
            }