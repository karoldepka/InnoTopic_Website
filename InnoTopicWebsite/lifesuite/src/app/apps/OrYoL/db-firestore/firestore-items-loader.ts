import {DocumentReference, DocumentSnapshot} from 'firebase/firestore'


export abstract class FirestoreItemsLoader {

  abstract getItem$ByRef(itemRef: DocumentReference, callback: (includedItemDoc: DocumentSnapshot<any>) => void): any

}
