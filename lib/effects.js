// Effets vidéo "à la Higgsfield" : chaque effet = un prompt envoyé à un modèle image→vidéo.
// Pour ajouter un effet : copie un bloc, change id / name / emoji / prompt.
// Pour afficher une vraie démo : mets un fichier dans public/effects/<id>.mp4 et écris preview: '/effects/<id>.mp4'.

export const EFFECTS_MODEL = 'kling-v2.1-standard-i2v';

export const EFFECTS = [
  { id: 'dolly-zoom', name: 'Dolly Zoom', emoji: '🎬', gradient: 'from-cyan-500/30 to-blue-600/30',
    prompt: 'Cinematic dolly zoom (vertigo effect): the camera pulls back while zooming in on the subject, the background stretches and warps dramatically, subject stays centered and sharp.' },
  { id: 'orbit-360', name: '360° Orbit', emoji: '🔄', gradient: 'from-violet-500/30 to-fuchsia-600/30',
    prompt: 'Smooth 360-degree camera orbit around the subject, the camera circles the subject slowly while keeping them in the center of the frame, cinematic lighting, high detail.' },
  { id: 'disintegrate', name: 'Disintegrate', emoji: '💨', gradient: 'from-orange-500/30 to-red-600/30',
    prompt: 'The subject slowly disintegrates into thousands of glowing dust particles that drift away in the wind, starting from the edges, dramatic cinematic lighting.' },
  { id: 'fire-burst', name: 'Fire Burst', emoji: '🔥', gradient: 'from-red-500/30 to-yellow-500/30',
    prompt: 'Flames ignite and swirl around the subject, embers float in the air, intense orange glow lights up the scene, the subject stays calm and unharmed, cinematic.' },
  { id: 'levitate', name: 'Levitate', emoji: '🪽', gradient: 'from-sky-400/30 to-indigo-500/30',
    prompt: 'The subject gently lifts off the ground and floats upward, hair and clothes drifting weightlessly, soft glowing light, dreamy cinematic atmosphere.' },
  { id: 'storm', name: 'Rain & Storm', emoji: '⛈️', gradient: 'from-slate-500/30 to-blue-800/30',
    prompt: 'Heavy rain begins to fall, dark storm clouds roll in, lightning flashes illuminate the scene, wind blows through the subject’s hair and clothes, moody cinematic look.' },
  { id: 'crash-zoom', name: 'Crash Zoom', emoji: '⚡', gradient: 'from-yellow-400/30 to-orange-600/30',
    prompt: 'Fast aggressive crash zoom into the subject’s face with slight camera shake and motion blur, then a sharp stop, high-energy action movie style.' },
  { id: 'hero-walk', name: 'Hero Walk', emoji: '🚶', gradient: 'from-emerald-500/30 to-teal-700/30',
    prompt: 'The subject walks confidently toward the camera in slow motion, wind in their hair, background softly blurred, low-angle tracking shot, epic cinematic.' },
  { id: 'push-in', name: 'Cinematic Push-in', emoji: '🎥', gradient: 'from-amber-400/30 to-rose-500/30',
    prompt: 'Slow cinematic push-in toward the subject with subtle parallax between foreground and background, soft natural motion, shallow depth of field.' },
  { id: 'wind', name: 'Wind & Hair', emoji: '🌬️', gradient: 'from-teal-400/30 to-cyan-600/30',
    prompt: 'A gentle breeze moves the subject’s hair and clothing, natural subtle blinking and breathing, light shifts softly across the scene, photorealistic portrait animation.' },
  { id: 'underwater', name: 'Underwater', emoji: '🌊', gradient: 'from-blue-500/30 to-cyan-700/30',
    prompt: 'The scene becomes submerged underwater: bubbles rise, hair and clothes float slowly, light rays shimmer from above, calm dreamy movement.' },
  { id: 'neon-glitch', name: 'Neon Glitch', emoji: '🌈', gradient: 'from-pink-500/30 to-purple-700/30',
    prompt: 'Cyberpunk neon glitch effect: RGB split flickers, scanlines and neon light pulses sweep across the subject, futuristic atmosphere, subtle camera movement.' },
];
