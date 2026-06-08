import React from 'react';
import { createRoot } from 'react-dom/client';
import { CopilotChat, CopilotKitProvider } from '@copilotkit/react-core/v2';
import { HttpAgent } from '@ag-ui/client';
import './frame.css';

function getEndpointUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('endpoint') || '/ai-api/copilotkit-agui';
}

function App() {
  const endpointUrl = getEndpointUrl();
  const agent = React.useMemo(
    () => new HttpAgent({
      url: endpointUrl,
      agentId: 'default',
      description: 'LifeSuite Copilot Python AG-UI backend',
    }),
    [endpointUrl],
  );

  return React.createElement(
    CopilotKitProvider,
    {
      agents__unsafe_dev_only: { default: agent },
      selfManagedAgents: { default: agent },
      onError: ({ code, error, context }) => {
        console.error('[copilotkit]', code, error, context);
      },
    },
    React.createElement(
      'main',
      { className: 'react-shell' },
      React.createElement(CopilotChat, {
        agentId: 'default',
        labels: {
          modalHeaderTitle: 'React CopilotKit',
          welcomeMessageText: 'Ask LifeSuite Copilot',
          chatInputPlaceholder: 'Ask about learning, planning, or timers',
          thinking: 'Thinking',
        },
      }),
    ),
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(App));
}
