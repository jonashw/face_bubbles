export type StageDefinition = {
    showFirstNBubbles: number;
    bubbles: BubbleDefinition[];
    defaultVoice: string | undefined;
};

type BubbleDefinition = {
    name: string;
    img: string;
    sounds: (string | [string,string] | [string])[];
    color: [number,number,number];
};