import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.config import settings

class RAGService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash-lite", 
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
            max_retries=1
        )
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2", 
            google_api_key=settings.GEMINI_API_KEY
        )
        self.retrieval_chain = None
        self._initialize_knowledge_base()

    def _initialize_knowledge_base(self):
        try:
            loader = WebBaseLoader("https://dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list.html")
            docs = loader.load()
            
            # Use smaller chunks for better retrieval
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            
            # Using docs[:50] to prevent memory overflow during local development, similar to SE_Project
            final_documents = text_splitter.split_documents(docs[:50])
            
            vectors = FAISS.from_documents(final_documents, self.embeddings)
            retriever = vectors.as_retriever()
            
            prompt = ChatPromptTemplate.from_template(
                """
                You are MediHelp, an AI Medical Assistant integrated into MediVault.
                Answer the user's questions based on the provided context and the chat history. 
                If the user's question refers to a previous topic (e.g., "what medication can I take for it"), use the <chat_history> to determine what they are referring to.
                If the answer is not in the context, use your general medical knowledge but state clearly that you are providing general information.
                Please provide the most accurate response based on the question.
                
                SOURCES & REFERENCES: You do NOT need to mention your sources unless the user explicitly asks for them. If they do ask where you get your information, provide a natural, conversational answer explaining that you reference the Illinois Department of Public Health (IDPH) database (https://dph.illinois.gov/topics-services/diseases-and-conditions) and supplement it with general medical knowledge from authorities like the CDC or WHO for specific treatments. Do not use robotic or technical terms like "RAG architecture" or "internal system context" excessively; just sound like a smart, helpful medical assistant citing its references.
                
                CRITICAL INSTRUCTION: Always format your response beautifully using Markdown. Do NOT use markdown headings (like # or ##). Instead, use **bold text** for section titles, and use bulleted lists to break down information (like symptoms, causes, or treatments) for high readability.
                
                <chat_history>
                {chat_history}
                </chat_history>
                
                <context>
                {context}
                </context>
                
                Question: {input}
                """
            )
            document_chain = create_stuff_documents_chain(self.llm, prompt)
            self.retrieval_chain = create_retrieval_chain(retriever, document_chain)
            print("RAG Knowledge Base initialized successfully.")
        except Exception as e:
            print(f"Error initializing RAG Knowledge Base: {e}")

    def ask(self, query: str, history: list = None) -> str:
        if not self.retrieval_chain:
            return "Knowledge base is still initializing or failed to load. Please try again later."
        
        try:
            formatted_history = "No previous history."
            if history:
                # Keep only the last 10 messages (5 turns) to prevent context window overflow
                recent_history = history[-10:]
                # Format history: filter out the initial welcome message and format correctly
                valid_msgs = [m for m in recent_history if m.content != "Hello! I am MediHelp AI. I'm connected to the Illinois Department of Public Health database. Ask me any medical questions!"]
                if valid_msgs:
                    formatted_history = "\n".join([f"{m.role.capitalize()}: {m.content}" for m in valid_msgs])
            
            response = self.retrieval_chain.invoke({
                "input": query,
                "chat_history": formatted_history
            })
            return response.get("answer", "I could not find an answer to your question.")
        except Exception as e:
            print(f"Error querying RAG: {e}")
            return f"An error occurred while analyzing your query: {e}"

rag_service = RAGService()
