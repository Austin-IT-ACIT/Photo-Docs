import ollama
import streamlit as st

st.title("Local LLM Chat (Ollama)")

if "messages" not in st.session_state:
  st.session_state["messages"] = []

for msg in st.session_state["messages"]:
  with st.chat_message(msg["role"]):
    st.markdown(msg["content"])

if prompt := st.chat_input("Say something"):
  st.session_state["messages"].append({"role": "user", "content": prompt})
  with st.chat_message("user"):
    st.markdown(prompt)

  response = ollama.chat(
      model="llama3.2", messages=st.session_state["messages"]
  )
  assistant_message = response["message"]["content"]

  st.session_state["messages"].append(
      {"role": "assistant", "content": assistant_message}
  )
  with st.chat_message("assistant"):
    st.markdown(assistant_message)