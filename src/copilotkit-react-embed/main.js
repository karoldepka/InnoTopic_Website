import React from 'react';
import { createRoot } from 'react-dom/client';
import './frame.css';

function getApiBaseUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('apiBase') || '/ai-api';
}

function createEmptyTree() {
  return [];
}

async function postJson(apiBaseUrl, path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function getJson(apiBaseUrl, path) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

async function postEventStream(apiBaseUrl, path, body, onEvent) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (!response.body) {
    throw new Error('Backend did not return a readable stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const rawEvent of events) {
      const dataLines = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart());
      if (!dataLines.length) {
        continue;
      }
      onEvent(JSON.parse(dataLines.join('\n')));
    }
  }

  const finalText = decoder.decode();
  if (finalText) {
    buffer += finalText;
  }
  if (buffer.trim()) {
    const dataLines = buffer
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length) {
      onEvent(JSON.parse(dataLines.join('\n')));
    }
  }
}

function updateNode(nodes, nodeId, updater) {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }
    return {
      ...node,
      children: updateNode(node.children || [], nodeId, updater),
    };
  });
}

function deleteNode(nodes, nodeId) {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: deleteNode(node.children || [], nodeId),
    }));
}

function makeLocalNode(title = 'New category') {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    questionCount: 3,
    children: [],
  };
}

function addChildNode(nodes, parentId) {
  if (!parentId) {
    return [...nodes, makeLocalNode()];
  }
  return updateNode(nodes, parentId, (node) => ({
    ...node,
    children: [...(node.children || []), makeLocalNode()],
  }));
}

function countNodes(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);
}

function sumQuestionCounts(nodes) {
  return nodes.reduce((sum, node) => (
    sum + Number(node.questionCount || 0) + sumQuestionCounts(node.children || [])
  ), 0);
}

