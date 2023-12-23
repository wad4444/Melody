/* eslint-disable roblox-ts/no-array-pairs */
import { SoundService } from "@rbxts/services";
import { MelodySound } from "./sound";

export namespace SoundManager {
	// eslint-disable-next-line prefer-const
	export let Origin: Instance = SoundService;
	export function fromInstance(Instance: Sound) {
		return () => new MelodySound(Instance);
	}

	export function fromInstanceDirectory<T extends Record<string, Sound>>(
		Directory: T,
	): Record<keyof T, () => MelodySound> {
		const soundDirectory = {} as Record<keyof T, () => MelodySound>;
		for (const [Name, Instance] of pairs(Directory)) {
			soundDirectory[Name as keyof T] = () => {
				return new MelodySound(Instance as Sound);
			};
		}

		return soundDirectory;
	}

	export function fromIdDirectory<
		T extends Record<string, { Id: string; Props?: InstanceProperties<Sound> } | string>,
	>(Directory: T): Record<keyof T, () => MelodySound> {
		const soundDirectory = {} as Record<keyof T, () => MelodySound>;
		for (const [Name, IdWithProps] of pairs(Directory)) {
			const instance = new Instance("Sound");
			instance.Parent = Origin;

			if (typeIs(IdWithProps, "string")) {
				instance.SoundId = IdWithProps;
			} else if (typeIs(IdWithProps, "table")) {
				const { Id, Props } = IdWithProps as { Id: string; Props?: InstanceProperties<Sound> };
				instance.SoundId = Id;

				if (Props) {
					for (const [Key, Value] of pairs(Props)) {
						instance[Key as never] = Value as never;
					}
				}
			}

			soundDirectory[Name as keyof T] = () => {
				return new MelodySound(instance);
			};
		}

		return soundDirectory;
	}
}
