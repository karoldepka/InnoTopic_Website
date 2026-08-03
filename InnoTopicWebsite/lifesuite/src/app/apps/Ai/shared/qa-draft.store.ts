import { Injectable } from '@angular/core';
import type { CategoryNode, QuestionAnswer } from '../../Learn/core/ai-backend.service';

export interface QaDraft {
  topic: string;
  tree: CategoryNode[];
  questions: QuestionAnswer[];
  webSearch?: boolean;
  savedAt: number;
}

const DB_NAME = 'lifesuite-ai';
const DB_VERSION = 1;
const STORE = 'qa-drafts';
const DRAFT_KEY = 'current';

@Injectable({ providedIn: 'root' })
export class QaDraftStore {
  private readonly dbp: Promise<IDBDatabase> = openDb();

  async save(draft: QaDraft, key: string = DRAFT_KEY): Promise<void> {
    const db = await this.dbp;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(draft, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async load(key: string = DRAFT_KEY): Promise<QaDraft | null> {
    const db = await this.dbp;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as QaDraft) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async clear(key: string = DRAFT_KEY): Promise<void> {
    const db = await this.dbp;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
