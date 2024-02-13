/* eslint-disable roblox-ts/no-array-pairs */
import { RunService, SoundService } from "@rbxts/services";
import { MelodySound } from "./sound";
import { Clone, Make, Modify } from "@rbxts/altmake";

function createInvalidDirOutput() {
	return setmetatable(
		{},
		{
			__index: (_, index) => {
				throw `You cannot index this sound directory`;
			},
			__newindex: (_, index, value) => {
				throw `You cannot index this sound directory`;
			},
		},
	);
}

export namespace SoundManager {
	// eslint-disable-next-line prefer-const
	export let Origin: Instance = SoundService;
	// eslint-disable-next-line prefer-const
	export let AllowServer = false;
	export function fromInstance(Instance: Sound) {
		return () => new MelodySound(Instance);
	}

	export function fromInstanceDirectory<T extends Record<string, Sound>>(
		Directory: T,
	): Record<keyof T, () => MelodySound> {
		if (!AllowServer && RunService.IsServer())
			return createInvalidDirOutput() as Record<keyof T, () => MelodySound>;

		const soundDirectory = {} as Record<keyof T, () => MelodySound>;
		for (const [Name, Instance] of pairs(Directory)) {
			soundDirectory[Name as keyof T] = (DestroyOnEnd = true) => {
				const clonedInstance = Clone(Instance as Sound);
				DestroyOnEnd && clonedInstance.Ended.Connect(() => clonedInstance.Destroy());

				return new MelodySound(clonedInstance);
			};
		}

		return soundDirectory;
	}

	export function fromIdDirectory<T extends Record<string, string>>(
		Directory: T,
	): Record<keyof T, () => MelodySound> {
		if (!AllowServer && RunService.IsServer())
			return createInvalidDirOutput() as Record<keyof T, () => MelodySound>;

		const soundDirectory = {} as Record<keyof T, () => MelodySound>;
		for (const [Name, IdWithProps] of pairs(Directory)) {
			const [Id, Props] = typeIs(IdWithProps, "string")
				? [IdWithProps as string, undefined]
				: (IdWithProps as [string, InstanceProperties<Sound>?]);

			soundDirectory[Name as keyof T] = (DestroyOnEnd = true) => {
				const clonedInstance = Make("Sound", {
					Parent: Origin,
					SoundId: Id,
					...Props,
				});
				DestroyOnEnd && clonedInstance.Ended.Connect(() => clonedInstance.Destroy());

				return new MelodySound(clonedInstance);
			};
		}

		return soundDirectory;
	}

	export function memoize<T extends Record<string, (DestroyOnEnd: boolean) => MelodySound>>(
		directory: T,
	): Record<keyof T, MelodySound> {
		if (!AllowServer && RunService.IsServer()) return createInvalidDirOutput() as Record<keyof T, MelodySound>;

		const dir = {} as Record<keyof T, MelodySound>;
		for (const [i, v] of pairs(directory)) {
			dir[i as keyof T] = (v as (DestroyOnEnd: boolean) => MelodySound)(false);
		}

		return dir;
	}
}
