from langchain_ollama import ChatOllama


def ask_question(db, question):

    llm = ChatOllama(
        model="llama3.1",
        temperature=0
    )


    docs = db.similarity_search(
        question,
        k=3
    )


    context = "\n\n".join(
        d.page_content for d in docs
    )


    prompt = f"""
        Answer only using the context.
        Context: {context}
        Question: {question}
        """

    result = llm.invoke(prompt)


    return result.content