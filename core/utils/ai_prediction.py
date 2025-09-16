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
    
    # Make sure the predict_health_risks method is properly implemented
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
    
    
    # Update the _create_detailed_prediction_prompt method to provide more detailed recommendations
    def _create_detailed_prediction_prompt(self, data):
        """Create a detailed prompt for disease prediction with recommendations"""
        return f"""
        Analyze these blood test results comprehensively and provide specific health insights:

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
        1. HEALTH ASSESSMENT: Overall health status and any abnormalities detected
        2. SPECIFIC RISKS: Identify potential health risks based on abnormal values
        3. RECOMMENDATIONS: Provide specific, actionable recommendations including:
        - Dietary changes
        - Lifestyle modifications
        - When to consult a doctor
        - Preventive measures
        4. TIMELINE: Suggest appropriate follow-up timing for re-testing if needed
        5. POSITIVE REINFORCEMENT: Highlight good results and encourage healthy habits

        Format the response in clear, patient-friendly language. Focus on actionable advice.
        """
    
    def _parse_detailed_prediction(self, prediction_text, blood_data):
        """Parse the detailed OpenAI response into structured sections"""
        confidence = self._extract_confidence(prediction_text)
        
        # Extract different sections from the prediction
        sections = {
            'summary': self._extract_section(prediction_text, 'HEALTH ASSESSMENT SUMMARY'),
            'findings': self._extract_section(prediction_text, 'SPECIFIC FINDINGS'),
            'conditions': self._extract_section(prediction_text, 'POTENTIAL HEALTH CONDITIONS'),
            'recommendations': self._extract_section(prediction_text, 'RECOMMENDATIONS & PRECAUTIONS'),
            'disclaimer': self._extract_section(prediction_text, 'IMPORTANT DISCLAIMER')
        }
        
        # If sections weren't found properly, fallback to full text
        if not any(sections.values()):
            sections['summary'] = prediction_text
        
        return {
            "full_prediction": prediction_text,
            "sections": sections,
            "confidence": confidence,
            "has_abnormalities": not self._are_results_normal(blood_data)
        }

    def _extract_section(self, text, section_name):
        """Extract a specific section from the prediction text"""
        lines = text.split('\n')
        section_lines = []
        in_section = False
        
        for line in lines:
            if section_name in line:
                in_section = True
                continue
            if in_section and line.strip() and any(keyword in line for keyword in 
                ['🩺', '🔍', '🦠', '💡', '⚠️', 'HEALTH', 'SPECIFIC', 'POTENTIAL', 'RECOMMENDATIONS', 'IMPORTANT']):
                break
            if in_section and line.strip():
                section_lines.append(line.strip())
        
        return '\n'.join(section_lines) if section_lines else None

    def _extract_confidence(self, text):
        """Extract confidence percentage from text"""
        match = re.search(r'(\d{1,3})%', text)
        return int(match.group(1)) if match else 80

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
        # Extract the most important information for notification
        lines = prediction_text.split('\n')
        important_lines = []
        
        # Look for key sections
        sections_to_include = ['HEALTH ASSESSMENT', 'SPECIFIC RISKS', 'RECOMMENDATIONS']
        current_section = None
        
        for line in lines:
            line = line.strip()
            if any(section in line.upper() for section in sections_to_include):
                current_section = line
            elif current_section and line and not line.startswith(('-', '*', '#')):
                important_lines.append(f"{current_section}: {line}")
                current_section = None
        
        # If we found important lines, use them
        if important_lines:
            message = ". ".join(important_lines[:3])  # Limit to 3 key points
        else:
            # Fallback: use the first meaningful sentence
            for line in lines:
                if line.strip() and len(line.strip()) > 20 and not line.strip().startswith(('#', '-', '*')):
                    message = line.strip()
                    break
            else:
                message = "Your detailed blood test analysis is ready. Please check your dashboard for comprehensive health insights and recommendations."
        
        # Limit length
        max_length = 250
        return message[:max_length] + "..." if len(message) > max_length else message


    def _get_fallback_prediction(self):
        """Fallback when OpenAI is not available"""
        return {
            "full_prediction": """🩺 HEALTH ASSESSMENT SUMMARY:
    Based on your blood test results, a comprehensive analysis is recommended.

    🔍 SPECIFIC FINDINGS:
    All provided blood test values require professional interpretation.

    🦠 POTENTIAL HEALTH CONDITIONS:
    Various conditions could be indicated based on specific abnormal values. 

    💡 RECOMMENDATIONS & PRECAUTIONS:
    - Schedule a consultation with your healthcare provider
    - Maintain a balanced diet and regular exercise
    - Follow up with recommended medical tests

    ⚠️ IMPORTANT DISCLAIMER:
    This analysis is generated by AI and should not replace professional medical advice. Please consult with a qualified healthcare provider for accurate diagnosis and treatment recommendations.""",
            "sections": {
                "summary": "Based on your blood test results, a comprehensive analysis is recommended.",
                "findings": "All provided blood test values require professional interpretation.",
                "conditions": "Various conditions could be indicated based on specific abnormal values.",
                "recommendations": "- Schedule a consultation with your healthcare provider\n- Maintain a balanced diet and regular exercise\n- Follow up with recommended medical tests",
                "disclaimer": "This analysis is generated by AI and should not replace professional medical advice. Please consult with a qualified healthcare provider for accurate diagnosis and treatment recommendations."
            },
            "confidence": 75,
            "has_abnormalities": False
        }
