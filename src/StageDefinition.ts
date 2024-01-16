export type StageDefinition = {
    showFirstNBubbles: number;
    bubbles: BubbleDefinition[];
    defaultVoice: string | undefined;
};

type BubbleDefinition = {
    img: string;
    sounds: (string | [string,string] | [string])[];
    color: [number,number,number];
};