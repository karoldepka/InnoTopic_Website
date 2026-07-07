export class FeaturesProps {
    enableAll = false

    /** Stuff that should be hidden before showing this app to end users - e.g. dev-only
     * navigation shortcuts. Independent of enableAll so it can be toggled on its own. */
    beforeProductization = false

    /** Gates the handful of app sections (journal, tasks, lifedvisor, estimating) that are
     * actually in personal daily use, independently of enableAll. */
    showWhatIUse = true

    /** Independent of enableAll - not yet wired to gate anything specific. */
    niceLooking = false

    /** Gates the mic/record button on `app-voice-memo-field` (Journal fields, OrYoL tree node
     * titles, Learn item sides) - independent of `voiceMemoPlaybackEnabled` so recording can be
     * turned off (e.g. mic permission issues on a given device) without losing the ability to
     * play back memos already recorded. */
    voiceMemoRecordingEnabled = true

    /** Gates playback (and the memo list itself) on `app-voice-memo-field` - independent of
     * `voiceMemoRecordingEnabled` above. */
    voiceMemoPlaybackEnabled = true
}
