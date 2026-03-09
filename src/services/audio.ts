export function speak(text: string, onEnd?: () => void) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85; // Más lento para niños
    utterance.pitch = 1.1; // Tono amigable
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
}

export function listen(onResult: (text: string) => void, onError: () => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported, simulating success.");
    setTimeout(() => onResult("simulated_success"), 2000);
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
    onError();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Failed to start recognition", e);
    onError();
  }
}
