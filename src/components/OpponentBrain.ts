type BrainInput = { defenderX: number; defenderZ: number; progress: number; time: number };
export type BrainDecision = { lane: number; hesitation: number; confidence: number };

const HIDDEN_WEIGHTS = [
  [.8, -.25, .6, .15], [-.7, .35, .45, -.2], [.25, .75, -.35, .4],
  [-.3, -.6, .8, .25], [.55, .2, .3, -.65], [-.15, .5, .7, .35],
];
const OUTPUT_WEIGHTS = [
  [.9, -.8, .35, -.3, .55, -.25],
  [-.2, .45, -.6, .8, -.35, .5],
  [.4, .3, -.2, .65, .5, .7],
];

export function runOpponentBrain(input: BrainInput): BrainDecision {
  const values = [input.defenderX / 6, input.defenderZ / 16, input.progress * 2 - 1, Math.sin(input.time * .0017)];
  const hidden = HIDDEN_WEIGHTS.map((weights, index) =>
    Math.tanh(weights.reduce((sum, weight, position) => sum + weight * values[position], index * .07 - .15)),
  );
  const output = OUTPUT_WEIGHTS.map((weights) =>
    Math.tanh(weights.reduce((sum, weight, position) => sum + weight * hidden[position], 0)),
  );
  return { lane: output[0] * 3.1, hesitation: Math.max(0, output[1]), confidence: (output[2] + 1) / 2 };
}
