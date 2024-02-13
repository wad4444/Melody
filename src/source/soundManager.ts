/* eslint-disable roblox-ts/no-array-pairs */
import { SoundService } from "@rbxts/services";
import { MelodySound } from "./sound";
import { Clone, Make, Modify } from "@rbxts/altmake";

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
			soundDirectory[Name as keyof T] = (DestroyOnEnd = true) => {
				const clonedInstance = Clone(Instance as Sound);
				DestroyOnEnd && clonedInstance.Stopped.Connect(() => clonedInstance.Destroy());

				return new MelodySound(clonedInstance);
			};
		}

		return soundDirectory;
	}

	export function fromIdDirectory<T extends Record<string, string>>(
		Directory: T,
	): Record<keyof T, () => MelodySound> {
		const soundDirectory = {} as Record<keyof T, () => MelodySound>;
		for (const [Name, IdWithProps] of pairs(Directory)) {
			const instance = Make("Sound", {
				Parent: Origin,
			});

			if (typeIs(IdWithProps, "string")) {
				Modify(instance, {
					SoundId: IdWithProps,
				});
			} else if (typeIs(IdWithProps, "table")) {
				const [Id, Props] = IdWithProps as [string, InstanceProperties<Sound>?];
				Modify(instance, {
					SoundId: Id,
					...Props,
				});
			}

			soundDirectory[Name as keyof T] = (DestroyOnEnd = true) => {
				const clonedInstance = Clone(instance);
				DestroyOnEnd && clonedInstance.Stopped.Connect(() => clonedInstance.Destroy());

				return new MelodySound(clonedInstance);
			};
		}

		return soundDirectory;
	}

	export function memoize<T extends Record<string, (DestroyOnEnd: boolean) => MelodySound>>(
		directory: T,
	): Record<keyof T, MelodySound> {
		const dir = {} as Record<keyof T, MelodySound>;
		for (const [i, v] of pairs(directory)) {
			dir[i as keyof T] = (v as (DestroyOnEnd: boolean) => MelodySound)(false);
		}

		return dir;
	}
}
