document.addEventListener("DOMContentLoaded", () => {
  const messageBar = document.querySelector(".bar-wrapper input");
  const sendBtn = document.querySelector(".bar-wrapper button:not(#resetBtn)");
  const resetBtn = document.getElementById("resetBtn");
  const messageBox = document.querySelector(".message-box");

  const API_URL = "https://annalyza-api-v1-zx6inyq3yq-uc.a.run.app/v1/website-bot";

  // Generate or retrieve a unique session ID for this device
  let sessionID = localStorage.getItem('sessionID');
  if (!sessionID) {
    sessionID = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionID', sessionID);
  }

  // Load messages from localStorage  
  loadMessages();

  sendBtn.addEventListener("click", sendMessage);
  resetBtn.addEventListener("click", resetMessages);
  messageBar.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  async function sendMessage() {
    if (messageBar.value.trim().length > 0) {
      const userTypedMessage = messageBar.value.trim();
      messageBar.value = "";

      appendUserMessage(userTypedMessage);
      appendBotResponsePlaceholder();

      try {
        const botResponse = await fetchBotResponse(userTypedMessage);
        updateBotResponse(botResponse);
      } catch (error) {
        displayErrorMessage();
      }
    }
  }

  function appendUserMessage(message) {
    const userMessageHtml = `
      <div class="chat message fade-in">
        <span>${message}</span>
      </div>`;
    messageBox.insertAdjacentHTML("beforeend", userMessageHtml);
    saveMessages();
    scrollToBottom();
  }

  function appendBotResponsePlaceholder() {
    const responsePlaceholderHtml = `
      <div class="chat response fade-in">
        <span class="new">...</span>
      </div>`;
    messageBox.insertAdjacentHTML("beforeend", responsePlaceholderHtml);
    saveMessages();
    scrollToBottom();
  }

  async function fetchBotResponse(userMessage) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      sessionID: sessionID,
      message: userMessage,
      history: messageBox.innerHTML
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(API_URL, requestOptions);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    return result["ai-answer"];
  }

  function updateBotResponse(responseMessage) {
    const chatBotResponseElement = document.querySelector(".response .new");
    if (chatBotResponseElement) {
      chatBotResponseElement.innerHTML = responseMessage;
      chatBotResponseElement.classList.remove("new");
      saveMessages();
    }
  }

  function displayErrorMessage() {
    const chatBotResponseElement = document.querySelector(".response .new");
    if (chatBotResponseElement) {
      chatBotResponseElement.innerHTML = "Oops! An error occurred. Please try again.";
      chatBotResponseElement.classList.remove("new");
      saveMessages();
    }
  }

  function scrollToBottom() {
    messageBox.scrollTop = messageBox.scrollHeight;
  }

  function saveMessages() {
    localStorage.setItem(`chatMessages-${sessionID}`, messageBox.innerHTML);
  }

  function loadMessages() {
    const savedMessages = localStorage.getItem(`chatMessages-${sessionID}`);
    if (savedMessages) {
      messageBox.innerHTML = savedMessages;
      scrollToBottom();
    }
  }

  function resetMessages() {
    localStorage.removeItem(`chatMessages-${sessionID}`);
    messageBox.innerHTML = "";
    location.reload(); 
  }
});
