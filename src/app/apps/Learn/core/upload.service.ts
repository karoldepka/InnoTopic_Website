import { Injectable } from '@angular/core';
import {ref, uploadBytes} from 'firebase/storage'
import {Bytes, collection, doc, setDoc} from 'firebase/firestore'
import {v4 as uuid4} from 'uuid'
import {SyncStatusService} from '../../../libs/AppFedShared/odm/sync-status.service'
import {getAppFirestore, getAppStorage} from '../../../libs/AppFedSharedFirebase/firebase-app'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    protected syncStatusService: SyncStatusService,
  ) {
  }

  uploadAudio(blob: Blob) {
    console.log(`blob.size`, blob.size)
    // Create a root reference
    const storageRef = ref(getAppStorage(), 'audio');

    const uploadTask = uploadBytes(ref(storageRef, uuid4() + '.ogg'), blob)
    this.syncStatusService.handleSavingPromise(uploadTask)
    // const audioRef = storageRef.child('audio_' + uuid4());
    // audioRef.uplo

    // var audioRef = storageRef.child('images/mountains.jpg');

// While the file names are the same, the references point to different files
//     mountainsRef.name === mountainImagesRef.name            // true
//     mountainsRef.fullPath === mountainImagesRef.fullPath    // false


  }

  async uploadAudio2(blob: Blob/*, id: any*/, id: string) {
    console.log(`blob.size`, blob.size)

    // blob.getBytes
    const int8Array = new Uint8Array(await (blob as any).arrayBuffer())
    console.log(`int8Array.byteLength`, int8Array.byteLength)
    const promise = setDoc(doc(collection(getAppFirestore(), 'LearnDoAudio'), id), {
      audio: Bytes.fromUint8Array(int8Array),
    })
    this.syncStatusService.handleSavingPromise(promise)
  }
}
