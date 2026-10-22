import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';

// Automatic screening of message board images. createRekognitionModerator
// asks AWS Rekognition what it sees; createNoopModerator (local dev) sees
// nothing. Either way scan(jpegBytes) -> [{ name, confidence }], and
// decide() turns that into ok / held / rejected.
//
// Rekognition is good at the obvious (explicit nudity, graphic violence,
// hate symbols) and imperfect at the edges -- it flags some swimwear and
// art, misses some cartoons and memes. So it's one layer: new accounts
// wait five days before uploading at all, moderators can hide anything,
// and the unsure middle goes to a person rather than being guessed.

// Category names across Rekognition's taxonomies (the 2023 one renamed
// several; either may come back).
const REJECT = new Set([
  'Explicit', 'Explicit Nudity', 'Explicit Sexual Activity', 'Sex Toys',
  'Graphic Violence', 'Graphic Violence Or Gore', 'Visually Disturbing', 'Hate Symbols',
]);
const REVIEW = new Set([
  ...REJECT,
  'Non-Explicit Nudity of Intimate parts and Kissing', 'Suggestive', 'Violence', 'Drugs & Tobacco',
  'Drugs', 'Rude Gestures',
]);
// Confident enough to refuse without a person looking.
const REJECT_AT = 90;
// Unsure enough that a person should.
const REVIEW_AT = 60;

export function decide(labels) {
  if (labels.some((l) => REJECT.has(l.name) && l.confidence >= REJECT_AT)) return 'rejected';
  if (labels.some((l) => REVIEW.has(l.name) && l.confidence >= REVIEW_AT)) return 'held';
  return 'ok';
}

export function createRekognitionModerator() {
  const client = new RekognitionClient({});
  return {
    async scan(jpeg) {
      const { ModerationLabels = [] } = await client.send(new DetectModerationLabelsCommand({
        Image: { Bytes: jpeg },
        MinConfidence: 50,
      }));
      // Both the label and its top-level category, so a rule on either
      // matches.
      const labels = [];
      for (const label of ModerationLabels) {
        labels.push({ name: label.Name, confidence: label.Confidence });
        if (label.ParentName) labels.push({ name: label.ParentName, confidence: label.Confidence });
      }
      return labels;
    },
  };
}

export function createNoopModerator() {
  return { async scan() { return []; } };
}
