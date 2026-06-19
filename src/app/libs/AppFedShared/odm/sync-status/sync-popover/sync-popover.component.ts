import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AuthService} from '../../../../../auth/auth.service'
import {SyncStatus, SyncStatusService} from '../../sync-status.service'
// import {LearnStatsService} from '../../../../../apps/Learn/core/learn-stats.service'
import {OptionsService} from '../../../../../apps/Learn/core/options.service'
import {BaseComponent} from '../../../base/base.component'
import {CachedSubject} from '../../../utils/cachedSubject2/CachedSubject2'
import firebase from 'firebase/compat/app'
import User = firebase.User

@Component({
  standalone: false,
  selector: 'app-sync-popover',
  templateUrl: './sync-popover.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sync-popover.component.sass'],
})
export class SyncPopoverComponent extends BaseComponent implements OnInit {


  syncStatus$: CachedSubject<SyncStatus> = this.syncStatusService.syncStatus$

  authUser$: CachedSubject<User | null> = this.authService.authUser$

  constructor(
    public authService: AuthService,
    public syncStatusService: SyncStatusService,
    // public learnStatsService: LearnStatsService,
    public optionsService: OptionsService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  logIn() {
    this.authService.logInViaGoogle()
  }

  logOut() {
    this.authService.logout()
  }

  openOptions() {
    this.optionsService.openOptions()
  }

  toArray(t: any) {
    return Array.from(t)
  }
}
