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

    /** GH #106: Journal's list-view metric summary (e.g. "motivation: 3.75/5") shows each
     * numeric field's raw 0-10 stored value converted to a 0-5 scale instead of the raw value
     * itself - defaults on since this was the explicit ask, not an experiment; off falls back to
     * the previous raw "motivation: 7" display for comparison/rollback. */
    journalCompactStarRatings = true
}
