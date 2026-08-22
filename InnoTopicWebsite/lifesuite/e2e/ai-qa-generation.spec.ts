import {test, expect} from './fixtures'
import type {CategoryTreeResponse, QuestionAnswerResponse} from '../src/app/apps/Learn/core/ai-backend.service'

/**
 * Drives the /ai/qa page (category tree generation -> Q&A generation -> approve into Learn).
 * The real AI backend (backend-ts) isn't running in this dev environment, so all three
 * ai-api endpoints it calls are mocked via page.route() with canned responses shaped exactly
 * like the real backend's JSON (see ai-backend.service.ts's CategoryTreeResponse/
 * QuestionAnswerResponse). AiQaGeneratorService's StructuredObject reads the response body as a
 * stream, but a single complete non-chunked JSON body parses fine as "the whole stream arrived
 * at once" - no need to simulate token-by-token streaming here.
 */
test('generates a category tree, generates Q&A for it, and approving saves an AI-drafted item into Learn', async ({authenticatedPage: page}) => {
  const mockCategoryTree: CategoryTreeResponse = {
    tree: [
      {
        id: 'root-1',
        title: 'Rust Testing',
        questionCount: 0,
        children: [
          {id: 'cat-1', title: 'Ownership & Borrowing', questionCount: 2, children: []},
          {id: 'cat-2', title: 'Async Rust', questionCount: 1, children: []},
        ],
      },
    ],
    assistantMessage: 'Generated 3 categories',
    modelName: 'mock-model',
  }

  const uniqueQuestion = `What is the borrow checker? (e2e-${Date.now()})`
  const mockQuestions: QuestionAnswerResponse = {
    items: [
      {categoryId: 'cat-1', categoryPath: 'Rust Testing > Ownership & Borrowing', question: uniqueQuestion, answer: 'It enforces borrowing rules at compile time.'},
      {categoryId: 'cat-2', categoryPath: 'Rust Testing > Async Rust', question: 'What is a Future in Rust?', answer: 'A Future represents an asynchronous computation.'},
    ],
    modelName: 'mock-model',
  }

  // Registered before navigation so ngOnInit's loadExistingCategories() call is caught too.
  await page.route('**/ai-api/categories/existing', route =>
    route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({categories: []})})
  )
  await page.route('**/ai-api/category-tree/stream-json', route =>
    route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(mockCategoryTree)})
  )
  await page.route('**/ai-api/category-tree/questions/stream-json', route =>
    route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(mockQuestions)})
  )

  await page.goto('/ai/qa')

  // ---- Generate Categories ----
  await page.getByRole('button', {name: 'Rust', exact: true}).click()
  await page.getByRole('button', {name: 'Generate Categories'}).click()

  const catRows = page.locator('table.qa-tree .cat-row')
  await expect(catRows).toHaveCount(3, {timeout: 15_000})
  await expect(page.locator('input.cat-title[aria-label="Category: Ownership & Borrowing"]')).toBeVisible()
  await expect(page.locator('input.cat-title[aria-label="Category: Async Rust"]')).toBeVisible()

  // ---- Generate Q&A ----
  await page.getByRole('button', {name: 'Generate Q&A'}).click()

  const qCards = page.locator('article.q-card')
  await expect(qCards).toHaveCount(2, {timeout: 15_000})
  await expect(qCards.filter({hasText: uniqueQuestion})).toBeVisible()
  await expect(qCards.filter({hasText: 'What is a Future in Rust?'})).toBeVisible()

  // ---- Approve both -> persisted into Learn as bulk AI items ----
  // Newly-generated questions are auto-selected as they appear (see AiQaPage's constructor
  // effect), so both are already checked here - no need to touch "Select all questions" first.
  await page.getByRole('button', {name: 'Approve (2)'}).click()

  await expect(qCards).toHaveCount(0)
  const toast = page.locator('ion-toast')
  await expect(toast).toContainText('Approved 2 Q&A')
  // Let the toast fully run its 2.5s course before navigating away - app.component.ts's global
  // beforeunload handler preventDefault()s (aborting the navigation) while
  // syncStatusService.hasPendingUploads is true, and LearnItemItemsService.add()'s
  // saveNowToDb() (triggered by the approve click above) needs a moment to actually reach
  // Supabase. Navigating too early reproducibly hit net::ERR_ABORTED here.
  await expect(toast).toBeHidden({timeout: 5_000})

  // ---- Verify one of the approved Q&A landed in Learn, tagged as bulk AI-generated ----
  // waitUntil: 'commit' (not the default 'load') - same reasoning as fixtures.ts's post-login
  // navigation: this is a client-side SPA route change once bootstrapped, and waiting on a
  // real 'load' event here is flaky.
  await page.goto('/learn', {waitUntil: 'commit'})
  const learnItem = page.locator('.learn-list-item', {hasText: uniqueQuestion})
  await expect(learnItem).toBeVisible({timeout: 10_000})
  await expect(learnItem.locator('ion-badge', {hasText: 'AI Bulk'})).toBeVisible()
})
