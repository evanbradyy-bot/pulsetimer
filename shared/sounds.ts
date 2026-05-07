/**
 * Available sounds for timer intervals and completion
 */
export const SOUNDS = {
  bell: {
    name: "Bell",
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  chime: {
    name: "Chime",
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  beep: {
    name: "Beep",
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  ding: {
    name: "Ding",
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  buzzer: {
    name: "Buzzer",
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
} as const;

export type SoundKey = keyof typeof SOUNDS;

/**
 * Play a sound by key
 */
export async function playSound(soundKey: SoundKey) {
  try {
    const audio = new Audio(SOUNDS[soundKey].url);
    await audio.play();
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
}

/**
 * Create a simple beep sound using Web Audio API
 */
export function playBeep(frequency: number = 800, duration: number = 200) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.error("Failed to play beep:", error);
  }
}
