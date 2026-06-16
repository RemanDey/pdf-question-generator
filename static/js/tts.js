var TextToSpeech = (function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  Text-to-Speech module using the Web Speech API                     */
  /*                                                                     */
  /*  Speaks the text one sentence at a time (chunked), tracking which   */
  /*  sentence we are on.  Pause calls cancel() and remembers the        */
  /*  sentence index.  Resume re-speaks that sentence and continues.     */
  /*  This avoids the unreliable onboundary / synth.pause() in Chrome.   */
  /*                                                                     */
  /*  IMPORTANT: state flags are always set BEFORE synth.cancel()        */
  /*  because onend can fire synchronously during cancel(). The onend     */
  /*  guard checks those flags so a cancel-triggered onend never         */
  /*  accidentally advances to the next chunk.                           */
  /* ------------------------------------------------------------------ */

  var synth = window.speechSynthesis;
  var utterance = null;
  var currentRate = 1;
  var isActivelySpeaking = false;
  var isCurrentlyPaused = false;

  /* ── Chunk tracking ───────────────────────────────────────────────── */

  var chunks = [];              /* one sentence per chunk                */
  var currentChunkIndex = 0;    /* index of the chunk being / to be read */
  var externalOnEnd = null;

  /* ── Feature detection ────────────────────────────────────────────── */

  function isSupported() {
    return "speechSynthesis" in window;
  }

  /* ── Helpers ──────────────────────────────────────────────────────── */

  function splitSentences(text) {
    var parts = text.match(/[^.!?\n]+[.!?\n]*/g);
    return parts && parts.length > 0 ? parts : [text];
  }

  /* ── Internal ─────────────────────────────────────────────────────── */

  function speakChunk() {
    if (currentChunkIndex >= chunks.length) {
      isActivelySpeaking = false;
      isCurrentlyPaused = false;
      if (externalOnEnd) {
        externalOnEnd();
      }
      return;
    }

    var chunkText = chunks[currentChunkIndex];

    utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.rate = currentRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = function () {
      /* If pause() or stop() was called, don't advance */
      if (isCurrentlyPaused || !isActivelySpeaking) return;
      currentChunkIndex += 1;
      speakChunk();
    };

    isActivelySpeaking = true;
    isCurrentlyPaused = false;
    synth.speak(utterance);
  }

  /* ── Core speech methods ──────────────────────────────────────────── */

  function speakText(text, options) {
    if (!isSupported()) return;

    stop();

    chunks = splitSentences(text);
    currentChunkIndex = 0;
    externalOnEnd = (options && options.onEnd) || null;

    if (options && options.rate !== undefined) {
      currentRate = options.rate;
    }

    speakChunk();
  }

  function pause() {
    if (!isSupported() || !isActivelySpeaking || isCurrentlyPaused) return;
    /* Set state BEFORE cancel – onend may fire synchronously */
    isActivelySpeaking = false;
    isCurrentlyPaused = true;
    synth.cancel();
  }

  function resume() {
    if (!isSupported() || !isCurrentlyPaused) return;

    if (currentChunkIndex >= chunks.length) {
      isCurrentlyPaused = false;
      return;
    }

    speakChunk();
  }

  function stop() {
    if (!isSupported()) return;
    /* Set state BEFORE cancel – onend may fire synchronously */
    isActivelySpeaking = false;
    isCurrentlyPaused = false;
    currentChunkIndex = 0;
    synth.cancel();
    utterance = null;
  }

  /* ── Status ───────────────────────────────────────────────────────── */

  function isSpeaking() {
    return isActivelySpeaking;
  }

  function isPaused() {
    return isCurrentlyPaused;
  }

  /* ── Speed control ────────────────────────────────────────────────── */

  function setRate(rate) {
    currentRate = rate;
  }

  function getRate() {
    return currentRate;
  }

  /* ── Voices ───────────────────────────────────────────────────────── */

  function getVoices() {
    if (!isSupported()) return [];
    return synth.getVoices();
  }

  /* ── Public API ───────────────────────────────────────────────────── */

  return {
    isSupported: isSupported,
    speakText: speakText,
    pause: pause,
    resume: resume,
    stop: stop,
    isSpeaking: isSpeaking,
    isPaused: isPaused,
    setRate: setRate,
    getRate: getRate,
    getVoices: getVoices,
  };
})();