function decodeRecordText(text) {
  return String(text || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

function parseRecordAttributes(attributeText) {
  const attrs = {};
  for (const match of String(attributeText || '').matchAll(/([A-Za-z][A-Za-z0-9_]*)="([^"]*)"/g)) {
    attrs[match[1]] = decodeRecordText(match[2]);
  }
  return attrs;
}

function parseRecordTag(body, tagName) {
  const match = String(body || '').match(new RegExp(`<${tagName}>\\s*([\\s\\S]*?)\\s*</${tagName}>`, 'i'));
  return match ? decodeRecordText(match[1]) : '';
}

function parseCategoryRecordTree(text) {
  const records = [];
  for (const match of String(text || '').matchAll(/<NODE\s+([^>]*)>([\s\S]*?)<\/NODE>/gi)) {
    const attrs = parseRecordAttributes(match[1]);
    const title = parseRecordTag(match[2], 'TITLE');
    if (!title) {
      continue;
    }
    const id = attrs.id || `node-${records.length + 1}`;
    const matchedId = attrs.matchedId || null;
    records.push({
      id,
      parent: attrs.parent || '',
      title,
      questionCount: Math.max(0, Math.min(50, Number(attrs.questionCount || 3))),
      children: [],
      matchedExistingCategoryId: matchedId,
      matchedExistingCategoryTitle: parseRecordTag(match[2], 'MATCHED_TITLE') || null,
      isExistingCategory: attrs.existing === 'true' || Boolean(matchedId),
    });
  }

  const byId = new Map(records.map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];
  for (const record of records) {
    const node = byId.get(record.id);
    const parent = byId.get(record.parent);
    delete node.parent;
    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function parseQuestionRecordItems(text) {
  const seen = new Set();
  const items = [];
  for (const match of String(text || '').matchAll(/<ITEM\s+([^>]*)>([\s\S]*?)<\/ITEM>/gi)) {
    const attrs = parseRecordAttributes(match[1]);
    const item = {
      categoryId: attrs.categoryId || '',
      categoryPath: parseRecordTag(match[2], 'PATH'),
      question: parseRecordTag(match[2], 'QUESTION'),
      answer: parseRecordTag(match[2], 'ANSWER'),
    };
    const key = `${item.categoryId}|${item.categoryPath}|${item.question}`;
    if (!item.question || !item.answer || seen.has(key)) {
      continue;
    }
    seen.add(key);
    items.push(item);
  }
  return items;
}

function ChatMessage({ message }) {
  return React.createElement(
    'article',
    { className: `chat-message ${message.role}` },
    React.createElement('div', { className: 'chat-message-body' }, message.text || '...'),
  );
}

function CategoryNodeEditor({ node, depth, onRename, onCountChange, onAddChild, onDelete }) {
  return React.createElement(
    'div',
    { className: 'category-node stream-enter', style: { '--depth': depth } },
    React.createElement(
      'div',
      { className: 'category-row' },
      React.createElement('input', {
        className: 'category-title-input',
        value: node.title,
        onChange: (event) => onRename(node.id, event.target.value),
        'aria-label': `Category title ${node.title}`,
      }),
      node.isExistingCategory || node.matchedExistingCategoryId
        ? React.createElement('span', {
          className: 'existing-category-badge',
          title: node.matchedExistingCategoryTitle || node.matchedExistingCategoryId,
        }, 'existing')
        : React.createElement('span', { className: 'existing-category-spacer' }),
      React.createElement('input', {
        className: 'question-count-input',
        type: 'number',
        min: '0',
        max: '50',
        value: node.questionCount,
        onChange: (event) => onCountChange(node.id, Number(event.target.value)),
        title: 'Questions to generate',
        'aria-label': `Questions to generate for ${node.title}`,
      }),
      React.createElement(
        'button',
        {
          className: 'icon-button',
          type: 'button',
          title: 'Add subcategory',
          onClick: () => onAddChild(node.id),
        },
        '+',
      ),
      React.createElement(
        'button',
        {
          className: 'icon-button danger',
          type: 'button',
          title: 'Delete category',
          onClick: () => onDelete(node.id),
        },
        'x',
      ),
    ),
    (node.children || []).map((child) => React.createElement(CategoryNodeEditor, {
      key: child.id,
      node: child,
      depth: depth + 1,
      onRename,
      onCountChange,
      onAddChild,
      onDelete,
    })),
  );
}

function CategoryTreeEditor({ tree, onTreeChange, onConfirm, busy, existingCategoryCount }) {
  const nodeCount = countNodes(tree);
  const questionTotal = sumQuestionCounts(tree);

  function renameNode(nodeId, title) {
    onTreeChange(updateNode(tree, nodeId, (node) => ({ ...node, title })));
  }

  function changeQuestionCount(nodeId, questionCount) {
    const safeCount = Math.max(0, Math.min(50, Number.isFinite(questionCount) ? questionCount : 0));
    onTreeChange(updateNode(tree, nodeId, (node) => ({ ...node, questionCount: safeCount })));
  }

  return React.createElement(
    'section',
    { className: 'tree-panel' },
    React.createElement(
      'header',
      { className: 'panel-bar' },
      React.createElement('h2', null, 'Categories'),
      React.createElement('span', { className: 'metric' }, `${nodeCount} nodes`),
      React.createElement('span', { className: 'metric' }, `${questionTotal} Q&A`),
      React.createElement('span', { className: 'metric' }, `${existingCategoryCount} existing`),
    ),
    React.createElement(
      'div',
      { className: 'tree-actions' },
      React.createElement(
        'button',
        { type: 'button', className: 'secondary-button', onClick: () => onTreeChange(addChildNode(tree)) },
        '+ Root',
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'primary-button',
          disabled: busy || nodeCount === 0 || questionTotal === 0,
          onClick: onConfirm,
        },
        busy ? 'Generating...' : 'Confirm tree',
      ),
    ),
    React.createElement(
      'div',
      { className: 'tree-scroll' },
      tree.length
        ? tree.map((node) => React.createElement(CategoryNodeEditor, {
          key: node.id,
          node,
          depth: 0,
          onRename: renameNode,
          onCountChange: changeQuestionCount,
          onAddChild: (nodeId) => onTreeChange(addChildNode(tree, nodeId)),
          onDelete: (nodeId) => onTreeChange(deleteNode(tree, nodeId)),
        }))
        : React.createElement('div', { className: 'empty-tree' }, 'Type a topic in chat to generate a category tree.'),
    ),
  );
}

function QuestionPreview({
  items,
  modelName,
  status,
  logs,
  error,
  showAnswers,
  expandedAnswerKeys,
  onShowAnswersChange,
  onToggleAnswer,
}) {
  return React.createElement(
    'section',
    { className: 'questions-panel' },
    React.createElement(
      'header',
      { className: 'panel-bar' },
      React.createElement('h2', null, 'Generated Questions'),
      React.createElement(
        'label',
        { className: 'answer-toggle' },
        React.createElement('input', {
          type: 'checkbox',
          checked: showAnswers,
          onChange: (event) => onShowAnswersChange(event.target.checked),
        }),
        React.createElement('span', null, 'Show answers'),
      ),
      modelName ? React.createElement('span', { className: 'metric' }, modelName) : null,
    ),
    React.createElement(
      'div',
      { className: 'question-status' },
      React.createElement('strong', null, status || 'Idle'),
      error ? React.createElement('span', { className: 'question-error' }, error) : null,
      logs.length ? React.createElement(
        'ul',
        { className: 'question-log' },
        logs.slice(-8).map((log, index) => React.createElement('li', { key: `${log}-${index}` }, log)),
      ) : null,
    ),
    React.createElement(
      'div',
      { className: 'question-list' },
      items.length
        ? items.map((item, index) => {
          const answerKey = `${item.categoryId || item.categoryPath || 'question'}-${index}`;
          const answerVisible = showAnswers || expandedAnswerKeys.includes(answerKey);
          return React.createElement(
            'article',
            { className: 'question-card stream-enter', key: answerKey },
            React.createElement('div', { className: 'question-path' }, item.categoryPath || item.categoryId),
            React.createElement(
              'div',
              { className: 'question-row' },
              React.createElement('div', { className: 'question-text' }, item.question),
              React.createElement(
                'button',
                {
                  className: 'answer-expand-button',
                  type: 'button',
                  disabled: showAnswers,
                  onClick: () => onToggleAnswer(answerKey),
                  'aria-expanded': answerVisible,
                },
                answerVisible ? 'Hide' : 'Show',
              ),
            ),
            answerVisible
              ? React.createElement('div', { className: 'answer-text' }, item.answer || 'No answer returned.')
              : null,
          );
        })
        : React.createElement('div', { className: 'empty-tree' }, 'Confirmed trees will generate question previews here.'),
    ),
  );
}

function App() {
  const apiBaseUrl = React.useMemo(() => getApiBaseUrl(), []);
  const [tree, setTree] = React.useState(createEmptyTree);
  const [messages, setMessages] = React.useState([
    { role: 'assistant', text: 'Type a topic, then refine the generated tree conversationally.' },
  ]);
  const [input, setInput] = React.useState('');
  const [webSearch, setWebSearch] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [qaBusy, setQaBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [questions, setQuestions] = React.useState([]);
  const [modelName, setModelName] = React.useState('');
  const [questionStatus, setQuestionStatus] = React.useState('Idle');
  const [questionLogs, setQuestionLogs] = React.useState([]);
  const [questionError, setQuestionError] = React.useState('');
  const [existingCategories, setExistingCategories] = React.useState([]);
  const [showAnswers, setShowAnswers] = React.useState(false);
  const [expandedAnswerKeys, setExpandedAnswerKeys] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;
    getJson(apiBaseUrl, '/categories/existing')
      .then((response) => {
        if (!cancelled) {
          setExistingCategories(response.categories || []);
          console.log('[category-builder] loaded existing categories', response.categories || []);
        }
      })
      .catch((e) => {
        const message = e.message || `${e}`;
        console.error('[category-builder] failed to load existing categories', e);
        setError(`Could not load existing categories: ${message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  function addMessage(message) {
    setMessages((prev) => [...prev, message]);
  }

  function replaceMessage(messageId, text) {
    setMessages((prev) => prev.map((message) => (
      message.id === messageId
        ? { ...message, text }
        : message
    )));
  }

  function appendQuestionLog(message) {
    console.log('[category-builder]', message);
    setQuestionLogs((prev) => [...prev, message]);
  }

  function toggleAnswer(answerKey) {
    setExpandedAnswerKeys((prev) => (
      prev.includes(answerKey)
        ? prev.filter((key) => key !== answerKey)
        : [...prev, answerKey]
    ));
  }

  async function submitChat(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) {
      return;
    }

    setInput('');
    setBusy(true);
    setError('');
    const streamMessageId = `tree-stream-${Date.now()}`;
    let streamedTreeRecords = '';
    let streamedTreeNodeCount = 0;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: message },
      { id: streamMessageId, role: 'assistant', text: 'Receiving category records...' },
    ]);

    try {
      await postEventStream(apiBaseUrl, '/category-tree-stream', {
        message,
        tree,
        web_search: webSearch,
      }, (eventData) => {
        if (eventData.type === 'step') {
          addMessage({ role: 'activity', text: eventData.message });
        } else if (eventData.type === 'delta') {
          streamedTreeRecords += eventData.delta || '';
          const partialTree = parseCategoryRecordTree(streamedTreeRecords);
          const partialNodeCount = countNodes(partialTree);
          if (partialNodeCount > streamedTreeNodeCount) {
            streamedTreeNodeCount = partialNodeCount;
            setTree(partialTree);
            replaceMessage(streamMessageId, `Parsed ${partialNodeCount} category records from the stream...`);
          }
        } else if (eventData.type === 'result') {
          const response = eventData.result || {};
          setTree(response.tree || []);
          setModelName(response.modelName || '');
          replaceMessage(streamMessageId, response.assistantMessage || 'Updated the category tree.');
          addMessage({ role: 'activity', text: response.assistantMessage || 'Updated the category tree.' });
        } else if (eventData.type === 'error') {
          throw new Error(eventData.message || 'Category tree stream failed');
        }
      });
    } catch (e) {
      setError(e.message || `${e}`);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'I could not update the tree. Check the backend and Ollama, then try again.',
      }]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmTree() {
    setQaBusy(true);
    setError('');
    setQuestionError('');
    setQuestionStatus('Starting Q&A generation');
    setQuestionLogs([]);
    setQuestions([]);
    setExpandedAnswerKeys([]);
    const streamMessageId = `qa-stream-${Date.now()}`;
    let streamedQaRecords = '';
    let streamedQuestionCount = 0;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: 'Confirm tree and generate questions.' },
      { id: streamMessageId, role: 'assistant', text: 'Receiving Q&A records...' },
    ]);
    try {
      await postEventStream(apiBaseUrl, '/category-tree/questions-stream', {
        tree,
        web_search: webSearch,
      }, (eventData) => {
        console.log('[category-builder stream]', eventData);
        if (eventData.type === 'step') {
          setQuestionStatus(eventData.message);
          appendQuestionLog(eventData.message);
          addMessage({ role: 'activity', text: eventData.message });
        } else if (eventData.type === 'progress') {
          setQuestionStatus(eventData.message);
          appendQuestionLog(eventData.message);
          addMessage({ role: 'activity', text: eventData.message });
        } else if (eventData.type === 'delta') {
          streamedQaRecords += eventData.delta || '';
          const partialItems = parseQuestionRecordItems(streamedQaRecords);
          if (partialItems.length > streamedQuestionCount) {
            streamedQuestionCount = partialItems.length;
            setQuestions(partialItems);
            setQuestionStatus(`Parsed ${partialItems.length} Q&A records from the stream`);
            replaceMessage(streamMessageId, `Parsed ${partialItems.length} Q&A records from the stream...`);
          }
        } else if (eventData.type === 'result') {
          const response = eventData.result || {};
          setQuestions(response.items || []);
          setModelName(response.modelName || '');
          const generatedCount = (response.items || []).length;
          setQuestionStatus(`Generated ${generatedCount} questions`);
          replaceMessage(streamMessageId, `Generated ${generatedCount} questions.`);
          appendQuestionLog(`Generated ${generatedCount} questions`);
          if (!generatedCount) {
            setQuestionError('Backend returned 0 questions. Check the streamed raw response above.');
          }
          addMessage({ role: 'activity', text: `Generated ${generatedCount} questions.` });
        } else if (eventData.type === 'error') {
          throw new Error(eventData.message || 'Q&A stream failed');
        } else if (eventData.type === 'done') {
          appendQuestionLog('Stream finished');
        }
      });
    } catch (e) {
      const message = e.message || `${e}`;
      setError(message);
      setQuestionError(message);
      setQuestionStatus('Q&A generation failed');
      appendQuestionLog(`Error: ${message}`);
    } finally {
      setQaBusy(false);
    }
  }

  return React.createElement(
    'main',
    { className: 'category-workspace' },
    React.createElement(
      'section',
      { className: 'chat-panel' },
      React.createElement(
        'header',
        { className: 'panel-bar' },
        React.createElement('h1', null, 'Category Builder'),
        React.createElement(
          'label',
          { className: 'search-toggle' },
          React.createElement('input', {
            type: 'checkbox',
            checked: webSearch,
            onChange: (event) => setWebSearch(event.target.checked),
          }),
          React.createElement('span', null, 'Web search'),
        ),
      ),
      React.createElement(
        'div',
        { className: 'chat-scroll' },
        messages.map((message, index) => React.createElement(ChatMessage, {
          key: `${message.role}-${index}`,
          message,
        })),
      ),
      error ? React.createElement('div', { className: 'error-line' }, error) : null,
      React.createElement(
        'form',
        { className: 'chat-composer', onSubmit: submitChat },
        React.createElement('textarea', {
          value: input,
          rows: 3,
          placeholder: 'Generate a learning tree for Rust interview questions. Then: add more ownership subsubcategories.',
          onChange: (event) => setInput(event.target.value),
        }),
        React.createElement(
          'button',
          { className: 'primary-button send-button', type: 'submit', disabled: busy || !input.trim() },
          busy ? 'Thinking...' : 'Send',
        ),
      ),
    ),
    React.createElement(
      'div',
      { className: 'right-column' },
      React.createElement(CategoryTreeEditor, {
        tree,
        onTreeChange: setTree,
        onConfirm: confirmTree,
        busy: qaBusy,
        existingCategoryCount: existingCategories.length,
      }),
      React.createElement(QuestionPreview, {
        items: questions,
        modelName,
        status: questionStatus,
        logs: questionLogs,
        error: questionError,
        showAnswers,
        expandedAnswerKeys,
        onShowAnswersChange: setShowAnswers,
        onToggleAnswer: toggleAnswer,
      }),
    ),
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(App));
}
