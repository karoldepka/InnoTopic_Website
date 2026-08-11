import {Injectable} from '@angular/core'
import {Router} from '@angular/router'
import {ThemeUiService} from '@innotopic/theme-ui-angular'
import {environment} from '../../../../environments/environment'
import {AuthService} from '../../../auth/auth.service'
import {LEARN_LIST_OPTIONS_LOCAL_STORAGE_KEY} from '../search-or-add-learnable-item/list-processing'
import {ListOptionsData} from '../search-or-add-learnable-item/list-options'
import {missionStatementsNodeIdFor} from '../../OrYoL/tree-model/TreeModel'

/** The two `action`-based (as opposed to plain-route) WhatNextDestination entries
 * (what-next-destination-ranking.ts) - pulled out of WhatNextPage so the side menu
 * (app.component.ts) can offer the exact same shortcuts without duplicating their logic. */
@Injectable({providedIn: 'root'})
export class WhatNextActionsService {

  constructor(
    private themeUiService: ThemeUiService,
    private router: Router,
    private authService: AuthService,
  ) {
  }

  /** GH issue #38: the fun-craving panic button - opens /learn's task/learn list pre-sorted by
   * fun descending, ROI descending, then importance descending (list-processing.ts's
   * `funCravingPanic` preset - shared with the same-named button in /learn's own list-options
   * panel). Writes the preset directly to the same localStorage key ListProcessing reads on
   * construction (there's no live instance of it here to patch - the target page's own
   * ListProcessing doesn't exist until /learn itself is navigated to). */
  async cravingFun(): Promise<void> {
    // TODO: popup with fancy image of doing smth fun. Piorun, spread wings.
    this.themeUiService.applyRandomTheme({includeExperimental: environment.showExperimentalThemes})
    const optionsPatch: Partial<ListOptionsData> = {preset: 'funCravingPanic'}
    localStorage.setItem(LEARN_LIST_OPTIONS_LOCAL_STORAGE_KEY, JSON.stringify(optionsPatch))
    await this.router.navigateByUrl('/learn')
  }

  /** Navigates straight to the built-in, per-user "Mission Statements" node's own URL
   * (TreeModel.missionStatementsNodeId/addVirtualChildOfRoot() - a virtual node, always there,
   * never needs creating) rather than plain '/tree' - TreeHostComponent recognizes this exact id
   * once it becomes the visual root and takes it from there (focusing + recursively expanding
   * whichever mission statement was written most recently). */
  whyBother(): void {
    void this.router.navigateByUrl(`/tree/${missionStatementsNodeIdFor(this.authService.userId)}`)
  }

}
