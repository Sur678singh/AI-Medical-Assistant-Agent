from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langgraph.graph import StateGraph,START,END
from typing import TypedDict
import easyocr,shutil,os,re
from fastapi import FastAPI,UploadFile,File,Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ************************************* LLM and Load Env ******************************************
load_dotenv()
# llm 
llm=ChatGroq(model='llama-3.3-70b-versatile')

# ************************************* FastAPI Server *******************************************
app=FastAPI()
# add fastapi through backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# *********************************Serve Frontend UI****************************
app.mount("/public",StaticFiles(directory='public'),name='public')
# get request from server
@app.get("/")
def serve_frontend():
    return FileResponse("public/index.html")

# ************************************* STATE *****************************************************
class MedicalState(TypedDict):
    query:str
    category:str
    image_path:str
    ocr_report:str
    answer:str

# used easyocr
reader=easyocr.Reader(['en'])

# ************************************ Graph functions ******************************************
# router node functions
def router_agent(state: MedicalState):

    query = state['query'].lower()

    image_path = state.get("image_path", "")

    # If image uploaded
    if image_path:

        if "prescription" in query:

            return {'category': 'prescription'}

        return {'category': 'report'}

    # Symptom keywords
    symptom_words = [

        'fever',

        'pain',

        'cough',

        'headache',

        'cold',

        'vomiting'
    ]

    if any(word in query for word in symptom_words):

        return {'category': 'symptom'}

    return {'category': 'general'}

# symptoms checker functions
def symptom_agent(state:MedicalState):
    query=state['query']
    prompt=f"""
You are an AI Medical Symptom Analyzer.

Analyze the user's symptoms carefully and provide a professional yet easy-to-understand response.

User Symptoms:
{query}

Return the response in the following format:

## Possible Condition
- Mention possible health conditions.

## Recommended Precautions
- Mention simple precautions and safety measures.

## Basic Advice
- Provide short and practical health advice.

Guidelines:
- Keep the response concise and structured.
- Avoid making definitive diagnoses.
- Use simple and professional language.
"""
    response=llm.invoke(prompt).content
    return {'answer':response}

# normal chat functions
def general_chat(state:MedicalState):
    query=state['query']
    prompt=f"""You are a professional AI Medical Assistant.
Answer the following medical query in a clean, structured, and professional format.
User Query:
{query}
Return response in this format ONLY:

## Overview
Short explanation.

## Causes
- Point 1
- Point 2

## Prevention / Solution
- Point 1
- Point 2

## Advice
- Point 1
- Point 2

Guidelines:
- Keep response concise.
- Use simple medical language.
- Use headings and bullet points properly.
- Avoid large paragraphs.
"""
    res=llm.invoke(prompt).content
    return {'answer':res}

# ocr node function
def ocr_text(state: MedicalState):
    image_path = state.get('image_path', '')

    if not image_path:

        return {'ocr_report': 'No image uploaded'}

    result = reader.readtext(image_path,detail=0)
    extracted_txt = " ".join(result)
    cleaned_text = re.sub(r'[^a-zA-Z0-9.,:/()%\- ]', '',extracted_txt).strip()

    return {'ocr_report': cleaned_text}

# prescription node function
def prescription_report(state:MedicalState):
    text=state['ocr_report']
    prompt=f"""You are an AI Prescription Analyzer.

Analyze the extracted prescription text carefully.

Prescription Text:
{text}

Return the response in the following format:

## Medicines Detected
- Mention medicine names.

## Possible Uses
- Explain the likely purpose of each medicine.

## Important Precautions
- Mention important precautions or general safety advice.

Guidelines:
- Keep the response simple and professional.
- Ignore noisy or broken OCR text.
- Do not generate false medical claims.
"""
    response=llm.invoke(prompt).content
    return {'answer':response}

# final report
def final_report(state:MedicalState):
    report_text=state['ocr_report']
    prompt=f"""You are an AI Medical Report Analyzer.

Analyze the following OCR medical report carefully.

Ignore:
- hospital headers
- phone numbers
- broken OCR text
- random symbols

Focus only on:
- patient condition
- symptoms
- abnormal findings
- medical advice

Medical Report:
{report_text}

Return response in this format:

## Summary
...

## Abnormal Findings
...

## Possible Meaning
...

## Advice
...

Keep answer clean, short, and professional.
"""
    res=llm.invoke(prompt).content
    return {'answer':res}

# condtional router node
def decide_next_node(state: MedicalState):

    category = state['category']

    if category == 'symptom':

        return 'symptoms'

    elif category == 'prescription':

        return 'ocr'

    elif category == 'report':

        return 'ocr'

    return 'chat'

# ************************************* OCR ROUTER *****************************************
def ocr_decision(state: MedicalState):

    query = state['query'].lower()

    if 'prescription' in query:

        return 'prescriptions'

    return 'report'


# ************************************* Graph Design *********************************************
graph=StateGraph(MedicalState)
# add nodes
graph.add_node('router',router_agent)
graph.add_node('symptoms',symptom_agent)
graph.add_node('chat',general_chat)
graph.add_node('ocr',ocr_text)
graph.add_node('prescriptions',prescription_report)
graph.add_node('report',final_report)
# add edges
graph.add_edge(START,'router')
graph.add_conditional_edges('router', decide_next_node ,
        {'symptoms':'symptoms',
         'ocr': 'ocr',
          'chat':'chat'
         })
graph.add_conditional_edges(
    'ocr',ocr_decision,
    {
        'prescriptions': 'prescriptions',
        'report': 'report'
    }
)
graph.add_edge('symptoms', END)
graph.add_edge('chat', END)
graph.add_edge('prescriptions', END)
graph.add_edge('report', END)

medical=graph.compile()

# ************************************* Connect backend ************************************
# Create uploads folder
UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/MedicalChat")
def medical_chat(query:str=Form(...),file:UploadFile=File(None)):
    try:
        image_path = ""
        # Save uploaded file
        if file:

            image_path = os.path.join(UPLOAD_DIR,file.filename)

            with open(image_path, "wb") as buffer:

                shutil.copyfileobj(file.file,buffer)

        result=medical.invoke(
            {
                'query':query,
                'image_path':image_path
            }
        )
        return {
            'router':result.get('router',''),
            'category':result.get('category',''),
            'ocr_report':result.get('ocr_report',''),
            'answer':result.get('answer','')
        }
    except Exception as e:
        return {"error": str(e)}
