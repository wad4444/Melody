/* eslint-disable roblox-ts/no-array-pairs */
import { Janitor } from "@rbxts/janitor";
import Lerps from "@rbxts/lerp-functions";

export enum VolumeChangeType {
	Instant,
	Smooth,
}

export class MelodySound {
	private static readonly playingSounds: MelodySound[] = [];

	private priority = 1;
	private muteOthers = false;
	private janitor = new Janitor();

	private volumeChangeThreads: thread[] = [];

	public VolumeChangeType = VolumeChangeType.Smooth;
	public MutedVolume = 0;
	public Volume: number;

	constructor(public readonly Instance: Sound) {
		this.Volume = this.Instance.Volume;
	}

	public Play(MuteOthers = false, Priority = this.priority) {
		this.muteOthers = MuteOthers;
		this.priority = Priority;
		MelodySound.playingSounds.push(this);
		MelodySound.updateAll();

		this.janitor.Add(this.Instance.Ended.Connect(() => this.removeSoundFromDirectory()));
		this.janitor.Add(this.Instance.Stopped.Connect(() => this.removeSoundFromDirectory()));
	}

	public Stop() {
		this.Instance.Stop();
	}

	public Pause() {
		this.Instance.Pause();
	}

	public Resume() {
		this.Instance.Resume();
	}

	public GetPriority() {
		return this.priority;
	}

	private removeSoundFromDirectory() {
		const index = MelodySound.playingSounds.indexOf(this);
		if (!index) return;

		MelodySound.playingSounds.remove(index);
		MelodySound.updateAll();
		this.janitor.Cleanup();
	}

	private update() {
		if (MelodySound.shouldMute(this)) {
			this.setVolume(this.MutedVolume);
		} else {
			this.setVolume(this.Volume);
		}
	}

	public SetVolume(NewVolume: number) {
		this.Volume = NewVolume;
		this.update();
	}

	private setVolume(NewVolume: number) {
		this.volumeChangeThreads.forEach((Thread) => task.cancel(Thread));
		this.volumeChangeThreads.clear();

		if (this.VolumeChangeType === VolumeChangeType.Instant) {
			this.Instance.Volume = NewVolume;
		} else if (this.VolumeChangeType === VolumeChangeType.Smooth) {
			this.volumeChangeThreads.push(
				task.spawn(() => {
					const lerp = Lerps.number(this.Volume, NewVolume);
					for (const t of $range(0, 1, 0.01)) {
						this.Instance.Volume = lerp(t);
						task.wait();
					}
				}),
			);
		}
	}

	private static updateAll() {
		MelodySound.playingSounds.forEach((Sound) => Sound.update());
	}

	private static shouldMute(Sound: MelodySound) {
		for (const [_, CurrentSound] of pairs(this.playingSounds)) {
			if (CurrentSound.priority > Sound.priority && CurrentSound.muteOthers) {
				return true;
			}
		}

		return false;
	}
}
