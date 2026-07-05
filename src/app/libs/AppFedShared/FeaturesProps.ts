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
}
