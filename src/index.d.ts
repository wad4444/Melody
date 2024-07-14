interface MelodySound extends Sound {
	Priority: number;
	readonly MuteOthers: boolean;
	Play(muteOthers?: boolean): void;
}

interface SoundManager {
	create: <T extends Record<string, string>>(obj: T) => { [P in keyof T]: () => MelodySound };
}

interface SoundCtor {
	new (instance: Instance): MelodySound;
}

export declare const Manager: SoundManager;
export declare const Sound: SoundCtor;
